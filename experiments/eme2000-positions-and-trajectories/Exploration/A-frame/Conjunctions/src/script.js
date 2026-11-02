import * as THREE from 'three';
import GUI from 'lil-gui';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CSG } from 'three-csg-ts';

let conjunctionData;

fetch("exp_conjunctions.json")
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        conjunctionData = data;
    })
    .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('There was a problem with the fetch operation:', error);
    });


// Debug object
let debugObject = {};

// Debug GUI
let gui = new GUI({
    width: 300,
    title: "Debug UI",
    closeFolders: true
});

// Get the A-Frame scene element
let aframeScene = document.querySelector('#myScene');
// console.log(aframeScene);

// Access the underlying Three.js scene object
let scene = aframeScene.object3D;
scene.castShadow = true;
scene.shadow = true;

// Get the A-Frame camera element
let aframeCamera = document.querySelector('#myCamera');

// Access the underlying Three.js camera object
let cameraComponent = aframeCamera.components;
let camera

/**
 * Sizes
 */
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Access the underlying Three.js renderer object
let renderer


setTimeout(() => {
    camera = cameraComponent.camera.camera;

    renderer = aframeScene.renderer;
    // renderer.shadowMap.enabled = true;
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // targetObject3D.children[0].geometry = targetCovarianceGeometry
    // targetObject3D.children[0].material.opacity = 0;
    // chaserObject3D.children[0].geometry = chaserCovarianceGeometry
    // chaserObject3D.children[0].rotation.set(2, 10, -3);
    // chaserObject3D.children[0].material.opacity = 0;
    // console.log(targetEntity)
}, 100)

window.addEventListener('keydown', (e) => {
    if (e.key == "h")
        gui.show(gui._hidden);
});

// Objects
// Target
AFRAME.registerComponent('three-js-target', {
    init: function () {
        let targetEntity = document.querySelector('#target');
        let targetObject3D = targetEntity.object3D;
        let targetMaterial = targetObject3D.children[0].material

        // console.log(targetEntity, targetObject3D) 
        targetObject3D.children[0].geometry = new THREE.SphereGeometry(.1, 24, 16);
        targetMaterial.color = new THREE.Color('#03fc28')
        targetObject3D.position.set(-0.7, 1, -1);
    }
});

let targetCovarianceGeometry = new THREE.SphereGeometry(0.5, 24, 16);
targetCovarianceGeometry.rotateZ(Math.PI / 2);
targetCovarianceGeometry.scale(2.3, .5, .4);

let ellipsoids2Material = new THREE.MeshStandardMaterial({
    color: '#03fc28',
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
});

let targetCovarianceMesh = new THREE.Mesh(targetCovarianceGeometry, ellipsoids2Material);
targetCovarianceMesh.position.set(-0.7, 1, -1);

AFRAME.registerComponent('three-js-target-covariance', {
    init: function () {
        let targetCovarianceEntity = document.querySelector('#targetCovariance');
        let targetCovarianceObject3D = targetCovarianceEntity.object3D;
        targetCovarianceObject3D.add(targetCovarianceMesh)
    }
});

// Chaser
AFRAME.registerComponent('three-js-chaser', {
    init: function () {
        let chaserEntity = document.querySelector('#chaser');
        let chaserObject3D = chaserEntity.object3D;
        let chaserMaterial = chaserObject3D.children[0].material

        // console.log(chaserEntity, chaserObject3D) 
        chaserObject3D.children[0].geometry = new THREE.SphereGeometry(.1, 24, 16);
        chaserMaterial.color = new THREE.Color('#0388fc')
        chaserObject3D.position.set(0.7, 1, -1);
    }
});

let chaserCovarianceGeometry = new THREE.SphereGeometry(0.5, 24, 16);
chaserCovarianceGeometry.rotateZ(Math.PI / 2);
chaserCovarianceGeometry.scale(2, 0.6, 2);

let chaserCovarianceMaterial = new THREE.MeshStandardMaterial({
    color: '#0388fc',
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
});

let chaserCovarianceMesh = new THREE.Mesh(chaserCovarianceGeometry, chaserCovarianceMaterial);
chaserCovarianceMesh.position.set(0.7, 1, -1);
chaserCovarianceMesh.rotation.set(2, 10, -3);


// Test 
let chaserCovarianceGeometryTest = new THREE.SphereGeometry(0.5, 24, 16);
chaserCovarianceGeometryTest.rotateZ(Math.PI / 2);
chaserCovarianceGeometryTest.scale(2, 0, 2);

let chaserCovarianceMaterialTest = new THREE.MeshStandardMaterial({
    color: '#0388fc',
    // wireframe: true,
    side: THREE.DoubleSide
});

let chaserCovarianceMeshTest = new THREE.Mesh(chaserCovarianceGeometryTest, chaserCovarianceMaterialTest);
chaserCovarianceMeshTest.position.set(0.7, 1, -1.999);
chaserCovarianceMeshTest.rotation.set(Math.PI * 0.5, 0, 0);

AFRAME.registerComponent('three-js-chaser-covariance', {
    init: function () {
        let chaserCovarianceEntity = document.querySelector('#chaserCovariance');
        let chaserCovarianceObject3D = chaserCovarianceEntity.object3D;
        chaserCovarianceObject3D.add(chaserCovarianceMesh)
        chaserCovarianceObject3D.add(chaserCovarianceMeshTest)
    }
});

