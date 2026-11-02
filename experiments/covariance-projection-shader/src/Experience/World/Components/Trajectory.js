import Experience from "../../Experience"

export default class Trajectory {
    constructor(object, objectParameters) {
        this.experience = new Experience
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.object = object
        this.objectParameters = objectParameters
        this.globeView = this.experience.globeView

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry() {
        this.geometry = new THREE.BufferGeometry()
        let count = 100
        let positions = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            let thetaAngle = (i / count) * this.objectParameters.trajectoryThetaAngle
            let y = Math.sin(thetaAngle) * Math.sin(this.objectParameters.trajectoryPhiAngle) * this.objectParameters.trajectoryRadius
            let x = Math.cos(thetaAngle) * this.objectParameters.trajectoryRadius
            let z = Math.sin(thetaAngle) * Math.cos(this.objectParameters.trajectoryPhiAngle) * this.objectParameters.trajectoryRadius

            // Calculate the index for the current point
            let index = i * 3;

            // Store the coordinates in the array
            positions[index] = x;
            positions[index + 1] = y;
            positions[index + 2] = z;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    }

    setMaterial() {
        this.material = new THREE.LineDashedMaterial({
            color: this.objectParameters.color,
            scale: 1,
            dashSize: 0.05,
            gapSize: 0.05
        })
    }

    setMesh() {
        this.mesh = new THREE.Line(this.geometry, this.material);
        this.mesh.computeLineDistances()
        this.mesh.scale.set(1, 1, 1)
        this.globeView.add(this.mesh)
    }

}