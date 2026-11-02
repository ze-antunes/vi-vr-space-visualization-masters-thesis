import * as THREE from 'three';
import GUI from 'lil-gui';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CSG } from 'three-csg-ts';
import * as MATHJS from 'mathjs';

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
    // camera = cameraComponent.camera.camera;
    camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);

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
        // targetCovarianceObject3D.add(targetCovarianceMesh)
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


// // Test
// let chaserCovarianceGeometryTest = new THREE.SphereGeometry(0.5, 24, 16);
// chaserCovarianceGeometryTest.rotateZ(Math.PI / 2);
// chaserCovarianceGeometryTest.scale(2, 0, 2);

// let chaserCovarianceMaterialTest = new THREE.MeshStandardMaterial({
//     color: '#0388fc',
//     // wireframe: true,
//     side: THREE.DoubleSide
// });

// let chaserCovarianceMeshTest = new THREE.Mesh(chaserCovarianceGeometryTest, chaserCovarianceMaterialTest);
// chaserCovarianceMeshTest.position.set(0.7, 1, -1.999);
// chaserCovarianceMeshTest.rotation.set(Math.PI * 0.5, 0, 0);

AFRAME.registerComponent('three-js-chaser-covariance', {
    init: function () {
        let chaserCovarianceEntity = document.querySelector('#chaserCovariance');
        let chaserCovarianceObject3D = chaserCovarianceEntity.object3D;
        // chaserCovarianceObject3D.add(chaserCovarianceMesh)
        // chaserCovarianceObject3D.add(chaserCovarianceMeshTest)
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
// targetCovarianceObject3D.add(intRes)

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
    // targetCovarianceObject3D.add(intRes)
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

// scene.add(floor, frontW, backW, leftW, rightW)

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



// -------

// Define the covariance matrix P (ensure it is a square 3x3 matrix)
let P = [
    [1, 0.2, 0.1],
    [0.2, 0.1, 0.3],
    [0.1, 0.3, 2]
];

// Perform eigenvalue decomposition
let eigResult = MATHJS.eigs(P);
let eigenvalues = eigResult.values;
let eigenvectors = eigResult.eigenvectors;

// Calculate the lengths of the semi-axes
let semiAxesLengths = eigenvalues.map(Math.sqrt);

// Create the ellipsoid
let ellipsoidGeometry = new THREE.SphereGeometry(1, 32, 32);
let ellipsoidMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: false });
let ellipsoid = new THREE.Mesh(ellipsoidGeometry, ellipsoidMaterial);
ellipsoid.position.set(3, 3, 3)

// Scale the ellipsoid
ellipsoid.scale.set(semiAxesLengths[0], semiAxesLengths[1], semiAxesLengths[2]);

// Apply rotation to align with eigenvectors
let rotationMatrix = new THREE.Matrix4();
rotationMatrix.set(
    eigenvectors[0].vector[0], eigenvectors[0].vector[1], eigenvectors[0].vector[2], 0,
    eigenvectors[1].vector[0], eigenvectors[1].vector[1], eigenvectors[1].vector[2], 0,
    eigenvectors[2].vector[0], eigenvectors[2].vector[1], eigenvectors[2].vector[2], 0,
    0, 0, 0, 1
);
ellipsoid.applyMatrix4(rotationMatrix);

scene.add(ellipsoid);

// Find the points from the ellipsoid in world coordinates
let boundingBox = new THREE.Box3().setFromObject(ellipsoid);
let maxY = boundingBox.max.y;
let minY = boundingBox.min.y;
let maxX = boundingBox.max.x;
let minX = boundingBox.min.x;

// Define plane geometry
let planeGeometry = new THREE.PlaneGeometry(100, 100); // Adjust size
let planeMaterial = new THREE.ShaderMaterial({
    uniforms: {
        maxY: { value: maxY },
        minY: { value: minY },
        maxX: { value: maxX },
        minX: { value: minX }
    },
    vertexShader: `
        varying vec3 vPosition;

        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float maxY;
        uniform float minY;
        uniform float maxX;
        uniform float minX;

        varying vec3 vPosition;

        void main() {
            // Compute position relative to the plane
            vec2 position2D = vPosition.xy;

            // Compute the ellipsoid silhouette
            float dx = maxX - minX;
            float dy = maxY - minY;
            float cx = (maxX + minX) / 2.0;
            float cy = (maxY + minY) / 2.0;

            float x = (position2D.x - cx) / dx;
            float y = (position2D.y - cy) / dy;

            float ellipseValue = x * x + y * y;

            // Check if the fragment is inside the silhouette of the ellipsoid
            if (ellipseValue <= 1.0) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Inside, color black
            } else {
                gl_FragColor = vec4(0.3, 0.3, 0.3, 1.0); // Outside, color gray
            }
        }
    `,
    side: THREE.DoubleSide
});

// Create the plane mesh
let plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.set(0, 0, 0); // Position the plane
// plane.rotation.set(0, Math.PI / 2, 0)
scene.add(plane);

let ellipsoidTweaks = gui.addFolder("Ellipsoid")
ellipsoidTweaks
    .add(ellipsoid.scale, 'x')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('x-scale')

ellipsoidTweaks
    .add(ellipsoid.rotation, 'x')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('x-rotate')

ellipsoidTweaks
    .add(ellipsoid.position, 'x')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('x-position')

/**
 * Animate
 */
let clock = new THREE.Clock()

let tick = () => {
    let elapsedTime = clock.getElapsedTime()

        // ellipsoid.rotation.x += 0.01;
        // ellipsoid.rotation.y += 0.01;

    // Update uniforms for the points
    boundingBox.setFromObject(ellipsoid);
    plane.material.uniforms.maxY.value = boundingBox.max.y
    plane.material.uniforms.minY.value = boundingBox.min.y
    plane.material.uniforms.maxX.value = boundingBox.max.x
    plane.material.uniforms.minX.value = boundingBox.min.x

    // Call tick on the next frame
    window.requestAnimationFrame(tick)
}

tick()


// ------------------------------------------------------------------------

// // Define the covariance matrix P (ensure it is a square 3x3 matrix)
// let P = [
//     [1, 0.2, 0.1],
//     [0.2, 0.1, 0.3],
//     [0.1, 0.3, 2]
// ];

// // Perform eigenvalue decomposition
// let eigResult = MATHJS.eigs(P);
// let eigenvalues = eigResult.values;
// let eigenvectors = eigResult.eigenvectors;

// // Calculate the lengths of the semi-axes
// let semiAxesLengths = eigenvalues.map(Math.sqrt);

// // Create the ellipsoid
// let ellipsoidGeometry = new THREE.SphereGeometry(1, 32, 32);
// let ellipsoidMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff, wireframe: false });
// let ellipsoid = new THREE.Mesh(ellipsoidGeometry, ellipsoidMaterial);
// ellipsoid.position.set(0, 0, 0)

// // Scale the ellipsoid
// ellipsoid.scale.set(semiAxesLengths[0], semiAxesLengths[1], semiAxesLengths[2]);

// // Apply rotation to align with eigenvectors
// let rotationMatrix = new THREE.Matrix4();
// rotationMatrix.set(
//     eigenvectors[0].vector[0], eigenvectors[0].vector[1], eigenvectors[0].vector[2], 0,
//     eigenvectors[1].vector[0], eigenvectors[1].vector[1], eigenvectors[1].vector[2], 0,
//     eigenvectors[2].vector[0], eigenvectors[2].vector[1], eigenvectors[2].vector[2], 0,
//     0, 0, 0, 1
// );
// ellipsoid.applyMatrix4(rotationMatrix);

// scene.add(ellipsoid);

// // Create a plane
// let planeGeometry = new THREE.PlaneGeometry(10, 10);
// let planeMaterial = new THREE.ShaderMaterial({
//     vertexShader: `
//     varying vec3 vWorldPosition;

//   void main() {
//     vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
//     gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
//   }
//   `,
//     fragmentShader: `
//     varying vec3 vWorldPosition;
//     uniform vec3 boxVertices[13];
//     uniform int nVertices;

//     bool pointInPolygon(vec2 point, vec2 vertices[13]) {
//         bool inside = false;
//         for(int i = 0, j = 12; i < 13; j = i++) {
//         if ((vertices[i].y > point.y) != (vertices[j].y > point.y) &&
//             (point.x < (vertices[j].x - vertices[i].x) * (point.y - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x)) {
//             inside = !inside;
//         }
//         }
//         return inside;
//     }

//     void main() {
//         // Calculate the projection of the box vertices onto the plane
//         vec2 projectedVertices[13];
//         for(int i = 0; i < 13; i++) {
//         projectedVertices[i] = boxVertices[i].xz;
//         }

//         // Check if the current fragment is inside the projected shape
//         vec2 fragPos = vWorldPosition.xz;
//         bool inside = pointInPolygon(fragPos, projectedVertices);

//     if (inside) {
//             gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5); // Shadow color
//         } else {
//             gl_FragColor = vec4(0.3, 0.3, 0.3, 0.5); // Shade of gray for the plane
//         }
//     }
//   `,
//     uniforms: {
//         boxVertices: { value: [] }
//     },
//     transparent: true,
// });
// let plane = new THREE.Mesh(planeGeometry, planeMaterial);
// plane.position.set(0, -5, 0);
// plane.rotation.x = -Math.PI / 2;
// scene.add(plane);

// // Create a box
// let boxGeometry = new THREE.BoxGeometry(2, 2, 2);
// let boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false });
// let box = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(box);

// let boxTweaks = gui.addFolder("BoX")
// boxTweaks
//     .add(box.scale, 'x')
//     .min(-5)
//     .max(5)
//     .step(0.01)
//     .name('x-scale')

// boxTweaks
//     .add(box.position, 'x')
//     .min(-5)
//     .max(5)
//     .step(0.01)
//     .name('x-position')

// boxTweaks
//     .add(box.rotation, 'x')
//     .min(-5)
//     .max(5)
//     .step(0.01)
//     .name('x-rotation')

// boxTweaks
//     .add(box.rotation, 'y')
//     .min(-5)
//     .max(5)
//     .step(0.01)
//     .name('y-rotation')

// // Position the camera and objects
// box.position.set(0, 0, 0);

// // Box vertices for projection
// let boxVertices = [
//     new THREE.Vector3(-1, -1, -1),
//     new THREE.Vector3(1, -1, -1),
//     new THREE.Vector3(1, -1, 1),
//     new THREE.Vector3(-1, -1, 1),

//     new THREE.Vector3(-1, 1, 1),
//     new THREE.Vector3(-1, 1, -1),

//     new THREE.Vector3(1, 1, -1),
//     new THREE.Vector3(1, 1, 1),

//     new THREE.Vector3(-1, -1, -1),
//     new THREE.Vector3(-1, 1, -1),

//     new THREE.Vector3(1, -1, -1),
//     new THREE.Vector3(1, 1, -1),
//     new THREE.Vector3(1, -1, 1),
//     new THREE.Vector3(1, 1, 1),

//     new THREE.Vector3(-1, -1, 1),
//     new THREE.Vector3(-1, 1, 1)
// ];

// // Function to update box vertices in shader uniforms
// function updateBoxVertices() {
//     let transformedVertices = boxVertices.map(vertex => box.localToWorld(vertex.clone()));
//     planeMaterial.uniforms.boxVertices.value = transformedVertices;
// }

// /**
//  * Animate
//  */
// let clock = new THREE.Clock()

// let tick = () => {
//     let elapsedTime = clock.getElapsedTime()

//     // box.rotation.x += 0.01;
//     // box.rotation.y += 0.01;
//     updateBoxVertices();

//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick)
// }

// tick()


// ------------------------------------------------------------------------

// // Create a light source
// let light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(10, 10, 10); // Position the light
// // scene.add(light);

// // Define the covariance matrix P (ensure it is a square 3x3 matrix)
// let P = [
//     [1, 0.2, 0.1],
//     [0.2, 0.1, 0.3],
//     [0.1, 0.3, 2]
// ];

// // Perform eigenvalue decomposition
// let eigResult = MATHJS.eigs(P);
// let eigenvalues = eigResult.values;
// let eigenvectors = eigResult.eigenvectors;

// // Calculate the lengths of the semi-axes
// let semiAxesLengths = eigenvalues.map(Math.sqrt);

// // Create the ellipsoid
// let ellipsoidGeometry = new THREE.SphereGeometry(1, 32, 32);
// let ellipsoidMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff, wireframe: false });
// let ellipsoid = new THREE.Mesh(ellipsoidGeometry, ellipsoidMaterial);
// ellipsoid.position.set(0, 0, 0)

// // Scale the ellipsoid
// ellipsoid.scale.set(semiAxesLengths[0], semiAxesLengths[1], semiAxesLengths[2]);

// // Apply rotation to align with eigenvectors
// let rotationMatrix = new THREE.Matrix4();
// rotationMatrix.set(
//     eigenvectors[0].vector[0], eigenvectors[0].vector[1], eigenvectors[0].vector[2], 0,
//     eigenvectors[1].vector[0], eigenvectors[1].vector[1], eigenvectors[1].vector[2], 0,
//     eigenvectors[2].vector[0], eigenvectors[2].vector[1], eigenvectors[2].vector[2], 0,
//     0, 0, 0, 1
// );
// ellipsoid.applyMatrix4(rotationMatrix);

// scene.add(ellipsoid);

// let ellipsoidTweaks = gui.addFolder("Ellipsoid")
// ellipsoidTweaks
//     .add(ellipsoid.scale, 'x')
//     .min(-5)
//     .max(5)
//     .step(0.01)
//     .name('x-scale')

// ellipsoidTweaks
//     .add(ellipsoid.position, 'x')
//     .min(-5)
//     .max(5)
//     .step(0.01)
//     .name('x-position')

// ellipsoidTweaks
//     .add(ellipsoid.rotation, 'x')
//     .min(-5)
//     .max(5)
//     .step(0.01)
//     .name('x-rotation')

// ellipsoidTweaks
//     .add(ellipsoid.rotation, 'y')
//     .min(-5)
//     .max(5)
//     .step(0.01)
//     .name('y-rotation')

// // Create a plane
// let planeGeometry = new THREE.PlaneGeometry(10, 10);
// let planeMaterial = new THREE.ShaderMaterial({
//     vertexShader: `
//     varying vec3 vWorldPosition;

//     void main() {
//         vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
//         gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
//     }
//     `,
//     fragmentShader: `
//     varying vec3 vWorldPosition;
//     uniform vec3 lightPosition;
//     uniform vec3 ellipsoidVertices[8];

//     bool pointInPolygon(vec2 point, vec2 vertices[8]) {
//         bool inside = false;
//         for(int i = 0, j = 7; i < 8; j = i++) {
//             if ((vertices[i].y > point.y) != (vertices[j].y > point.y) &&
//                 (point.x < (vertices[j].x - vertices[i].x) * (point.y - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x)) {
//                 inside = !inside;
//             }
//         }
//         return inside;
//     }

//     void main() {
//         vec2 projectedVertices[8];
//         for (int i = 0; i < 8; i++) {
//             vec3 lightDir = normalize(ellipsoidVertices[i] - lightPosition);
//             float t = -ellipsoidVertices[i].y / lightDir.y;
//             projectedVertices[i] = (ellipsoidVertices[i] + t * lightDir).xz;
//         }

//         vec2 fragPos = vWorldPosition.xz;
//         bool inside = pointInPolygon(fragPos, projectedVertices);

//         if (inside) {
//             gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5); // Shadow color
//         } else {
//             gl_FragColor = vec4(0.3, 0.3, 0.3, 0.5); // Shade of gray for the plane
//         }
//     }
//     `,
//     uniforms: {
//         lightPosition: { value: light.position },
//         ellipsoidVertices: { value: [] }
//     },
//     transparent: true,
// });
// let plane = new THREE.Mesh(planeGeometry, planeMaterial);
// plane.position.set(0, -5, 0);
// plane.rotation.x = -Math.PI / 2;
// scene.add(plane);

// // Function to update ellipsoid vertices for shadow projection
// function updateEllipsoidVertices() {
//     let rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(ellipsoid.rotation);

//     let vertices = [
//         new THREE.Vector3(-1, -1, -1).applyMatrix4(rotationMatrix).multiplyScalar(semiAxesLengths[0]),
//         new THREE.Vector3(1, -1, -1).applyMatrix4(rotationMatrix).multiplyScalar(semiAxesLengths[1]),
//         new THREE.Vector3(1, 1, -1).applyMatrix4(rotationMatrix).multiplyScalar(semiAxesLengths[2]),
//         new THREE.Vector3(-1, 1, -1).applyMatrix4(rotationMatrix).multiplyScalar(semiAxesLengths[0]),
//         new THREE.Vector3(-1, -1, 1).applyMatrix4(rotationMatrix).multiplyScalar(semiAxesLengths[1]),
//         new THREE.Vector3(1, -1, 1).applyMatrix4(rotationMatrix).multiplyScalar(semiAxesLengths[2]),
//         new THREE.Vector3(1, 1, 1).applyMatrix4(rotationMatrix).multiplyScalar(semiAxesLengths[0]),
//         new THREE.Vector3(-1, 1, 1).applyMatrix4(rotationMatrix).multiplyScalar(semiAxesLengths[1])
//     ];

//     let transformedVertices = vertices.map(vertex => ellipsoid.localToWorld(vertex.clone()));
//     planeMaterial.uniforms.ellipsoidVertices.value = transformedVertices;
// }

// /**
//  * Animate
//  */
// let clock = new THREE.Clock();

// let tick = () => {
//     let elapsedTime = clock.getElapsedTime();

//     ellipsoid.rotation.x += 0.01;
//     ellipsoid.rotation.y += 0.01;
//     updateEllipsoidVertices();

//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick);
// }

// tick();