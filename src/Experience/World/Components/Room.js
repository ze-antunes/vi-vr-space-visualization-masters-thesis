import * as THREE from 'three'
import Experience from '../../Experience'
import Objects from './Objects'
import { disposeScene } from '../../Utils/Dispose'
import { covarianceAxes, projectedEllipse } from '../../Utils/SpatialMath'
import { encounterBounds, localEncounter } from '../../Utils/EncounterMath'

// Local coordinates of the three receiving planes: XY (back), XZ (floor), ZY (left).
const planes = [
    { u: 0, v: 1, normal: 2, position: [0, 0, -1.492], rotation: [0, 0, 0] },
    { u: 0, v: 2, normal: 1, position: [0, -1.492, 0], rotation: [Math.PI / 2, 0, 0] },
    { u: 2, v: 1, normal: 0, position: [-1.492, 0, 0], rotation: [0, -Math.PI / 2, 0] }
]

export default class Room {
    constructor(view) {
        this.experience = new Experience()
        this.view = view ?? this.experience.roomView
        this.view.position.set(0, 0, 0)
        this.view.scale.setScalar(0.42)
        const resources = this.experience.resources.items
        this.target = new Objects(new THREE.Group(), null, resources.target1Model, 'Target', '#96df92', 0.28)
        this.chaser = new Objects(new THREE.Group(), null, resources.chaser1Model, 'Chaser', '#81c9ff', 0.23)
        this.targetPosManoeuvre = new Objects(new THREE.Group(), null, resources.targetPosManoeuvre1Model, 'After manoeuvre (own TCA)', '#ffbe0b', 0.28)
        this.view.add(this.target.view, this.chaser.view, this.targetPosManoeuvre.view)
        this.paths = new THREE.Group()
        this.view.add(this.paths)
        // Keep uncertainty anchored to the provided baseline epoch, independently
        // from the moving estimated glyphs; no covariance propagation is available.
        for (const object of [this.target, this.chaser]) this.view.add(object.covariance.ellipsoid)
        this.walls = new THREE.Group()
        const wallGeometry = new THREE.PlaneGeometry(3, 3)
        const wallMaterial = new THREE.MeshBasicMaterial({ color: '#161c29', side: THREE.FrontSide })
        for (const [position, rotation] of [
            [[0, 0, -1.5], [0, 0, 0]],
            [[0, -1.5, 0], [-Math.PI / 2, 0, 0]],
            [[-1.5, 0, 0], [0, Math.PI / 2, 0]],
            [[1.5, 0, 0], [0, -Math.PI / 2, 0]]
        ]) {
            const wall = new THREE.Mesh(wallGeometry, wallMaterial)
            wall.position.set(...position)
            wall.rotation.set(...rotation)
            this.walls.add(wall)
        }
        this.view.add(this.walls)
        for (const plane of planes) {
            const grid = new THREE.GridHelper(3, 6, '#344154', '#263142')
            grid.rotation.x = Math.PI / 2
            const surface = new THREE.Group()
            surface.position.set(...plane.position)
            surface.rotation.set(...plane.rotation)
            surface.add(grid)
            this.walls.add(surface)
        }
        this.frame = new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(-1.5, -1.5, -1.5), new THREE.Vector3(1.5, 1.5, 1.5)), '#52657c')
        this.view.add(this.frame, new THREE.AxesHelper(0.45))
        this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: '#ffffff' }))
        this.view.add(this.line)
        this.projections = new THREE.Group()
        for (const color of ['#96df92', '#81c9ff']) {
            const group = new THREE.Group()
            for (const plane of planes) {
                const projection = new THREE.Group()
                projection.rotation.set(...plane.rotation)
                projection.add(new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide })))
                const points = Array.from({ length: 96 }, (_, i) => new THREE.Vector3(Math.cos(i * Math.PI / 48), Math.sin(i * Math.PI / 48), 0.001))
                projection.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color })))
                group.add(projection)
            }
            this.projections.add(group)
        }
        this.view.add(this.projections)
    }

    updateScenario(conjunction, manoeuvre) {
        const world = this.experience.world
        const states = localEncounter(conjunction, manoeuvre)
        const bounds = encounterBounds(conjunction)
        this.transform = world.detailFocus ? bounds.positions : bounds.physical
        this.covarianceGain = world.detailFocus ? bounds.gain : 1
        const scale = this.transform.scale * world.zoom
        this.metersPerUnit = 1 / scale
        const objects = [this.target, this.chaser, this.targetPosManoeuvre]
        objects.forEach((object, index) => {
            object.view.visible = !!states[index]
            object.popup.hide()
            if (!states[index]) return
            object.view.position.copy(this.transform.map(states[index]).multiplyScalar(world.zoom))
            object.setData(index === 1 ? conjunction.chaser : conjunction.target)
        })
        for (const [index, role] of ['target', 'chaser'].entries()) {
            const object = objects[index], detail = conjunction.details[role]
            const axes = covarianceAxes(detail.covariance, detail.state_vector, world.sigma)
            object.covariance.update(detail.covariance, detail.state_vector, scale * this.covarianceGain, world.sigma)
            object.covariance.ellipsoid.position.copy(this.transform.map(detail.state_vector))
            object.covariance.ellipsoid.visible = world.showCovariance
            planes.forEach((plane, planeIndex) => {
                const projection = this.projections.children[index].children[planeIndex]
                const ellipse = projectedEllipse(axes, plane.u, plane.v)
                projection.position.copy(this.transform.map(detail.state_vector))
                projection.position.setComponent(plane.normal, plane.position[plane.normal])
                // Rotate and scale in the receiving plane, keeping its depth fixed.
                for (const shape of projection.children) {
                    shape.rotation.z = ellipse.angle
                    shape.scale.set(ellipse.radii[0] * scale * this.covarianceGain, ellipse.radii[1] * scale * this.covarianceGain, 1)
                }
            })
        }
        this.targetPosManoeuvre.covariance.ellipsoid.visible = false
        const attribute = this.line.geometry.attributes.position
        attribute.setXYZ(0, ...(manoeuvre ? this.targetPosManoeuvre : this.target).view.position.toArray())
        attribute.setXYZ(1, ...this.chaser.view.position.toArray())
        attribute.needsUpdate = true
        this.line.geometry.computeBoundingSphere()
        this.projections.visible = world.showProjections
        for (const path of [...this.paths.children]) {
            path.removeFromParent(); disposeScene(path)
        }
        if (world.showTrajectories) for (const [index, color] of ['#96df92', '#81c9ff', '#ffbe0b'].entries()) {
            if (index === 2 && !manoeuvre) continue
            const points = Array.from({ length: 81 }, (_, i) => this.transform.map(localEncounter(conjunction, manoeuvre, -0.5 + i / 80)[index]))
            const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineDashedMaterial({ color, dashSize: 0.04, gapSize: 0.025, transparent: true, opacity: 0.45 }))
            path.computeLineDistances()
            path.trail = new THREE.Line(path.geometry.clone(), new THREE.LineBasicMaterial({ color }))
            path.trail.renderOrder = 1
            path.add(path.trail)
            this.paths.add(path)
        }
    }
    setTime(conjunction, manoeuvre, offset) {
        const states = localEncounter(conjunction, manoeuvre, offset)
        for (const [i, object] of [this.target, this.chaser, this.targetPosManoeuvre].entries()) {
            if (states[i]) object.view.position.copy(this.transform.map(states[i]))
        }
        const attribute = this.line.geometry.attributes.position
        attribute.setXYZ(0, ...(manoeuvre ? this.targetPosManoeuvre : this.target).view.position.toArray())
        attribute.setXYZ(1, ...this.chaser.view.position.toArray())
        attribute.needsUpdate = true
        this.line.geometry.computeBoundingSphere()
        const index = THREE.MathUtils.clamp(Math.round((offset + 0.5) * 80), 0, 80)
        const reverse = this.experience.world.playbackDirection < 0
        const start = reverse ? index : Math.max(0, index - 10)
        const end = reverse ? Math.min(80, index + 10) : index
        this.paths.children.forEach(path => path.trail.geometry.setDrawRange(start, end - start + 1))
        this.estimatedSeparation = (manoeuvre ? this.targetPosManoeuvre : this.target).view.position.distanceTo(this.chaser.view.position) / this.transform.scale
    }
    update() { this.target.update(); this.chaser.update(); this.targetPosManoeuvre.update() }
    destroy() { for (const object of [this.target, this.chaser, this.targetPosManoeuvre]) object.destroy() }
}
