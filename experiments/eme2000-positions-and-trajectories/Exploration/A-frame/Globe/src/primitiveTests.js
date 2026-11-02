import * as THREE from 'three';
import GUI from 'lil-gui'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Get the A-Frame scene element
let aframeScene = document.querySelector('#myScene');

// Access the underlying Three.js scene object
let scene = aframeScene.object3D;

const debugObject = {
}

// Debug 
let gui = new GUI({
    width: 300,
    title: "Debug UI",
    closeFolders: true
});
// gui.close()
// gui.hide()

window.addEventListener('keydown', (e) => {
    if (e.key == "h")
        gui.show(gui._hidden)
})

// Loader and Models
let gltfLoader = new GLTFLoader()
let globe
let globeTweaks = gui.addFolder("Globe")

// gltfLoader.load(
//     'https://raw.githubusercontent.com/ze-antunes/ARVI_Assets/main/3D_Models/earth_globe/scene.gltf',
//     (gltf) => {
//         console.log('success')
//         // console.log(gltf)

//         globe = gltf.scene.children[0].children[0].children[0].children[0]
//         globe.position.set(1, 1, -3);
//         globe.scale.set(0.05, 0.05, 0.05)

//         globeTweaks
//             .add(globe.position, 'x')
//             .min(-3)
//             .max(3)
//             .step(0.01)
//             .name('cube x-pos');

//         globeTweaks
//             .add(globe.position, 'y')
//             .min(1)
//             .max(3)
//             .step(0.01)
//             .name('cube y-pos');

//         globeTweaks
//             .add(globe.position, 'z')
//             .min(-3)
//             .max(3)
//             .step(0.01)
//             .name('cube z-pos');

//         debugObject.spin = () => {
//             gsap.to(globe.rotation, { y: globe.rotation.y + Math.PI * 2 })
//         }

//         globeTweaks.add(debugObject, 'spin')

//         // Access materials of the loaded GLTF model
//         globe.traverse((child) => {
//             if (child.isMesh && child.material.map && child.material.map.normalMap) {
//                 console.log(child.material); // log the material of each mesh
//                 let texture = new THREE.TextureLoader().load('assets/' + child.material.map.normalMap);
//                 let material = new THREE.MeshBasicMaterial({ map: texture });
//                 child.material = material

//                 globeTweaks
//                     .add(child.material, 'visible').name(`material id ${child.material.id}`);;
//             }
//         });

//         scene.add(globe)
//     },
//     (progress) => {
//         console.log('progress')
//         // console.log(progress)
//     },
//     (error) => {
//         console.log('error')
//         // console.log(error)
//     },
// )

/**
 * Object
 */
// Cube 
debugObject.color = "#e00000"
let cubeGeometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
let cubeMaterial = new THREE.MeshBasicMaterial({ color: debugObject.color });
let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
cubeMesh.position.set(-1, 1, -3);
scene.add(cubeMesh);

// Line
// let linePoints = []
// linePoints.push(new THREE.Vector3(-1, 1, 1))
// linePoints.push(new THREE.Vector3(0, 0, 0))
// linePoints.push(new THREE.Vector3(1, -1, -1))

// let lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints)
// let lineMaterial = new THREE.LineBasicMaterial({
//     color: 0xffffff,
//     linewidth: 10
// })
// let line = new THREE.Line(lineGeometry, lineMaterial)
// line.position.set(0, 1, -3)
// scene.add(line)

// Curved Line 
//Create a closed wavey loop
debugObject.segments = 20;
debugObject.points = {
    point1: { x: 2, y: 7, z: -5 },
    point2: { x: 0, y: 4, z: -5 },
    point3: { x: -2, y: 4, z: -5 }
};

console.log(debugObject.points.point1)

let curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(debugObject.points.point1.x, debugObject.points.point1.y, debugObject.points.point1.z),
    new THREE.Vector3(debugObject.points.point2.x, debugObject.points.point2.y, debugObject.points.point2.z),
    new THREE.Vector3(debugObject.points.point3.x, debugObject.points.point3.y, debugObject.points.point3.z),
]);

let curvePoints = curve.getPoints(debugObject.segments);
let curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

let curveMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

// Create the final object to add to the scene
let curveObject = new THREE.Line(curveGeometry, curveMaterial);
scene.add(curveObject)


