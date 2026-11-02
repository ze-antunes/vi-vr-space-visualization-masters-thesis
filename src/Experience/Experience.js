import ThreeMeshUI from 'three-mesh-ui'
import Debug from './Utils/Debug'
import Resources from './Utils/Resources'
import Raycaster from './Utils/Raycaster'
import Time from './Utils/Time'
import sources from './sources'
import World from './World/World'
import { disposeScene } from './Utils/Dispose'

let instance = null

export default class Experience {
    constructor(aframeScene, scene, camera, rightHand, leftHand) {
        if (instance) return instance
        if (!aframeScene) throw new Error('The A-Frame scene is not ready.')
        instance = this
        window.experience = this
        this.aframeScene = aframeScene
        this.scene = scene
        this.camera = camera
        this.rightHand = rightHand
        this.leftHand = leftHand
        this.debug = new Debug()
        this.time = new Time()
        this.renderer = { renderer: aframeScene.renderer }
        this.renderer.renderer.setClearColor('#000011')
        this.globeView = document.querySelector('#globe').object3D
        this.roomView = document.querySelector('#room').object3D
        this.resources = new Resources(sources)
        this.raycaster = new Raycaster()
        this.ready = this.initialize()
    }

    async initialize() {
        try {
            await this.resources.ready
            if (this.destroyed) return
            this.data = this.resources.data
            this.world = new World()
            this.world.initialize()
            this.initialized = true
            document.getElementById('loader').hidden = true
        } catch (error) {
            if (this.destroyed) return
            console.error(error)
            const loader = document.getElementById('loader')
            loader.classList.add('failed')
            document.getElementById('loading-error').textContent = `Unable to load the experience. ${error.message}`
            document.getElementById('retry').hidden = false
        }
    }

    update(time, delta) {
        if (!this.initialized || this.destroyed) return
        this.time.update(time, delta)
        this.world.update()
        ThreeMeshUI.update()
        this.raycaster.update()
    }

    destroy() {
        if (this.destroyed) return
        this.destroyed = true
        this.initialized = false
        this.raycaster.destroy()
        this.world?.destroy()
        disposeScene(this.globeView)
        disposeScene(this.roomView)
        this.globeView.clear()
        this.roomView.clear()
        this.resources.destroy()
        this.debug.ui?.destroy()
        window.experience = null
        instance = null
        // A-Frame owns the renderer and its XR animation loop.
    }
}
