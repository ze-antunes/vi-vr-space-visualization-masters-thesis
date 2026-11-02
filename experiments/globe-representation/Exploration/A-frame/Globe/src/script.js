import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { CSG } from 'three-csg-ts';

// Import Shaders 
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'

// Debug object
let debugObject = {};

// Debug GUI
let gui = new GUI({
    width: 300,
    title: "Debug UI",
    closeFolders: true
});

function logEvent(eventName) {
    console.log(eventName + ' event triggered!');
    // You can perform any desired action based on the event name here
}
window.addEventListener('keydown', (e) => {
    if (e.key == "h")
        gui.show(gui._hidden);
    // if (e.key == "e") {
    //     const geometry = new THREE.BoxGeometry(1, 1, 1);
    //     const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    //     const cube = new THREE.Mesh(geometry, material);
    //     scene.add(cube);
    // } 
    // if (e.key == "r") {
    //     console.log("ola")
    // }
});

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

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Get the A-Frame scene element
let aframeScene = document.querySelector('#myScene');
// console.log(aframeScene);

// Access the underlying Three.js scene object
let scene = aframeScene.object3D;
scene.castShadow = true;
scene.shadow = true;

// Camera 
// Get the A-Frame camera element
let aframeCamera = document.querySelector('#myCamera');

// Access the underlying Three.js camera object
let cameraComponent = aframeCamera.components;
let camera

// Loaders
let textureLoader = new THREE.TextureLoader()
let gltfLoader = new GLTFLoader()

// Textures 
let lineTexture = textureLoader.load('/textures/particles/13.png',
    (success) => {
        console.log(success)
    }, () => {
        console.log("progress")
    },
    (error) => {
        console.log("Error", error)
    },)

// Models 
let chaser
gltfLoader.load(
    'https://raw.githubusercontent.com/ze-antunes/ARVI_Assets/main/3D_Models/Chaser/scene.gltf',
    (gltf) => {
        // console.log(gltf.scene.children[0].children[0].children[0].material)
        chaser = gltf.scene.children[0]
        chaser.children[0].children[0].material = new THREE.MeshBasicMaterial({ color: 'lightgreen' })
        chaser.scale.set(0.005, 0.005, 0.005)
        chaser.add(chaserCovarianceMesh)
    },
    () => {
        console.log("progress")
    },
    (error) => {
        console.log(error)
    },
)

let target
gltfLoader.load(
    'https://raw.githubusercontent.com/ze-antunes/ARVI_Assets/main/3D_Models/Target/scene.gltf',
    (gltf) => {
        target = gltf.scene.children[0]
        target.children[0].children[0].children[0].material = new THREE.MeshBasicMaterial({ color: '#26F7FD' })
        target.children[0].children[1].children[0].material = new THREE.MeshBasicMaterial({ color: '#26F7FD' })
        target.children[0].children[1].children[1].material = new THREE.MeshBasicMaterial({ color: '#26F7FD' })
        target.scale.set(0.05, 0.05, 0.05)
        target.position.z = 1.4
        target.position.y = 0.1
        target.add(targetCovarianceMesh)
        // console.log(target)
    },
    () => {
        console.log("progress")
    },
    (error) => {
        console.log(error)
    },
)

// Particles 
let particlesGeometry = new THREE.BufferGeometry()
let count = 100

let positions = new Float32Array(count * 3)

for (let i = 0; i < count; i++) {
    let angle = (i / count) * Math.PI * 2; // Angle for each point
    let radius = 1.4; // Radius of the circle

    // Generate random coordinates between -1 and 1
    let x = Math.cos(angle) * radius;
    let y = 0;
    let z = (Math.sin(angle) * radius) - 0;

    // Calculate the index for the current point
    let index = i * 3;

    // Store the coordinates in the array
    positions[index] = x;
    positions[index + 1] = y;
    positions[index + 2] = z;
}

particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
)


// let particlesMaterial = new THREE.PointsMaterial({
//     size: 0.1,
//     sizeAttenuation: true,
//     color: 'lightgreen',
//     depthWrite: false,
//     transparent: true,
//     alphaMap: lineTexture,
//     blending: THREE.AdditiveBlending,
// })

// Points 
// let particles = new THREE.Points(particlesGeometry, particlesMaterial)
// scene.add(particles)

