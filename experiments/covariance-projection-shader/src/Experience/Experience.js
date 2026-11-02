import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Stats from 'stats.js'
import Sizes from "./Utils/Sizes"
import Time from "./Utils/Time"
import Camera from "./Camera"
import Debug from './Utils/Debug'
import Resources from './Utils/Resources'
import Raycaster from './Utils/Raycaster'
import sources from './sources'
import Renderer from './Renderer'
import World from './World/World'

// console.log("THREE: ", THREE)

let instance = null

export default class Experience {
    constructor(aframeScene, scene, camera, rightHand, leftHand) {
        if (instance) {
            return instance
        }

        instance = this

        //Global acess
        window.experience = this

        // Setup 
        this.debug = new Debug()
        this.vr = window.location.hash == '#vr'
        this.stats = new Stats()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = scene
        this.aframeScene = aframeScene
        this.rightHand = rightHand
        this.leftHand = leftHand
        this.resources = new Resources(sources)
        this.camera = camera
        this.renderer = new Renderer()
        this.raycaster = new Raycaster()
        this.globeView = document.querySelector('#globe').object3D
        this.roomView = document.querySelector('#room').object3D
        // console.log(this.camera.object3D.position)

        // Debug
        if (this.debug.active) {
            this.stats.showPanel(0)
            document.body.appendChild(this.stats.dom)
        }

        // Data 
        this.resources.on('dataReady', () => {
            // Conjuctions Data
            this.data = this.resources.data

            this.world = new World()

            this.sizes.on('resize', () => {
                this.resize()
            })

            this.time.on('tick', () => {
                this.update()
            })
        })


    }

    resize() {
        this.renderer.resize()
    }

    update() {
        if (this.debug.active) {
            this.stats.begin()
            if (this.world)
                this.world.update()
            ThreeMeshUI.update()
            this.raycaster.update()
            this.stats.end()
        } else {
            if (this.world)
                this.world.update()
            ThreeMeshUI.update()
            this.raycaster.update()
        }
    }

    destroy() {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene 
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()

                for (let key in child.material) {
                    let value = child.material[key]

                    if (value && value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.renderer.dispose()

        if (this.debug.active) {
            this.debug.ui.destroy()
        }
    }
}