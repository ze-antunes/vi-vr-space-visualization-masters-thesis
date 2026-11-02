import { Vector3 } from 'three'
import { covarianceAxes, localTransform, positionOf } from './SpatialMath.js'
import { encounterState } from './OrbitalMath.js'

const states = new WeakMap()
export const asPosition = array => ({ x: array[0], y: array[1], z: array[2] })

export function localEncounter(conjunction, manoeuvre, offset = 0) {
    const sample = encounterState(conjunction, manoeuvre, offset)
    const anchor = positionOf(conjunction.details.target.state_vector)
    const movingOrigin = new Vector3(...sample.target.slice(0, 3))
    const relative = array => asPosition(new Vector3(...array.slice(0, 3)).sub(movingOrigin).add(anchor).toArray())
    return [relative(sample.target), relative(sample.chaser), sample.candidate ? relative(sample.candidate) : null]
}

export function encounterBounds(conjunction) {
    if (states.has(conjunction)) return states.get(conjunction)
    const baseline = [conjunction.details.target.state_vector, conjunction.details.chaser.state_vector]
    const samples = [...baseline]
    for (const manoeuvre of [null, ...conjunction.manoeuvres]) {
        for (const offset of [-0.5, 0, 0.5]) samples.push(...localEncounter(conjunction, manoeuvre, offset).filter(Boolean))
    }
    const padding = Math.max(...['target', 'chaser'].flatMap(role => covarianceAxes(conjunction.details[role].covariance, conjunction.details[role].state_vector, 3).lengths))
    const positions = localTransform(samples, 1.12)
    const physical = localTransform(samples, 1.12, padding)
    const gain = Math.min(1, (1 / positions.scale) * 0.25 / Math.max(padding, 1))
    const result = { positions, physical, gain }
    states.set(conjunction, result)
    return result
}
