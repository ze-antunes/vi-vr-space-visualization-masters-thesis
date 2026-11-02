import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from '../../../Experience'
import FontJSON from '../../../../fonts/Roboto-msdf.json'
import FontImage from '../../../../fonts/Roboto-msdf.png'
import Header from './Header'
import Grid from './Grid'
import Views from './Views'
import { disposeUI } from '../../../Utils/Dispose'

export default class Panel {
    constructor(title, cardType, maxCardsLength) {
        this.experience = new Experience()
        this.title = title
        this.cardType = cardType
        this.maxCardsLength = maxCardsLength
        this.isOpen = true
        this.mesh = new ThreeMeshUI.Block({
            backgroundColor: new THREE.Color("#121212"),
            justifyContent: 'center',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11,
            backgroundOpacity: 1,
        });

        this.mesh.scale.setScalar(0.5)
        this.experience.scene.add(this.mesh)
    }
    setHeader() { this.header = new Header(this.mesh, this.title, this.cardType, this) }
    setGrid(data, pageSize) { this.grid = new Grid(this, data, pageSize) }
    setViews() { this.views = new Views(this.mesh) }
    hide() { this.mesh.visible = false; this.isOpen = false }
    show() { this.mesh.visible = true; this.isOpen = true }
    destroy() {
        if (!this.mesh) return
        this.grid?.destroy()
        this.header?.destroy()
        disposeUI(this.mesh, this.experience.raycaster)
        this.mesh = null
    }
}
