import * as THREE from 'three'
import Experience from '../Experience'

export default class Raycaster {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.raycaster = new THREE.Raycaster()
        this.raycaster.params.Line.threshold = 0.02
        this.objsToTest = []
        this.pointer = new THREE.Vector2(2, 2)
        this.canvas = this.experience.aframeScene.canvas
        this.root = document.querySelector('#collisionBox').object3D
        this.listeners = []
        this.matrix = new THREE.Matrix4()
        this.controllerScrubs = new Map()
        this.on(this.canvas, 'pointermove', event => {
            this.setPointer(event)
            if (this.scrubbing) {
                this.raycaster.setFromCamera(this.pointer, this.experience.aframeScene.camera)
                const hit = this.raycaster.intersectObject(this.scrubbing, true)[0]
                if (hit) this.scrubbing.onScrub(hit)
            }
            if (this.drag && !this.experience.aframeScene.is('vr-mode')) {
                this.dragRoot.rotation.y += event.movementX * 0.006
                this.dragRoot.rotation.x = THREE.MathUtils.clamp(this.dragRoot.rotation.x + event.movementY * 0.006, -1.2, 1.2)
            }
        })
        this.on(this.canvas, 'pointerdown', event => {
            if (![0, 2].includes(event.button) || !this.experience.initialized) return
            this.setPointer(event)
            this.raycaster.setFromCamera(this.pointer, this.experience.aframeScene.camera)
            const hit = this.raycast()
            if (event.button === 0) {
                if (hit) {
                    event.preventDefault() // UI interaction must not start camera look.
                    hit.object.onActivate?.(hit)
                    if (hit.object.onScrub) {
                        this.scrubbing = hit.object
                        this.canvas.setPointerCapture(event.pointerId)
                    }
                }
                return
            }
            if (this.modalRoot?.visible) return
            const sceneHit = this.raycaster.intersectObject(this.root, true).find(hit => this.isVisible(hit.object))
            if (sceneHit) {
                this.dragRoot = this.simulationRoot(sceneHit.object)
                this.drag = true
                this.canvas.setPointerCapture(event.pointerId)
            }
        })
        for (const name of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) this.on(window, name, () => { this.drag = false; this.scrubbing = null })
        this.on(this.canvas, 'pointerleave', () => { this.pointer.set(2, 2) })
        this.on(this.canvas, 'contextmenu', event => event.preventDefault())
        this.on(this.canvas, 'wheel', event => {
            event.preventDefault()
            if (this.modalRoot?.visible) return
            this.setPointer(event)
            this.raycaster.setFromCamera(this.pointer, this.experience.aframeScene.camera)
            if (this.raycast()?.object.isUI) return
            const hit = this.raycaster.intersectObject(this.root, true).find(hit => this.isVisible(hit.object))
            if (!hit) return
            const root = this.simulationRoot(hit.object)
            root.scale.setScalar(THREE.MathUtils.clamp(root.scale.x * Math.exp(-event.deltaY * 0.001), 0.7, 1.3))
        }, { passive: false })
        for (const hand of [this.experience.rightHand, this.experience.leftHand]) {
            this.on(hand, 'triggerdown', () => {
                this.setFromHand(hand)
                const hit = this.raycast()
                if (hit) { hit.object.onActivate?.(hit); if (hit.object.onScrub) this.controllerScrubs.set(hand, hit.object) }
            })
            this.on(hand, 'triggerup', () => this.controllerScrubs.delete(hand))
            this.on(hand, 'gripdown', () => {
                if (this.grabbed || this.modalRoot?.visible) return
                this.setFromHand(hand)
                const ui = this.raycast()
                const hit = this.raycaster.intersectObject(this.root, true).find(hit => this.isVisible(hit.object))
                if (hit && (!ui || hit.distance < ui.distance)) {
                    this.grabbed = hand
                    this.grabbedRoot = this.simulationRoot(hit.object)
                    this.grabParent = this.grabbedRoot.parent
                    hand.object3D.attach(this.grabbedRoot)
                }
            })
            this.on(hand, 'gripup', () => { if (this.grabbed === hand) this.releaseGrab() })
            this.on(hand, 'controllerdisconnected', () => { this.controllerScrubs.delete(hand); if (this.grabbed === hand) this.releaseGrab() })
        }
        this.on(this.experience.aframeScene, 'exit-vr', () => { this.releaseGrab(); this.controllerScrubs.clear() })
    }

    simulationRoot(object) {
        for (let node = object; node; node = node.parent) if (node.userData.simulationRoot) return node
        return this.root
    }
    on(target, name, fn, options) {
        target.addEventListener(name, fn, options)
        this.listeners.push(() => target.removeEventListener(name, fn, options))
    }
    setPointer(event) {
        const rect = this.canvas.getBoundingClientRect()
        this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    }
    setFromHand(hand) {
        hand.object3D.updateWorldMatrix(true, false)
        this.matrix.extractRotation(hand.object3D.matrixWorld)
        this.raycaster.ray.origin.setFromMatrixPosition(hand.object3D.matrixWorld)
        this.raycaster.ray.direction.set(0, 0, -1).transformDirection(this.matrix)
    }
    isVisible(object) {
        for (let node = object; node; node = node.parent) if (!node.visible) return false
        return true
    }
    raycast() {
        let closest = null
        for (const object of this.objsToTest) {
            if (object.disabled || !this.isVisible(object)) continue
            if (this.modalRoot?.visible) {
                let belongs = false
                for (let node = object; node; node = node.parent) if (node === this.modalRoot) belongs = true
                if (!belongs) continue
            }
            const hit = this.raycaster.intersectObject(object, true).find(hit => this.isVisible(hit.object))
            if (hit && (!closest || hit.distance < closest.distance)) closest = { ...hit, object }
        }
        return closest
    }
    update() {
        let hovered = new Set()
        if (this.experience.aframeScene.is('vr-mode')) {
            for (const hand of [this.experience.rightHand, this.experience.leftHand]) {
                if (!hand.components['tracked-controls']?.controller && !this.controllerScrubs.has(hand)) continue
                this.setFromHand(hand)
                const scrubbing = this.controllerScrubs.get(hand)
                if (scrubbing && this.isVisible(scrubbing)) {
                    const sample = this.raycaster.intersectObject(scrubbing, true)[0]
                    if (sample) scrubbing.onScrub(sample)
                }
                const hit = this.raycast()
                if (hit) hovered.add(hit.object)
            }
        } else {
            this.raycaster.setFromCamera(this.pointer, this.experience.aframeScene.camera)
            const hit = this.raycast()
            if (hit) hovered.add(hit.object)
        }
        for (const object of this.objsToTest) {
            if (object.isUI) object.setState(object.disabled ? 'disabled' : object.active ? 'selected' : hovered.has(object) ? 'hovered' : 'idle')
        }
        this.canvas.style.cursor = hovered.size ? 'pointer' : this.drag ? 'grabbing' : 'default'
    }
    releaseGrab() {
        if (!this.grabbed) return
        this.grabParent.attach(this.grabbedRoot)
        this.grabbed = null
    }
    destroy() {
        this.releaseGrab()
        this.listeners.forEach(remove => remove())
        this.listeners = []
        this.objsToTest.length = 0
    }
}
