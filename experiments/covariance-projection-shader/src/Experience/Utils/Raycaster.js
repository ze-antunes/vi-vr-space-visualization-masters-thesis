import * as THREE from 'three'
import Experience from "../Experience"
import ThreeMeshUI from 'three-mesh-ui'
import VRControl from './VRControl'
import ConstNode from 'three/examples/jsm/nodes/core/ConstNode'

let vrControl = VRControl
let selectState = false;
let mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('pointerdown', () => {
    selectState = true;
});

window.addEventListener('pointerup', () => {
    selectState = false;
});

window.addEventListener('touchstart', (event) => {
    selectState = true;
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('touchend', () => {
    selectState = false;
    mouse.x = null;
    mouse.y = null;
});

export default class Raycaster {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.aframeScene = this.experience.aframeScene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.rightHand = this.experience.rightHand

        //Setup 
        this.objsToTest = [];
        this.open = false
        this.clicks = 0
        this.setInstance()
    }

    setInstance() {
        this.renderer = this.aframeScene.renderer
        this.camera = this.aframeScene.camera

        // console.log(this.experience.scene)
        vrControl = vrControl(this.renderer, this.camera, this.scene);

        this.scene.add(vrControl.controllerGrips[0], vrControl.controllers[0], vrControl.controllerGrips[1], vrControl.controllers[1]);

        vrControl.controllers[0].addEventListener('selectstart', () => {

            selectState = true;

        });
        vrControl.controllers[0].addEventListener('selectend', () => {

            selectState = false;

        });

        // vrControl.controllers[1].addEventListener('selectstart', () => {

        //     selectState = true;

        // });
        // vrControl.controllers[1].addEventListener('selectend', () => {

        //     selectState = false;

        // });

        // Access the raycaster component
        let raycasterComponent = this.rightHand.components.raycaster
        // console.log(this.rightHand.components.raycaster)

        this.raycaster = new THREE.Raycaster();
        this.raycaster = raycasterComponent.raycaster;

        // this.update()

    }

    update() {
        // Find closest intersecting object

        let intersect;

        if (this.renderer != undefined && this.renderer.xr.isPresenting) {

            vrControl.setFromController(0, this.raycaster.ray);
            // vrControl.setFromController(1, this.raycaster.ray);

            intersect = this.raycast();

            // Position the little white dot at the end of the controller pointing ray
            if (intersect) {
                vrControl.setPointerAt(0, intersect.point);
                // vrControl.setPointerAt(1, intersect.point);
            }

        } else if (mouse.x !== null && mouse.y !== null && this.renderer != undefined && this.raycaster != undefined) {

            this.raycaster.setFromCamera(mouse, this.camera);

            intersect = this.raycast();

        }

        // // TODO: Solve the intersection 
        // // Update threejs object intersection 
        // if (intersect && intersect.object.hasStates) {
        //     // console.log(intersect.object)
        //     let open = false
        //     if (selectState) {
        //         // console.log(true) 
        //         intersect.object.states.hovered.onSet()
        //         if (this.clicks <= 0) {
        //             open = !open
        //             this.clicks++
        //         }
        //     } else {
        //         // console.log(false)
        //         open = false
        //         // clicks = 1
        //     }
        //     // console.log("open: ", open)
        //     console.log("clicks: ", this.clicks)
        // }

        // // Update threejs object intersection 
        // if (intersect && intersect.object.hasStates) {
        //     // console.log(intersect.object)
        //     if (selectState) {
        //         if (this.open == false && this.clicks == 0) {
        //             this.open = true
        //             this.clicks++
        //             console.log(this.open, this.clicks)
        //         }
        //         if (this.open == true && this.clicks > 0) {
        //             this.open = false
        //             this.clicks = 0
        //             console.log(this.open, this.clicks)
        //         }
        //     }
        // }

        if (intersect && intersect.object.isUI) {

            if (selectState) {
                // Component.setState internally call component.set with the options you defined in component.setupState
                intersect.object.setState('selected');

            } else {

                // Component.setState internally call component.set with the options you defined in component.setupState
                intersect.object.setState('hovered');

            }

        }

        // Update non-targeted buttons state

        this.objsToTest.forEach((obj) => {

            if ((!intersect || obj !== intersect.object) && obj.isUI) {

                // Component.setState internally call component.set with the options you defined in component.setupState
                if (!obj.active)
                    obj.setState('idle');

            }

        });
    }

    raycast() {
        return this.objsToTest.reduce((closestIntersection, obj) => {

            let intersection = this.raycaster.intersectObject(obj, true);

            if (!intersection[0]) return closestIntersection;

            if (!closestIntersection || intersection[0].distance < closestIntersection.distance) {

                intersection[0].object = obj;

                return intersection[0];

            }

            return closestIntersection;

        }, null);
    }
}
