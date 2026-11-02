// import * as THREE from 'three'
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import Experience from "../Experience";
import Globe from './Components/Globe';
import Room from './Components/Room';
import Panel from './Components/UI/Panel';
import Environment from './Environment';

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer
        this.vr = this.experience.vr
        this.aframeScene = this.experience.aframeScene
        this.resources = this.experience.resources
        this.globeView = this.experience.globeView
        this.roomView = this.experience.roomView
        this.rightHand = this.experience.rightHand
        this.leftHand = this.experience.leftHand
        this.currentConjunctionIndex = 0;
        this.conjunctions = [];
        this.data = this.experience.data

        // Setup
        this.conjunctionMenuOpen = true;

        // Wait for resources
        // when the resources are ready we can instanciate the environment
        this.resources.on('ready', () => {
            document.getElementById("loader").style.display = "none"

            //Setup
            this.globe = new Globe()
            this.room = new Room()
            this.setConjunctionsMenu()
            this.environment = new Environment()
            this.conjunctions.push(...Object.keys(this.data.conjunctions)); // Get the list of conjunctions
            // console.log(this.conjunctions[this.currentConjunctionIndex])
            this.globe.updateVisualization(this.conjunctions[this.currentConjunctionIndex]);
            this.room.updateVisualization(this.conjunctions[this.currentConjunctionIndex]);
        })

        // Listen for buttondown event on the left hand controller
        this.leftHand.addEventListener('buttondown', (e) => {
            // console.log('Left hand button down:', e.detail);
            if (e.detail.id == 5) {
                if (this.conjunctionMenuOpen && this.conjunctionsMenu) {
                    console.log('hide');
                    this.conjunctionsMenu.hide()
                }
                else if (this.conjunctionMenuOpen == false && this.conjunctionsMenu) {
                    console.log('show');
                    this.conjunctionsMenu.show()
                }

                // Toggle open state
                this.conjunctionMenuOpen = !this.conjunctionMenuOpen;
            }
        });

        // // Initialize the value and the max value
        // let intValue = 0;
        // let maxValue = 4;

        // document.addEventListener("keydown", function (e) {
        //     if (e.key === "e") {
        //         intValue = (intValue + 1) % (maxValue + 1);
        //     }
        //     if (e.key === "r") {
        //         intValue = (intValue - 1 + (maxValue + 1)) % (maxValue + 1);
        //     }
        //     console.log(intValue)
        // });

        this.leftHand.addEventListener('axismove', (e) => {
            console.log("logThumbstick", e.detail)
            if (e.detail.y > 0.95) { console.log("DOWN"); }
            if (e.detail.y < -0.95) { console.log("UP"); }
            if (e.detail.x < -0.95) { console.log("LEFT"); }
            if (e.detail.x > 0.95) { console.log("RIGHT"); }
        });
    }

    setConjunctionsMenu() {
        // console.log(this.data.conjunctions.length)
        this.conjunctionsMenu = new Panel("Conjunctions", "conjunctionCard", this.data.conjunctions.length)
        this.conjunctionsMenu.mesh.position.set(-1.4, 1.6, -1.2);
        this.conjunctionsMenu.mesh.rotation.y = 0.25;
        // this.conjunctionsMenu.mesh.scale.set(0.1, 0.1, 0.1)
        this.conjunctionsMenu.mesh.scale.set(0.5, 0.5, 0.5)
        this.conjunctionsMenu.setHeader()
        this.conjunctionsMenu.setGrid(this.data.conjunctions, 4)
        this.conjunctionsMenu.setViews()
    }

    update() {
        if (this.globe)
            this.globe.update()

        if (this.vr) {
            if (this.leftHand && this.conjunctionsMenu) {
                this.conjunctionsMenu.mesh.scale.set(0.1, 0.1, 0.1)
                this.conjunctionsMenu.mesh.position.set(this.leftHand.object3D.position.x + 0.1, this.leftHand.object3D.position.y, this.leftHand.object3D.position.z - 0.2)
                // console.log(this.rightHand.object3D.rotation)
                // this.conjunctionsMenu.mesh.rotation.set(this.leftHand.object3D.rotation.x - 55, this.leftHand.object3D.rotation.y + 180, 0)
                this.conjunctionsMenu.mesh.lookAt(this.camera.object3D.position.x, this.camera.object3D.position.y, this.camera.object3D.position.z)
            }
            if (this.rightHand && this.manoeuvresMenu) {
                this.manoeuvresMenu.mesh.scale.set(0.1, 0.1, 0.1)
                this.manoeuvresMenu.mesh.position.set(this.rightHand.object3D.position.x - 0.1, this.rightHand.object3D.position.y, this.rightHand.object3D.position.z - 0.2)
                // console.log(this.leftHand.object3D.rotation)
                // this.manoeuvresMenu.mesh.rotation.set(this.rightHand.object3D.rotation.x - 55, this.rightHand.object3D.rotation.y + 180, 0)
                this.manoeuvresMenu.mesh.lookAt(this.camera.object3D.position.x, this.camera.object3D.position.y, this.camera.object3D.position.z)
            }
        }
    }
}