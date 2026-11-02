import * as THREE from 'three'
import Experience from '../../Experience'
import Objects from './Objects'
import Trajectory from './Trajectory'
import { encounterState } from '../../Utils/OrbitalMath'
import { EARTH_RADIUS_METERS, greenwichAngle, positionOf, toScene } from '../../Utils/SpatialMath'
import earthVertexShader from '../../Shaders/earth/vertex.glsl'
import earthFragmentShader from '../../Shaders/earth/fragment.glsl'
import atmosphereVertexShader from '../../Shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from '../../Shaders/atmosphere/fragment.glsl'

export default class Globe {
    constructor(view) {
        this.experience = new Experience()
        this.view = view ?? this.experience.globeView
        this.view.scale.setScalar(0.7)
        const resources = this.experience.resources.items
        this.target = new Objects(new THREE.Group(), null, resources.targetModel, 'Target', '#96df92')
        this.chaser = new Objects(new THREE.Group(), null, resources.chaserModel, 'Chaser', '#81c9ff')
        this.targetPosManoeuvre = new Objects(new THREE.Group(), null, resources.targetPosManoeuvreModel, 'After manoeuvre', '#ffbe0b')
        this.view.add(this.target.view, this.chaser.view, this.targetPosManoeuvre.view)
        this.trajectories = []
        this.scale = 1 / EARTH_RADIUS_METERS
        for (const name of ['earthDayTexture', 'earthNightTexture']) {
            resources[name].colorSpace = THREE.SRGBColorSpace
            resources[name].anisotropy = 4
        }
        // This texture contains data masks, not display colours.
        resources.earthSpecularCloudsTexture.colorSpace = THREE.NoColorSpace
        this.uniforms = {
            uDayTexture: { value: resources.earthDayTexture },
            uNightTexture: { value: resources.earthNightTexture },
            uSpecularCloudsTexture: { value: resources.earthSpecularCloudsTexture },
            uSunDirection: { value: new THREE.Vector3(-1, 0.3, 0.35).normalize() },
            uAtmosphereDayColor: { value: new THREE.Color('#7ed1fb') },
            uAtmosphereTwilightColor: { value: new THREE.Color('#ffbc8f') }
        }
        const geometry = new THREE.SphereGeometry(1, 64, 48)
        this.earth = new THREE.Mesh(geometry, new THREE.ShaderMaterial({ vertexShader: earthVertexShader, fragmentShader: earthFragmentShader, uniforms: this.uniforms }))
        this.atmosphere = new THREE.Mesh(geometry, new THREE.ShaderMaterial({ vertexShader: atmosphereVertexShader, fragmentShader: atmosphereFragmentShader, uniforms: this.uniforms, side: THREE.BackSide, transparent: true, depthWrite: false }))
        this.atmosphere.scale.setScalar(1.04)
        this.view.add(this.earth, this.atmosphere)
    }

    updateScenario(conjunction, manoeuvre) {
        const world = this.experience.world
        if (this.lastConjunction !== conjunction) {
            this.view.quaternion.setFromUnitVectors(toScene(positionOf(conjunction.details.target.state_vector)).normalize(), new THREE.Vector3(0, 0, 1))
            this.lastConjunction = conjunction
        }
        this.earth.rotation.y = greenwichAngle(conjunction.details.tca)
        this.atmosphere.rotation.y = this.earth.rotation.y
        for (const [object, role] of [[this.target, 'target'], [this.chaser, 'chaser']]) {
            const detail = conjunction.details[role]
            object.view.position.copy(toScene(positionOf(detail.state_vector)).multiplyScalar(this.scale))
            object.setData(conjunction[role])
            object.covariance.update(detail.covariance, detail.state_vector, this.scale, world.sigma)
            object.covariance.ellipsoid.visible = world.showCovariance
        }
        this.targetPosManoeuvre.view.visible = !!manoeuvre
        this.targetPosManoeuvre.popup.hide()
        if (manoeuvre) {
            this.targetPosManoeuvre.view.position.copy(toScene(positionOf(manoeuvre.collision_avoidance.state_vector_tca)).multiplyScalar(this.scale))
            this.targetPosManoeuvre.setData(conjunction.target)
        }
        if (this.scenario !== manoeuvre || this.trajectoryConjunction !== conjunction) {
            this.trajectories.forEach(path => path.destroy())
            this.trajectories = []
            for (const [state, color] of [[conjunction.details.target.state_vector, '#96df92'], [conjunction.details.chaser.state_vector, '#81c9ff'], [manoeuvre?.collision_avoidance.state_vector_tca, '#ffbe0b']]) {
                if (state) this.trajectories.push(new Trajectory(this.view, color, state, { duration: 5700, step: 20 }))
            }
            this.scenario = manoeuvre
            this.trajectoryConjunction = conjunction
        }
        this.trajectories.forEach(path => { path.mesh.visible = world.showTrajectories })
        // No post-manoeuvre covariance is supplied by this sample.
        this.targetPosManoeuvre.covariance.ellipsoid.visible = false
    }
    setTime(conjunction, manoeuvre, offset) {
        const sample = encounterState(conjunction, manoeuvre, offset)
        for (const [object, state] of [[this.target, sample.target], [this.chaser, sample.chaser], [this.targetPosManoeuvre, sample.candidate]]) {
            if (state) object.view.position.copy(toScene(new THREE.Vector3(...state.slice(0, 3))).multiplyScalar(this.scale))
        }
        this.trajectories.forEach((path, index) => path.setTime(offset + (index < 2 ? sample.delta : 0), this.experience.world.playbackDirection))
        // Only baseline covariance is supplied; it is not propagated with playback.
        this.target.covariance.ellipsoid.visible = false
        this.chaser.covariance.ellipsoid.visible = false
    }
    update() { this.target.update(); this.chaser.update(); this.targetPosManoeuvre.update() }
    destroy() { this.trajectories.forEach(path => path.destroy()); for (const object of [this.target, this.chaser, this.targetPosManoeuvre]) object.destroy() }
}