// GUI  
let cubeTweaks = gui.addFolder("Cube")
let curveTweaks = gui.addFolder("Curve")
let pointsPositions = curveTweaks.addFolder("Points")
let point1 = pointsPositions.addFolder("Point 1")
let point2 = pointsPositions.addFolder("Point 2")
let point3 = pointsPositions.addFolder("Point 3")


cubeTweaks
    .add(cubeMesh.position, 'x')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('cube x-pos');

cubeTweaks
    .add(cubeMesh.position, 'y')
    .min(1)
    .max(3)
    .step(0.01)
    .name('cube y-pos');

cubeTweaks
    .add(cubeMesh.position, 'z')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('cube z-pos');

cubeTweaks
    .add(cubeMaterial, 'visible');

cubeTweaks
    .add(cubeMaterial, 'wireframe');

cubeTweaks
    .addColor(debugObject, 'color')
    .onChange(() => {
        cubeMaterial.color.set(debugObject.color)
    })


curveTweaks
    .add(debugObject, 'segments')
    .min(2)
    .max(20)
    .step(1)
    .name('curve segments')
    .onFinishChange((value) => {
        curvePoints = curve.getPoints(value);
        curveObject.geometry.dispose();
        curveObject.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    })

    
point1
    .add(debugObject.points.point1, 'x')
    .min(-10)
    .max(10)
    .step(0.1)
    .onChange((value) => {
        curve.points[0].x = value
        curvePoints = curve.getPoints(debugObject.segments);
        curveObject.geometry.dispose();
        curveObject.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    })

point1
    .add(debugObject.points.point1, 'y')
    .min(-10)
    .max(10)
    .step(0.1)
    .onChange((value) => {
        curve.points[0].y = value
        curvePoints = curve.getPoints(debugObject.segments);
        curveObject.geometry.dispose();
        curveObject.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    })

point1
    .add(debugObject.points.point1, 'z')
    .min(-10)
    .max(10)
    .step(0.1)
    .onChange((value) => {
        curve.points[0].z = value
        curvePoints = curve.getPoints(debugObject.segments);
        curveObject.geometry.dispose();
        curveObject.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    })

point2
    .add(debugObject.points.point2, 'x')
    .min(-10)
    .max(10)
    .step(0.1)
    .onChange((value) => {
        curve.points[1].x = value
        curvePoints = curve.getPoints(debugObject.segments);
        curveObject.geometry.dispose();
        curveObject.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    })

point2
    .add(debugObject.points.point2, 'y')
    .min(-10)
    .max(10)
    .step(0.1)
    .onChange((value) => {
        curve.points[1].y = value
        curvePoints = curve.getPoints(debugObject.segments);
        curveObject.geometry.dispose();
        curveObject.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    })

point2
    .add(debugObject.points.point2, 'z')
    .min(-10)
    .max(10)
    .step(0.1)
    .onChange((value) => {
        curve.points[1].z = value
        curvePoints = curve.getPoints(debugObject.segments);
        curveObject.geometry.dispose();
        curveObject.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    })

point2
    .add(debugObject.points.point2, 'x')
    .min(-10)
    .max(10)
    .step(0.1)
    .onChange((value) => {
        curve.points[2].x = value
        curvePoints = curve.getPoints(debugObject.segments);
        curveObject.geometry.dispose();
        curveObject.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    })

point2
    .add(debugObject.points.point2, 'y')
    .min(-10)
    .max(10)
    .step(0.1)
    .onChange((value) => {
        curve.points[2].y = value
        curvePoints = curve.getPoints(debugObject.segments);
        curveObject.geometry.dispose();
        curveObject.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    })

point2
    .add(debugObject.points.point2, 'z')
    .min(-10)
    .max(10)
    .step(0.1)
    .onChange((value) => {
        curve.points[2].z = value
        curvePoints = curve.getPoints(debugObject.segments);
        curveObject.geometry.dispose();
        curveObject.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    })

AFRAME.registerComponent('custom-three-js-object', {
    init: function () {
        // Create a Three.js mesh
        let torusGeometry = new THREE.TorusGeometry(0.4, 0.01, 20, 45)
        let torusMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        let torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
        torusMesh.position.set(0, 1, -3);
        gui.add(torusMesh.position, 'y').min(1).max(3).step(0.01).name('globe y-pos');
        scene.add(torusMesh);
    }
});

let guiContainer = document.getElementById('guiContainer');
let guiElement = gui.domElement;
guiContainer.appendChild(guiElement);
