import * as THREE from 'three'
import { covarianceAxes } from '../../Utils/SpatialMath.js'

export default class Covariance {
    constructor(parent, color) {
        this.ellipsoid = new THREE.Mesh(
            new THREE.SphereGeometry(1, 24, 16),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })
        )
        this.ellipsoid.visible = false
        parent.add(this.ellipsoid)
    }

    update(data, state, scale, sigma = 1) {
        const { lengths, rotation } = covarianceAxes(data, state, sigma)
        this.ellipsoid.scale.set(...lengths.map(length => length * scale))
        this.ellipsoid.quaternion.setFromRotationMatrix(rotation)
    }
}
