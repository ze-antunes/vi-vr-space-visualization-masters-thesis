import * as THREE from 'three'
import { EARTH_RADIUS_METERS, toScene } from '../../Utils/SpatialMath.js'
import { propagateTwoBody } from '../../Utils/OrbitalMath.js'

// Two-body context with a moving solid trail around the supplied epoch.
export default class Trajectory {
    constructor(parent, color, state, { duration = 5400, step = 30, scale = 1 / EARTH_RADIUS_METERS } = {}) {
        const samples = propagateTwoBody([state.x, state.y, state.z, state.x_dot, state.y_dot, state.z_dot], duration, step)
        const points = samples.map(({ state }) => toScene(new THREE.Vector3(...state.slice(0, 3))).multiplyScalar(scale))
        this.mesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineDashedMaterial({ color, dashSize: 0.03, gapSize: 0.02 }))
        this.mesh.computeLineDistances()
        parent.add(this.mesh)
        const initial = [state.x, state.y, state.z, state.x_dot, state.y_dot, state.z_dot]
        const recent = [...propagateTwoBody(initial, -600, 10).reverse(), ...propagateTwoBody(initial, 600, 10).slice(1)]
        const trailPoints = recent.map(({ state }) => toScene(new THREE.Vector3(...state.slice(0, 3))).multiplyScalar(scale))
        this.trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(trailPoints), new THREE.LineBasicMaterial({ color }))
        this.trail.renderOrder = 1
        this.mesh.add(this.trail)
        this.setTime(0, 1)
    }
    setTime(seconds, direction = 1) {
        const index = THREE.MathUtils.clamp(Math.round((seconds + 600) / 10), 0, 120)
        const start = direction > 0 ? Math.max(0, index - 18) : index
        const end = direction > 0 ? index : Math.min(120, index + 18)
        this.trail.geometry.setDrawRange(start, end - start + 1)
    }
    destroy() {
        this.trail.geometry.dispose()
        this.trail.material.dispose()
        this.mesh.removeFromParent()
        this.mesh.geometry.dispose()
        this.mesh.material.dispose()
    }
}
