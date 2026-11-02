import * as THREE from 'three'
import Experience from '../../Experience'
import Covariance from './Covariance'
import ObjectPopup from './UI/ObjectPopup'
import { clone } from 'three/addons/utils/SkeletonUtils.js'

export default class Objects {
    constructor(view, htmlElement, resource, type, color, symbolSize = 0.075) {
        this.experience = new Experience()
        this.view = view
        this.type = type
        this.view.scale.setScalar(1)
        this.model = clone(resource.scene)
        this.model.traverse(child => {
            if (child.isMesh) child.material = new THREE.MeshBasicMaterial({ color })
        })
        this.model.updateMatrixWorld(true)
        const bounds = new THREE.Box3().setFromObject(this.model)
        const size = bounds.getSize(new THREE.Vector3())
        this.symbolSize = symbolSize
        this.model.scale.setScalar(symbolSize / Math.max(size.x, size.y, size.z, 0.001))
        const center = bounds.getCenter(new THREE.Vector3()).multiplyScalar(this.model.scale.x)
        this.model.position.sub(center)
        this.view.add(this.model)
        this.covariance = new Covariance(view, color)
        this.popup = new ObjectPopup(type, this.view)
        this.model.onActivate = () => this.popup.isOpen ? this.popup.hide() : this.popup.show()
        this.experience.raycaster.objsToTest.push(this.model)
    }

    setData(data) { this.popup.setData(data) }
    update() { this.popup.update() }
    destroy() { this.popup.destroy() }
}