// Target / Chaser Intersection
function checkTwoShapeIntersect(object1, object2) {
    /**
     * This function check if two object3d intersect or not
     * @param {THREE.Object3D} object1
     * @param {THREE.Object3D} object2
     * @returns {Boolean}
    */

    // Check for intersection using bounding box intersection test
    let bBox1 = new THREE.Box3().setFromObject(object1);
    let bBox2 = new THREE.Box3().setFromObject(object2);

    let intersection = bBox1.intersectsBox(bBox2);
    // let intersection = mesh1.geometry.boundingBox.intersectsBox(mesh2.geometry.boundingBox);

    if (intersection) { // The shape geometries intersect.
        console.log("intersection: yes")
        return true
    } else { // The shape geometries do not intersect.
        console.log("intersection: no")
        return false
    }
}

// checkTwoShapeIntersect(targetCovarianceObject3D, chaserCovarianceMesh)

targetCovarianceMesh.updateMatrix()
chaserCovarianceMesh.updateMatrix()

let intRes = CSG.intersect(targetCovarianceMesh, chaserCovarianceMesh);
intRes.material = new THREE.MeshBasicMaterial({
    color: 'red',
    side: THREE.DoubleSide
});
intRes.position.set(-0.7, 1, -1);
intRes.scale.set(0.999, 0.999, 0.999);
// scene.add(intRes)

let targetCovarianceEntity = document.querySelector('#targetCovariance');
let targetCovarianceObject3D = targetCovarianceEntity.object3D;
targetCovarianceObject3D.add(intRes)

//Update the intersection after changes
function handleIntersectionUpdate(xPos, object) {
    // Remove the intRes object from the scene
    scene.remove(intRes);
    // Dispose of the geometry to free up memory
    intRes.geometry.dispose();
    // Optionally, dispose of the material as well if it's not used elsewhere
    intRes.material.dispose();
    // Set intRes to null to remove references
    intRes = null;

    intRes = CSG.intersect(targetCovarianceMesh, chaserCovarianceMesh);
    console.log(intRes);
    intRes.material = new THREE.MeshBasicMaterial({
        color: 'red',
        side: THREE.DoubleSide
    });
    if (object == 0)
        intRes.position.set(xPos, 1, -1);
    if (object == 1) {
        intRes.position.set(targetCovarianceMesh.position.x, 1, -1);
    }
    intRes.scale.set(0.999, 0.999, 0.999);
    // scene.add(intRes)
    targetCovarianceObject3D.add(intRes)
}


// Walls 
// Floor 
let floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshStandardMaterial({ color: 'lightgrey' })
)
floor.rotation.x = - Math.PI * 0.5
// floor.castShadow = true; //default is false
floor.receiveShadow = true;

// Front Wall 
let frontW = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshStandardMaterial({ color: 'lightgrey' })
)
frontW.position.z = -2
frontW.position.y = 2
// frontW.castShadow = true; //default is false
frontW.receiveShadow = true;

// Back Wall 
let backW = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshStandardMaterial({ color: 'lightgrey' })
)
backW.rotation.y = Math.PI
backW.position.z = 2
backW.position.y = 2
// backW.castShadow = true; //default is false
backW.receiveShadow = true;

// Left Wall 
let leftW = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshStandardMaterial({ color: 'lightgrey' })
)
leftW.rotation.x = - Math.PI * 0.5
leftW.rotation.y = Math.PI * 0.5
leftW.position.x = -2
leftW.position.y = 2
// leftW.castShadow = true; //default is false
leftW.receiveShadow = true;

// Right Wall 
let rightW = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshStandardMaterial({ color: 'lightgrey' })
)
rightW.rotation.x = - Math.PI * 0.5
rightW.rotation.y = - Math.PI * 0.5
rightW.position.x = 2
rightW.position.y = 2
// rightW.castShadow = true; //default is false
rightW.receiveShadow = true;

scene.add(floor, frontW, backW, leftW, rightW)

//Lights
let lightsTweaks = gui.addFolder("Lights")
let ambientLight = new THREE.AmbientLight(0xffffff, .6)
lightsTweaks.add(ambientLight, 'intensity').min(0).max(3).step(0.001).name("ambientLight intensity")
scene.add(ambientLight)

// Point light 
let pointLight = new THREE.PointLight(0xffffff, 0.4, 100);
pointLight.position.set(1, 2, - 1.5);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.heightwidth = 1024
pointLight.shadow.camera.near = .1
pointLight.shadow.camera.far = 3

let pointSphereGeometry = new THREE.SphereGeometry(0.1, 24, 16);
let pointSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
let pointSphereMesh = new THREE.Mesh(pointSphereGeometry, pointSphereMaterial);
pointSphereMesh.position.set(1, 2, - 1.5);

lightsTweaks.add(pointLight, 'intensity').min(0).max(3).step(0.001).name("pointLight intensity")
lightsTweaks.add(pointLight.position, 'x').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.x = value })
lightsTweaks.add(pointLight.position, 'y').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.y = value })
lightsTweaks.add(pointLight.position, 'z').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.z = value })

let sphereSize = 1;
let pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
let pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightHelper.visible = false
pointLightCameraHelper.visible = false
scene.add(pointLightCameraHelper)
scene.add(pointLight, pointSphereMesh, pointLightHelper);

let targetTweaks = gui.addFolder("Target")
let chaserTweaks = gui.addFolder("Chaser")

targetTweaks
    .add(targetCovarianceMesh.position, 'x')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('x-pos')
    .onFinishChange((value) => {
        handleIntersectionUpdate(value, 0);
    })

chaserTweaks
    .add(chaserCovarianceMesh.position, 'x')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('x-pos')
    .onFinishChange((value) => {
        handleIntersectionUpdate(value, 1);
    })

/**
 * Animate
 */
let clock = new THREE.Clock()

let tick = () => {
    let elapsedTime = clock.getElapsedTime()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()