// Line
// let lineGeometry = new LineGeometry()
// lineGeometry.setPositions(positions);
let chaserTrajectoryLineMaterial = new THREE.LineDashedMaterial({
    color: 'lightgreen',
    scale: 1,
    dashSize: 0.05,
    gapSize: 0.05
})
// Chaser Trajectory 
let chaserTrajectoryLine = new THREE.Line(particlesGeometry, chaserTrajectoryLineMaterial);
chaserTrajectoryLine.computeLineDistances()
chaserTrajectoryLine.scale.set(1, 1, 1)

let chaserCovarianceGeometry = new THREE.SphereGeometry(0.5, 24, 16);
chaserCovarianceGeometry.rotateZ(Math.PI / 2);
chaserCovarianceGeometry.scale(40, 12, 40);

let chaserCovarianceMaterial = new THREE.MeshStandardMaterial({
    color: 'lightgreen',
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
});

let chaserCovarianceMesh = new THREE.Mesh(chaserCovarianceGeometry, chaserCovarianceMaterial);
chaserCovarianceMesh.position.set(0.7, 1, -1);
chaserCovarianceMesh.rotation.set(2, 10, -3);

// Target Trajectory 
let targetTrajectoryLineMaterial = new THREE.LineDashedMaterial({
    color: '#26F7FD',
    scale: 1,
    dashSize: 0.05,
    gapSize: 0.05
})

let targetTrajectoryLine = new THREE.Line(particlesGeometry, targetTrajectoryLineMaterial);
targetTrajectoryLine.computeLineDistances()
targetTrajectoryLine.scale.set(1, 1, 1)
targetTrajectoryLine.rotation.set(Math.PI * 0.2, Math.PI * -0.7, Math.PI * -0.7)

let targetCovarianceGeometry = new THREE.SphereGeometry(0.5, 24, 16);
targetCovarianceGeometry.rotateZ(Math.PI / 2);
targetCovarianceGeometry.scale(4.6, 1.5, 1.2);

let ellipsoids2Material = new THREE.MeshStandardMaterial({
    color: '#26F7FD',
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
});

let targetCovarianceMesh = new THREE.Mesh(targetCovarianceGeometry, ellipsoids2Material);

/**
 * Earth
 */
let earthParameters = {}
earthParameters.atmosphereDayColor = '#7ed1fb'
earthParameters.atmosphereTwilightColor = '#ffbc8f'

gui
    .addColor(earthParameters, 'atmosphereDayColor')
    .onChange(() => {
        earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
        atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
    })

gui
    .addColor(earthParameters, 'atmosphereTwilightColor')
    .onChange(() => {
        earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
        atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
    })

// Textures 
let earthDayTexture = textureLoader.load('./earth/day.jpg')
earthDayTexture.colorSpace = THREE.SRGBColorSpace
earthDayTexture.anisotropy = 8

let earthNightTexture = textureLoader.load('./earth/night.jpg')
earthNightTexture.colorSpace = THREE.SRGBColorSpace
earthNightTexture.anisotropy = 8

let earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg')
earthSpecularCloudsTexture.anisotropy = 8

// Mesh
let earthGeometry = new THREE.SphereGeometry(1, 64, 64)
let earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
    }
})
// let earthMaterial = new THREE.MeshBasicMaterial({color: 'red'})
let earth = new THREE.Mesh(earthGeometry, earthMaterial)
// scene.add(earth)


// Atmosphere 
let atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms:
    {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
    },
    side: THREE.BackSide,
    transparent: true
});

let atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.set(1.04, 1.04, 1.04);
// scene.add(atmosphere)

// Sun 
let sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, -1.4)
let sunDirection = new THREE.Vector3()

// Debug 
let debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial()
)

// scene.add(debugSun)

let globeObject3D
AFRAME.registerComponent('three-js-globe', {
    init: function () {
        let globeEntity = document.querySelector('#globe');
        globeObject3D = globeEntity.object3D;
        globeObject3D.add(earth, atmosphere, debugSun, chaserTrajectoryLine, targetTrajectoryLine)
    }
});

// Update 
let updateSun = () => {
    // Sun direction 
    sunDirection.setFromSpherical(sunSpherical);

    // Debug 
    debugSun.position.copy(sunDirection).multiplyScalar(5)

    // Uniforms 
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)
}

updateSun()

// Tweaks 
gui
    .add(sunSpherical, 'phi')
    .min(0)
    .max(Math.PI)
    .onChange(updateSun)
gui
    .add(sunSpherical, 'theta')
    .min(- Math.PI)
    .max(Math.PI)
    .onChange(updateSun)


//Intersection 
// let intRes = CSG.intersect(targetCovarianceMesh, chaserCovarianceMesh);
// intRes.material = new THREE.MeshBasicMaterial({
//     color: 'red',
//     side: THREE.DoubleSide
// });
// intRes.position.set(-0.7, 1, -1);
// intRes.scale.set(0.999, 0.999, 0.999);

