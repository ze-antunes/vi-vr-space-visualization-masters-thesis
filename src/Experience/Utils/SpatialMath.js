import { eigs } from 'mathjs'
import { Matrix4, Vector3 } from 'three'

export const EARTH_RADIUS_METERS = 6371000
export const MU_EARTH = 3.986004418e14 // m^3/s^2
const finite = (value) => typeof value === 'number' && Number.isFinite(value)

export function positionOf(state) {
    if (!state || !['x', 'y', 'z'].every(key => finite(state[key]))) {
        throw new Error('State vector requires finite x, y and z coordinates in metres.')
    }
    return new Vector3(state.x, state.y, state.z)
}

// Right-handed EME2000 (Z north) -> right-handed Three.js (Y up).
export const EME_TO_SCENE = new Matrix4().set(
    1, 0, 0, 0,
    0, 0, 1, 0,
    0, -1, 0, 0,
    0, 0, 0, 1
)

export function toScene(position) {
    return position.clone().applyMatrix4(EME_TO_SCENE)
}

export function localTransform(states, radius = 1.35, paddingMeters = 0) {
    if (!states.length || !finite(radius) || radius <= 0 || !finite(paddingMeters) || paddingMeters < 0) {
        throw new Error('Invalid local view bounds.')
    }
    const points = states.map(positionOf)
    const origin = points[0].clone().add(points[1] ?? points[0]).multiplyScalar(0.5)
    const extent = Math.max(1, ...points.map(point => point.distanceTo(origin) + paddingMeters))
    const scale = radius / extent
    return { origin, scale, map: state => toScene(positionOf(state).sub(origin)).multiplyScalar(scale) }
}

export function rtnBasis(state) {
    const radial = positionOf(state).normalize()
    const velocity = new Vector3(state.x_dot, state.y_dot, state.z_dot)
    if (![state.x_dot, state.y_dot, state.z_dot].every(finite) || radial.lengthSq() === 0) {
        throw new Error('RTN orientation requires a valid position and velocity.')
    }
    const normal = new Vector3().crossVectors(radial, velocity)
    if (normal.lengthSq() < 1e-20) throw new Error('RTN basis is undefined for radial motion.')
    normal.normalize()
    const transverse = new Vector3().crossVectors(normal, radial).normalize()
    return new Matrix4().makeBasis(radial, transverse, normal)
}

export function covarianceAxes(data, state, sigma = 1) {
    if (!data || data.is_valid === false || !finite(sigma) || sigma <= 0) throw new Error('Invalid covariance.')
    const fields = ['cr_r', 'ct_r', 'cn_r', 'ct_t', 'cn_t', 'cn_n']
    if (!fields.every(key => finite(data[key]))) throw new Error('Incomplete RTN position covariance.')
    const p = [
        [data.cr_r, data.ct_r, data.cn_r],
        [data.ct_r, data.ct_t, data.cn_t],
        [data.cn_r, data.cn_t, data.cn_n]
    ]
    const result = eigs(p)
    const tolerance = Math.max(1, ...result.values.map(Math.abs)) * 1e-12
    if (result.values.some(value => !finite(value) || value < -tolerance)) {
        throw new Error('Position covariance is not positive semidefinite.')
    }
    const vectors = result.eigenvectors.map(item => new Vector3(...item.vector).normalize())
    // Reflection does not change an ellipsoid, but a quaternion needs a proper rotation.
    if (new Vector3().crossVectors(vectors[0], vectors[1]).dot(vectors[2]) < 0) vectors[2].negate()
    const rotation = EME_TO_SCENE.clone().multiply(rtnBasis(state))
        .multiply(new Matrix4().makeBasis(...vectors))
    return { lengths: result.values.map(value => sigma * Math.sqrt(Math.max(0, value))), rotation }
}

// Orthographic projection of an ellipsoid: keep the corresponding 2x2
// covariance submatrix, rather than intersecting the ellipsoid with a plane.
export function projectedEllipse({ lengths, rotation }, u, v) {
    const r = rotation.elements
    const component = (row, column) => r[column * 4 + row]
    const entry = (a, b) => lengths.reduce((sum, length, k) => sum + length ** 2 * component(a, k) * component(b, k), 0)
    const a = entry(u, u), b = entry(u, v), d = entry(v, v)
    const spread = Math.hypot(a - d, 2 * b)
    const major = (a + d + spread) / 2
    // Cauchy-Binet avoids cancellation for the extremely thin supplied ellipsoids.
    let determinant = 0
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
        determinant += (lengths[i] * lengths[j] * (component(u, i) * component(v, j) - component(u, j) * component(v, i))) ** 2
    }
    return {
        radii: [Math.sqrt(Math.max(0, major)), Math.sqrt(major > 0 ? determinant / major : 0)],
        angle: Math.atan2(2 * b, a - d) / 2
    }
}

export function greenwichAngle(epoch) {
    const time = Date.parse(epoch)
    if (!Number.isFinite(time)) throw new Error('Invalid scenario epoch.')
    const jd = time / 86400000 + 2440587.5
    const days = jd - 2451545
    const t = days / 36525
    const degrees = 280.46061837 + 360.98564736629 * days + 0.000387933 * t * t - t * t * t / 38710000
    return ((degrees % 360 + 360) % 360) * Math.PI / 180
}

export function validateDataset(data) {
    if (!Array.isArray(data?.conjunctions) || data.conjunctions.length === 0) {
        throw new Error('The dataset must contain at least one conjunction.')
    }
    data.conjunctions.forEach((item, index) => {
        if (!item.target?.name || !item.chaser?.name || !Number.isFinite(Date.parse(item.details?.tca))) {
            throw new Error(`Conjunction ${index + 1} has incomplete metadata or TCA.`)
        }
        for (const role of ['target', 'chaser']) {
            positionOf(item.details[role]?.state_vector)
            covarianceAxes(item.details[role]?.covariance, item.details[role]?.state_vector)
        }
        if (!Array.isArray(item.manoeuvres)) throw new Error(`Conjunction ${index + 1} requires a manoeuvres array.`)
        item.manoeuvres.forEach(manoeuvre => {
            if (manoeuvre.reference_frame !== 'EME2000') throw new Error('Only EME2000 manoeuvres are supported.')
            positionOf(manoeuvre.collision_avoidance?.state_vector_tca)
            if (!Number.isFinite(Date.parse(manoeuvre.collision_avoidance.tca))) throw new Error('Invalid manoeuvre TCA.')
            if (!finite(manoeuvre.collision_avoidance.poc) || manoeuvre.collision_avoidance.poc < 0 || manoeuvre.collision_avoidance.poc > 1 ||
                !finite(manoeuvre.collision_avoidance.miss_distance?.total) || manoeuvre.collision_avoidance.miss_distance.total < 0 ||
                !finite(manoeuvre.sum_duration) || manoeuvre.sum_duration < 0) throw new Error('Invalid manoeuvre metrics.')
        })
        if (!finite(item.summary?.miss_distance_latest) || item.summary.miss_distance_latest < 0) throw new Error('Missing baseline miss distance.')
        if (item.summary.poc_latest != null && (!finite(item.summary.poc_latest) || item.summary.poc_latest < 0 || item.summary.poc_latest > 1)) throw new Error('Invalid baseline probability.')
    })
    return data
}
