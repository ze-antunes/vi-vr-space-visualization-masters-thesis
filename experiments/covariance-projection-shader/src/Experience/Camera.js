// import * as THREE from 'three'
import Experience from "./Experience";

export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.aframeScene = this.experience.aframeScene
        this.canvas = this.experience.canvas
        this.setInstance()
    }

    setInstance() {
        // Camera
        // Access the underlying Three.js camera object
        this.camera = this.aframeScene.camera
    }
}