// function checkTwoShapeIntersect(object1, object2) {
//     /**
//      * This function check if two object3d intersect or not
//      * @param {THREE.Object3D} object1
//      * @param {THREE.Object3D} object2
//      * @returns {Boolean}
//     */

//     // Check for intersection using bounding box intersection test
//     let bBox1 = new THREE.Box3().setFromObject(object1);
//     let bBox2 = new THREE.Box3().setFromObject(object2);

//     let intersection = bBox1.intersectsBox(bBox2);
//     // let intersection = mesh1.geometry.boundingBox.intersectsBox(mesh2.geometry.boundingBox);

//     if (intersection) { // The shape geometries intersect.
//         // console.log("intersection: yes")
//         return true
//     } else { // The shape geometries do not intersect.
//         // console.log("intersection: no")
//         return false
//     }
// }

//Update the intersection after changes
function handleIntersectionUpdate() {
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

    intRes.position.set(targetCovarianceMesh.position.x, 1, -1);
    intRes.scale.set(0.999, 0.999, 0.999);
    // scene.add(intRes)
    targetCovarianceMesh.add(intRes)
}



// Lights 
let lightsTweaks = gui.addFolder("Lights")

let ambientLight = new THREE.AmbientLight(0xffffff, .6)
lightsTweaks.add(ambientLight, 'intensity').min(0).max(3).step(0.001).name("ambientLight intensity")
scene.add(ambientLight)

// // Point light 
// let pointLight = new THREE.PointLight(0xffffff, 0.4, 100);
// pointLight.position.set(1, 2, - 1.5);
// pointLight.castShadow = true;
// pointLight.shadow.mapSize.width = 1024
// pointLight.shadow.mapSize.heightwidth = 1024
// pointLight.shadow.camera.near = .1
// pointLight.shadow.camera.far = 3

// let pointSphereGeometry = new THREE.SphereGeometry(0.1, 24, 16);
// let pointSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
// let pointSphereMesh = new THREE.Mesh(pointSphereGeometry, pointSphereMaterial);
// pointSphereMesh.position.set(1, 2, - 1.5);

// lightsTweaks.add(pointLight, 'intensity').min(0).max(3).step(0.001).name("pointLight intensity")
// lightsTweaks.add(pointLight.position, 'x').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.x = value })
// lightsTweaks.add(pointLight.position, 'y').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.y = value })
// lightsTweaks.add(pointLight.position, 'z').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.z = value })

// let sphereSize = 1;
// let pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
// let pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
// pointLightHelper.visible = false
// pointLightCameraHelper.visible = false
// scene.add(pointLightCameraHelper)
// scene.add(pointLight, pointSphereMesh, pointLightHelper);

// Access the underlying Three.js renderer object
let renderer

setTimeout(() => {
    camera = cameraComponent.camera.camera;

    renderer = aframeScene.renderer;
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
    renderer.setClearColor('#000011')
}, 100)

/**
 * Animate
 */
let clock = new THREE.Clock()

let tick = () => {
    let elapsedTime = clock.getElapsedTime()

    // Update chaser
    if (chaser != undefined) {
        let chaserAngle = elapsedTime * .05
        chaser.position.x = Math.cos(chaserAngle) * 1.4
        chaser.position.z = (Math.sin(chaserAngle) * 1.4)
        globeObject3D.add(chaser)
    }

    // Update chaser
    if (target != undefined) {
        let targetAngle = elapsedTime * .05
        let phiAngle = Math.PI * 0.2
        // target.position.x = Math.cos(targetAngle) * 1.4
        // target.position.y = Math.cos(targetAngle) * - .5
        // target.position.z = (Math.sin(targetAngle) * 1.4)
        target.position.x = Math.sin(phiAngle) * Math.cos(targetAngle) * 1.4
        target.position.y = Math.sin(phiAngle) * Math.sin(targetAngle) * 1.4
        target.position.z = (Math.cos(phiAngle) * 1.4)

        globeObject3D.add(target)
    }


    // Update intersection 
    // targetCovarianceMesh.updateMatrix()
    // chaserCovarianceMesh.updateMatrix()
    // let chekcIntersection = checkTwoShapeIntersect(targetCovarianceMesh, chaserCovarianceMesh)
    // if (chekcIntersection) {
    //     handleIntersectionUpdate()
    // }

    earth.rotation.y = elapsedTime * 0.05

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
