import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { Vector3, Matrix4 } from 'three'
import { EME_TO_SCENE, covarianceAxes, localTransform, toScene, validateDataset, MU_EARTH, greenwichAngle, projectedEllipse } from '../src/Experience/Utils/SpatialMath.js'
import { propagateTwoBody, stateAt, encounterState, epochDeltaSeconds } from '../src/Experience/Utils/OrbitalMath.js'
import { encounterBounds, localEncounter } from '../src/Experience/Utils/EncounterMath.js'
import { advancePlayback } from '../src/Experience/Utils/PlaybackMath.js'
import { pageWindow } from '../src/Experience/Utils/Pagination.js'

const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`)
const state = { x: 7000000, y: 0, z: 0, x_dot: 0, y_dot: 7500, z_dot: 0 }
const covariance = { cr_r: 9, ct_r: 2, cn_r: 1, ct_t: 16, cn_t: 3, cn_n: 25 }

test('scene conversion preserves handedness, lengths and north', () => {
    near(EME_TO_SCENE.determinant(), 1)
    assert.deepEqual(toScene(new Vector3(1, 2, 3)).toArray(), [1, 3, -2])
    near(toScene(new Vector3(-5, 7, 12)).length(), Math.hypot(-5, 7, 12))
})

test('local mapping preserves signed relative positions and distance ratios', () => {
    const states = [{ x: 100, y: -20, z: 30 }, { x: 90, y: -40, z: 60 }, { x: 110, y: 0, z: 0 }]
    const transform = localTransform(states)
    const a = transform.map(states[0]), b = transform.map(states[1]), c = transform.map(states[2])
    near(a.distanceTo(b) / a.distanceTo(c), 1)
    const difference = a.clone().sub(b).divideScalar(transform.scale)
    assert.ok(difference.distanceTo(new Vector3(10, -30, -20)) < 1e-8)
    const coincident = localTransform([{ x: 2, y: 2, z: 2 }, { x: 2, y: 2, z: 2 }])
    assert.deepEqual(coincident.map({ x: 2, y: 2, z: 2 }).toArray(), [0, 0, 0])
    assert.throws(() => localTransform([{ x: NaN, y: 0, z: 0 }]))
})

test('covariance reconstruction preserves all six components after RTN-to-scene rotation', () => {
    const { lengths, rotation } = covarianceAxes(covariance, state)
    near(rotation.determinant(), 1)
    const scaleSquared = new Matrix4().makeScale(...lengths.map(length => length * length))
    const reconstructed = rotation.clone().multiply(scaleSquared).multiply(rotation.clone().transpose())
    // This state has R=X, T=Y, N=Z: only the scene convention rotates the covariance.
    const p = new Matrix4().set(9, 2, 1, 0, 2, 16, 3, 0, 1, 3, 25, 0, 0, 0, 0, 1)
    const expected = EME_TO_SCENE.clone().multiply(p).multiply(EME_TO_SCENE.clone().transpose())
    reconstructed.elements.forEach((value, i) => near(value, expected.elements[i]))
    const doubled = covarianceAxes(covariance, state, 2)
    doubled.lengths.forEach((value, i) => near(value, lengths[i] * 2))
    assert.throws(() => covarianceAxes({ ...covariance, cr_r: -10 }, state), /positive semidefinite/)
    assert.throws(() => covarianceAxes(covariance, { ...state, y_dot: 0 }), /undefined/)
})

test('the shipped sample validates and optional PoC remains unavailable', () => {
    const data = JSON.parse(fs.readFileSync(new URL('../static/conjunctions.json', import.meta.url)))
    assert.equal(validateDataset(data).conjunctions.length, 4)
    assert.equal(data.conjunctions[1].summary.poc_latest, undefined)
    assert.throws(() => validateDataset({ conjunctions: [] }))
    const changed = structuredClone(data)
    changed.conjunctions[0].manoeuvres[0].reference_frame = 'UNKNOWN'
    assert.throws(() => validateDataset(changed), /EME2000/)
})

test('pagination reaches the final records and clamps both ends', () => {
    assert.deepEqual(pageWindow(100, 7, 98), { start: 98, end: 100, previous: true, next: false })
    assert.equal(pageWindow(100, 7, 1000).start, 98)
    assert.equal(pageWindow(100, 7, -7).start, 0)
    assert.deepEqual(pageWindow(0, 7), { start: 0, end: 0, previous: false, next: false })
})

test('SI two-body propagation returns a circular orbit after one period', () => {
    const radius = 7000000
    const velocity = Math.sqrt(MU_EARTH / radius)
    const period = 2 * Math.PI * Math.sqrt(radius ** 3 / MU_EARTH)
    const samples = propagateTwoBody([radius, 0, 0, 0, velocity, 0], period, 10)
    const last = samples.at(-1)
    near(last.time, period, 1e-9)
    assert.ok(Math.hypot(last.state[0] - radius, last.state[1], last.state[2]) < 0.1)
    assert.ok(Math.abs(Math.hypot(...last.state.slice(3)) - velocity) < 0.001)
    assert.throws(() => propagateTwoBody([0, 0, 0, 0, 0, 0]))
    assert.throws(() => propagateTwoBody([radius, 0, 0, 0, velocity, 0], 1, 0))
})

test('GMST at J2000 is anchored to a known angle and validates dates', () => {
    near(greenwichAngle('2000-01-01T12:00:00Z') * 180 / Math.PI, 280.46061837)
    assert.throws(() => greenwichAngle('bad date'))
})


test('orthographic ellipses reconstruct covariance in all three receiving planes', () => {
    const axes = covarianceAxes(covariance, state, 3)
    const full = axes.rotation.clone().multiply(new Matrix4().makeScale(...axes.lengths.map(x => x * x))).multiply(axes.rotation.clone().transpose())
    for (const [u, v] of [[0, 1], [0, 2], [2, 1]]) {
        const { radii, angle } = projectedEllipse(axes, u, v)
        const c = Math.cos(angle), s = Math.sin(angle), [a, b] = radii.map(x => x * x)
        near(a * c * c + b * s * s, full.elements[u * 4 + u])
        near((a - b) * c * s, full.elements[v * 4 + u])
        near(a * s * s + b * c * c, full.elements[v * 4 + v])
    }
    // A long, thin ellipsoid must retain its minor radius, not lose it by subtraction.
    const thin = projectedEllipse({ lengths: [1e8, 1, 0.001], rotation: new Matrix4() }, 0, 1)
    near(thin.radii[0], 1e8)
    near(thin.radii[1], 1)
    assert.deepEqual(projectedEllipse({ lengths: [0, 0, 0], rotation: new Matrix4() }, 0, 1).radii, [0, 0])
})


test('signed propagation is reversible and epoch alignment retains sub-millisecond precision', () => {
    const original = [7000000, 0, 0, 0, Math.sqrt(MU_EARTH / 7000000), 0]
    const forward = propagateTwoBody(original, 300, 5).at(-1).state
    const back = propagateTwoBody(forward, -300, 5).at(-1).state
    original.forEach((value, i) => near(back[i], value, 0.001))
    near(epochDeltaSeconds('2024-07-06T05:06:25.692+00:00', '2024-07-06T05:06:25.469999+00:00'), 0.222001, 1e-12)
    const c = JSON.parse(fs.readFileSync(new URL('../static/conjunctions.json', import.meta.url))).conjunctions[0]
    const m = c.manoeuvres[0], sample = encounterState(c, m, 0)
    assert.deepEqual(sample.candidate, stateAt(m.collision_avoidance.state_vector_tca, 0))
    assert.deepEqual(sample.chaser, stateAt(c.details.chaser.state_vector, sample.delta))
})

test('moving encounter frame preserves simultaneous separation and shared display scales', () => {
    const c = JSON.parse(fs.readFileSync(new URL('../static/conjunctions.json', import.meta.url))).conjunctions[0]
    const bounds = encounterBounds(c)
    assert.ok(bounds.gain > 0 && bounds.gain < 1)
    assert.ok(bounds.positions.scale > bounds.physical.scale)
    for (const m of [c.manoeuvres[0], c.manoeuvres[99]]) for (const offset of [-0.5, 0, 0.5]) {
        const physical = encounterState(c, m, offset)
        const local = localEncounter(c, m, offset)
        const expected = new Vector3(...physical.candidate.slice(0, 3)).distanceTo(new Vector3(...physical.chaser.slice(0, 3)))
        const displayed = bounds.positions.map(local[2]).distanceTo(bounds.positions.map(local[1])) / bounds.positions.scale
        near(displayed, expected, 1e-6)
        local.filter(Boolean).forEach(state => assert.ok(bounds.positions.map(state).length() <= 1.120001))
    }
})


test('playback stops at endpoints or wraps without losing overshoot in either direction', () => {
    assert.deepEqual(advancePlayback(0.45, 0.2, 0.5, false), { time: 0.5, playing: false })
    assert.deepEqual(advancePlayback(-0.45, -0.2, 0.5, false), { time: -0.5, playing: false })
    near(advancePlayback(0.45, 0.2, 0.5, true).time, -0.35)
    near(advancePlayback(-0.45, -0.2, 0.5, true).time, 0.35)
    near(advancePlayback(0, 3.2, 0.5, true).time, 0.2)
    assert.equal(advancePlayback(0, 0.1, 0.5, false).playing, true)
})
