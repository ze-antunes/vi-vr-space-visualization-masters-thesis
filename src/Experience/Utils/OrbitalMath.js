import { MU_EARTH } from './SpatialMath.js'

function derivative(state) {
    const [x, y, z, vx, vy, vz] = state
    const radius = Math.hypot(x, y, z)
    if (radius === 0) throw new Error('An orbital state cannot be at the origin.')
    const acceleration = -MU_EARTH / radius ** 3
    return [vx, vy, vz, acceleration * x, acceleration * y, acceleration * z]
}

// Two-body demonstration only: no drag, J2, thrust, ephemerides or covariance propagation.
export function propagateTwoBody(initial, duration = 5400, step = 30) {
    if (!Array.isArray(initial) || initial.length !== 6 || !initial.every(Number.isFinite) ||
        !Number.isFinite(duration) || duration === 0 || !Number.isFinite(step) || step <= 0 || Math.ceil(Math.abs(duration) / step) > 10000) {
        throw new Error('Expected six SI state components, nonzero duration, positive step and at most 10000 integration steps.')
    }
    let state = [...initial]
    const points = [{ time: 0, state: [...state] }]
    let time = 0
    const shifted = (base, delta, scale) => base.map((value, index) => value + delta[index] * scale)
    while (Math.abs(time) < Math.abs(duration)) {
        const dt = Math.sign(duration) * Math.min(step, Math.abs(duration - time))
        const k1 = derivative(state)
        const k2 = derivative(shifted(state, k1, dt / 2))
        const k3 = derivative(shifted(state, k2, dt / 2))
        const k4 = derivative(shifted(state, k3, dt))
        state = state.map((value, index) => value + dt / 6 * (k1[index] + 2 * k2[index] + 2 * k3[index] + k4[index]))
        if (!state.every(Number.isFinite)) throw new Error('Orbital integration produced non-finite components.')
        time += dt
        points.push({ time, state: [...state] })
    }
    return points
}


export const stateArray = state => [state.x, state.y, state.z, state.x_dot, state.y_dot, state.z_dot]
export function stateAt(state, seconds) {
    if (seconds === 0) return stateArray(state)
    return propagateTwoBody(stateArray(state), seconds, Math.min(10, Math.abs(seconds))).at(-1).state
}

// Samples share absolute epochs. The candidate is anchored at its supplied TCA;
// the baseline chaser is transported from the baseline epoch to that same epoch.
export function epochDeltaSeconds(after, before) {
    const remainder = epoch => Number(`0.${(/\.(\d+)(?:Z|[+-]\d{2}:?\d{2})$/.exec(epoch)?.[1] ?? '').padEnd(3, '0').slice(3) || '0'}`) / 1000
    return (Date.parse(after) - Date.parse(before)) / 1000 + remainder(after) - remainder(before)
}

export function encounterState(conjunction, manoeuvre, offset = 0) {
    const baseline = conjunction.details
    const delta = manoeuvre ? epochDeltaSeconds(manoeuvre.collision_avoidance.tca, baseline.tca) : 0
    const target = stateAt(baseline.target.state_vector, delta + offset)
    const chaser = stateAt(baseline.chaser.state_vector, delta + offset)
    const candidate = manoeuvre ? stateAt(manoeuvre.collision_avoidance.state_vector_tca, offset) : null
    return { target, chaser, candidate, delta, offset }
}
