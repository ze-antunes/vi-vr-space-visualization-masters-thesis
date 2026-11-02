import * as THREE from 'three'
import Experience from '../Experience'
import Globe from './Components/Globe'
import Room from './Components/Room'
import Panel from './Components/UI/Panel'
import Environment from './Environment'
import AnalysisControls from './Components/UI/AnalysisControls'
import SimulationPanel from './Components/UI/SimulationPanel'
import { button, label, row } from './Components/UI/Widgets'
import { advancePlayback } from '../Utils/PlaybackMath'
import { disposeScene } from '../Utils/Dispose'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.data = this.experience.data
        this.currentConjunctionIndex = 0
        this.currentManoeuvreIndex = null
        this.comparisonIndex = null
        this.activeSlot = 'A'
        this.catalogTab = 'conjunctions'
        this.catalogOpen = true
        this.linkedPlayback = false
        this.loopPlayback = false
        this.playbackRate = 1
        this.playbackDirection = 1
        this.vrStick = new THREE.Vector2()
        this.slots = { A: { time: 0, playing: false }, B: { time: 0, playing: false } }
        this.view = 'globe'
        this.showCovariance = true
        this.showProjections = true
        this.showTrajectories = true
        this.detailFocus = true
        this.zoom = 1
        this.sigma = 3
        this.handMenus = true
        this.cameraPosition = new THREE.Vector3()
        this.handPosition = new THREE.Vector3()
    }

    initialize() {
        this.root = document.querySelector('#collisionBox').object3D
        this.slotA = new THREE.Group()
        this.slotB = new THREE.Group()
        this.slotA.userData.simulationRoot = true
        this.slotB.userData.simulationRoot = true
        this.root.add(this.slotA, this.slotB)
        this.slotA.add(this.experience.globeView, this.experience.roomView)
        this.globe = new Globe()
        this.room = new Room()
        const globeB = new THREE.Group(), roomB = new THREE.Group()
        this.slotB.add(globeB, roomB)
        this.globeB = new Globe(globeB)
        this.roomB = new Room(roomB)
        this.environment = new Environment()
        this.conjunctionsMenu = new Panel('Conjunctions', 'conjunctionCard', this.data.conjunctions.length)
        this.addCatalogTabs(this.conjunctionsMenu)
        this.conjunctionsMenu.setHeader()
        this.conjunctionsMenu.setGrid(this.data.conjunctions, 4)
        this.selectConjunction(0)
        this.controls = new AnalysisControls(this)
        this.summaryA = new SimulationPanel(this, 'A')
        this.summaryB = new SimulationPanel(this, 'B')
        this.controls.mountSummaries(this.summaryA, this.summaryB)
        this.resizeListener = () => this.layout()
        window.addEventListener('resize', this.resizeListener)
        this.setView('globe')
        this.reset()
        const ray = this.experience.raycaster
        ray.on(this.experience.rightHand, 'abuttondown', () => this.togglePlayback())
        ray.on(this.experience.rightHand, 'bbuttondown', () => this.setView(this.view === 'globe' ? 'room' : 'globe'))
        ray.on(this.experience.leftHand, 'xbuttondown', () => this.toggleCatalog())
        ray.on(this.experience.leftHand, 'ybuttondown', () => this.reset())
        ray.on(this.experience.rightHand, 'thumbstickmoved', event => this.vrStick.set(event.detail.x, event.detail.y))
        ray.on(this.experience.rightHand, 'controllerdisconnected', () => this.vrStick.set(0, 0))
        ray.on(this.experience.aframeScene, 'exit-vr', () => { this.vrStick.set(0, 0); this.layout() })
    }

    addCatalogTabs(panel) {
        const tabs = row(1.3)
        panel.catalogButtons = {
            conjunctions: button(tabs, 'Conjunctions', () => this.setCatalogTab('conjunctions'), this.experience.raycaster, 0.58),
            manoeuvres: button(tabs, 'Manoeuvres', () => this.setCatalogTab('manoeuvres'), this.experience.raycaster, 0.62)
        }
        panel.mesh.add(tabs)
    }
    setCatalogTab(tab) {
        this.catalogTab = tab === 'manoeuvres' ? 'manoeuvres' : 'conjunctions'
        this.catalogOpen = true
        this.syncCatalog()
    }
    toggleCatalog() { this.catalogOpen = !this.catalogOpen; this.syncCatalog() }
    syncCatalog() {
        const search = this.conjunctionsMenu?.header?.searchPopup
        if (search?.panel.isOpen && (!this.catalogOpen || this.catalogTab !== 'conjunctions')) search.toggle()
        for (const [tab, panel] of [['conjunctions', this.conjunctionsMenu], ['manoeuvres', this.manoeuvresMenu]]) {
            if (!panel) continue
            this.catalogOpen && tab === this.catalogTab ? panel.show() : panel.hide()
            for (const [id, item] of Object.entries(panel.catalogButtons)) item.active = id === this.catalogTab
        }
        this.manoeuvreContext?.set({ content: `Choose for simulation ${this.activeSlot}` })
        this.controls?.update()
    }
    get conjunction() { return this.data.conjunctions[this.currentConjunctionIndex] }
    get manoeuvre() { return this.conjunction.manoeuvres[this.currentManoeuvreIndex] ?? null }
    get comparison() { return this.conjunction.manoeuvres[this.comparisonIndex] ?? null }
    setActiveSlot(slot) {
        this.activeSlot = slot === 'B' && this.comparison ? 'B' : 'A'
        this.manoeuvresMenu.grid.markSelected(this.activeSlot === 'A' ? this.currentManoeuvreIndex : this.comparisonIndex)
        this.summaryA?.update(); this.summaryB?.update()
        if (this.catalogOpen) this.catalogTab = 'manoeuvres'
        this.syncCatalog()
    }
    toggleComparison() {
        if (this.comparisonIndex === null && this.conjunction.manoeuvres.length > 1) {
            this.comparisonIndex = (this.currentManoeuvreIndex + 1) % this.conjunction.manoeuvres.length
            this.activeSlot = 'B'
        } else { this.comparisonIndex = null; this.activeSlot = 'A' }
        this.slots.B = { time: 0, playing: false }
        if (!this.comparison) this.linkedPlayback = false
        this.controls?.syncComparison()
        this.experience.raycaster.releaseGrab()
        this.refresh()
        this.setActiveSlot(this.activeSlot)
        this.layout()
    }
    selectConjunction(index) {
        if (!this.data.conjunctions[index]) return
        this.experience.raycaster.releaseGrab()
        this.currentConjunctionIndex = index
        this.comparisonIndex = null
        this.linkedPlayback = false
        this.activeSlot = 'A'
        this.slots = { A: { time: 0, playing: false }, B: { time: 0, playing: false } }
        this.currentManoeuvreIndex = this.conjunction.manoeuvres.length ? 0 : null
        this.conjunctionsMenu.grid.markSelected(index)
        this.manoeuvresMenu?.destroy()
        this.manoeuvresMenu = new Panel('Manoeuvres', 'manoeuvreCard', this.conjunction.manoeuvres.length)
        this.addCatalogTabs(this.manoeuvresMenu)
        this.manoeuvresMenu.setHeader()
        this.manoeuvreContext = label(this.manoeuvresMenu.mesh, `Choose for simulation ${this.activeSlot}`, 1.3, 0.13)
        const sorting = row(1.3)
        this.manoeuvresMenu.sortButtons = {}
        for (const [key, title] of [['poc', 'PoC'], ['miss', 'Miss'], ['cost', 'dV']]) {
            this.manoeuvresMenu.sortButtons[key] = button(sorting, title, () => {
                this.manoeuvresMenu.grid.setSort(key)
                for (const [id, item] of Object.entries(this.manoeuvresMenu.sortButtons)) item.active = id === key
            }, this.experience.raycaster, 0.36)
        }
        this.manoeuvresMenu.mesh.add(sorting)
        this.manoeuvresMenu.setGrid(this.conjunction.manoeuvres, 7)
        this.manoeuvresMenu.grid.markSelected(this.currentManoeuvreIndex)
        this.controls?.syncComparison()
        if (this.experience.initialized) this.catalogTab = 'manoeuvres'
        this.syncCatalog()
        this.refresh()
        this.layout()
    }
    selectManoeuvre(index) {
        if (!this.conjunction.manoeuvres[index]) return
        if (this.activeSlot === 'B') this.comparisonIndex = index
        else this.currentManoeuvreIndex = index
        this.slots[this.activeSlot] = { time: 0, playing: false }
        this.manoeuvresMenu.grid.markSelected(index)
        this.refresh(this.activeSlot)
        if (this.linkedPlayback && this.comparison) this.seek(this.activeSlot, 0)
        this.controls?.setTab('analyse')
    }
    refresh(slot) {
        if (slot !== 'B') {
            this.globe.updateScenario(this.conjunction, this.manoeuvre)
            this.room.updateScenario(this.conjunction, this.manoeuvre)
        }
        if (this.comparison && slot !== 'A') {
            this.globeB.updateScenario(this.conjunction, this.comparison)
            this.roomB.updateScenario(this.conjunction, this.comparison)
        }
        this.applyTime('A')
        if (this.comparison) this.applyTime('B')
        this.controls?.update()
        this.summaryA?.update(); this.summaryB?.update()
        window.dispatchEvent(new Event('scenariochange'))
    }
    applyTime(slot) {
        const second = slot === 'B', manoeuvre = second ? this.comparison : this.manoeuvre
        ;(second ? this.globeB : this.globe).setTime(this.conjunction, manoeuvre, this.slots[slot].time)
        ;(second ? this.roomB : this.room).setTime(this.conjunction, manoeuvre, this.slots[slot].time)
    }
    affectedSlots(slot = this.activeSlot) { return this.linkedPlayback && this.comparison ? ['A', 'B'] : [slot] }
    seek(slot, time) {
        for (const id of this.affectedSlots(slot)) {
            this.slots[id].playing = false
            this.slots[id].time = THREE.MathUtils.clamp(time, -this.timeWindow, this.timeWindow)
            this.applyTime(id)
            ;(id === 'A' ? this.summaryA : this.summaryB)?.update()
        }
        this.controls?.update()
    }
    stepSlot(slot, delta, reset = false) { this.seek(slot, reset ? 0 : this.slots[slot].time + delta) }
    togglePlayback() {
        const playing = !this.slots[this.activeSlot].playing
        if (playing && this.slots[this.activeSlot].time * this.playbackDirection >= this.timeWindow) this.seek(this.activeSlot, -this.playbackDirection * this.timeWindow)
        for (const id of this.affectedSlots()) this.slots[id].playing = playing
        this.controls?.update()
    }
    togglePlaybackLink() {
        this.linkedPlayback = !this.linkedPlayback && !!this.comparison
        if (this.linkedPlayback) this.seek(this.activeSlot, this.slots[this.activeSlot].time)
        this.controls?.update()
    }
    get timeWindow() { return this.view === 'globe' ? 300 : 0.5 }
    setView(view) {
        if (view !== this.view) for (const slot of ['A', 'B']) { this.slots[slot].time = 0; this.slots[slot].playing = false }
        this.view = view === 'room' ? 'room' : 'globe'
        this.applyTime('A')
        if (this.comparison) this.applyTime('B')
        this.globe.view.visible = this.globeB.view.visible = this.view === 'globe'
        this.room.view.visible = this.roomB.view.visible = this.view === 'room'
        if (this.conjunctionsMenu?.views) {
            this.conjunctionsMenu.views.globeViewButton.active = this.view === 'globe'
            this.conjunctionsMenu.views.roomViewButton.active = this.view === 'room'
        }
        this.controls?.update()
        this.summaryA?.update(); this.summaryB?.update()
        window.dispatchEvent(new Event('scenariochange'))
    }
    layout(recenter = false) {
        if (!this.root) return
        const camera = this.experience.aframeScene.camera
        const distance = Math.max(5.2, 4.15 / (Math.tan(THREE.MathUtils.degToRad(60 / 2)) * camera.aspect))
        if (recenter || !this.workspacePose) {
            const position = camera.getWorldPosition(new THREE.Vector3())
            const forward = camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize()
            if (forward.lengthSq() < 0.1) forward.set(0, 0, -1)
            this.workspacePose = { position, forward }
        }
        this.workspaceDistance = distance
        const pov = this.workspacePose.position, forward = this.workspacePose.forward
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
        const place = (object, x, y, z) => object.position.copy(pov).addScaledVector(right, x).addScaledVector(forward, z).add(new THREE.Vector3(0, y, 0))
        const comparing = !!this.comparison
        place(this.root, 0, 0.55, distance)
        this.root.rotation.y = Math.atan2(-forward.x, -forward.z)
        this.slotA.position.set(comparing ? -1.08 : 0, 0, 0)
        this.slotB.position.set(1.08, 0, 0)
        this.slotB.visible = comparing
        for (const globe of [this.globe, this.globeB]) globe.view.scale.setScalar(comparing ? 0.76 : 0.98)
        for (const room of [this.room, this.roomB]) room.view.scale.setScalar(comparing ? 0.57 : 0.73)
        for (const panel of [this.conjunctionsMenu, this.manoeuvresMenu]) {
            if (!panel) continue
            place(panel.mesh, -3, 0.55, distance - 0.3)
            panel.mesh.lookAt(pov)
            panel.mesh.scale.setScalar(panel.grid?.columns === 2 ? 0.57 : 0.85)
        }
        if (this.controls) {
            place(this.controls.panel.mesh, 0, -1.3, distance - 1.1)
            this.controls.panel.mesh.lookAt(pov)
            this.controls.panel.mesh.scale.setScalar(0.6)
        }
        this.syncCatalog()
    }
    layoutCatalog() {
        if (!this.workspacePose) return
        const { position, forward } = this.workspacePose
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
        for (const panel of [this.conjunctionsMenu, this.manoeuvresMenu]) {
            if (!panel) continue
            panel.mesh.position.copy(position).addScaledVector(right, -3).addScaledVector(forward, this.workspaceDistance - 0.3).add(new THREE.Vector3(0, 0.55, 0))
            panel.mesh.lookAt(position)
            panel.mesh.scale.setScalar(panel.grid?.columns === 2 ? 0.57 : 0.85)
        }
    }
    reset() {
        this.experience.raycaster.releaseGrab()
        this.root.quaternion.identity()
        this.root.scale.setScalar(1)
        for (const slot of [this.slotA, this.slotB]) { slot.quaternion.identity(); slot.scale.setScalar(1) }
        if (!this.experience.aframeScene.is('vr-mode')) {
            this.experience.camera.object3D.position.set(0, 1.6, 0)
            const look = this.experience.camera.components['look-controls']
            if (look) { look.pitchObject.rotation.x = 0; look.yawObject.rotation.y = 0 }
            const movement = this.experience.camera.components['wasd-controls']
            if (movement) { movement.velocity.set(0, 0, 0); movement.keys = {} }
        }
        this.layout(true)
    }
    update() {
        const dt = Math.min(this.experience.time.delta, 100) / 1000
        if (this.experience.aframeScene.is('vr-mode') && this.vrStick.length() > 0.2) {
            if (Math.abs(this.vrStick.x) > Math.abs(this.vrStick.y)) this.seek(this.activeSlot, this.slots[this.activeSlot].time + this.vrStick.x * dt * this.timeWindow)
            else {
                const root = this.activeSlot === 'A' ? this.slotA : this.slotB
                root.scale.setScalar(THREE.MathUtils.clamp(root.scale.x * Math.exp(-this.vrStick.y * dt), 0.7, 1.3))
            }
        }
        for (const slot of ['A', 'B']) {
            if (slot === 'B' && !this.comparison) continue
            if (this.slots[slot].playing) {
                const delta = dt * (this.view === 'globe' ? 30 : 0.1) * this.playbackRate * this.playbackDirection
                const next = advancePlayback(this.slots[slot].time, delta, this.timeWindow, this.loopPlayback)
                Object.assign(this.slots[slot], next)
                this.applyTime(slot)
                if (!this.slots[slot].playing || !this.slots[slot].nextLabelAt || this.experience.time.elapsed >= this.slots[slot].nextLabelAt) {
                    ;(slot === 'A' ? this.summaryA : this.summaryB).update()
                    this.controls?.update()
                    this.slots[slot].nextLabelAt = this.experience.time.elapsed + 100
                }
            }
            const view = slot === 'A' ? (this.view === 'globe' ? this.globe : this.room) : (this.view === 'globe' ? this.globeB : this.roomB)
            view.update()
        }
        if (this.handMenus && this.experience.aframeScene.is('vr-mode')) {
            this.experience.aframeScene.camera.getWorldPosition(this.cameraPosition)
            const hand = this.experience.leftHand
            const panel = this.catalogTab === 'conjunctions' ? this.conjunctionsMenu : this.manoeuvresMenu
            if (hand.components['tracked-controls']?.controller && this.catalogOpen) {
                hand.object3D.getWorldPosition(this.handPosition)
                panel.mesh.position.copy(this.handPosition).add(new THREE.Vector3(0, 0.12, -0.15))
                panel.mesh.scale.setScalar(panel.grid?.columns === 2 ? 0.075 : 0.12)
                panel.mesh.lookAt(this.cameraPosition)
            }
        }
        // UI is an information layer. Earth, walls and trajectories cannot cut
        // through cards; ordering between panels/popups still follows their depth.
        this.scene.traverse(node => {
            if (!node.isMesh) return
            let ui = false
            for (let parent = node.parent; parent; parent = parent.parent) if (parent.isUI) { ui = true; break }
            if (!ui) return
            node.renderOrder = 100
            for (const material of [].concat(node.material)) { material.depthTest = false; material.depthWrite = false }
        })
    }
    destroy() {
        window.removeEventListener('resize', this.resizeListener)
        this.summaryA?.destroy(); this.summaryB?.destroy(); this.controls?.destroy()
        this.conjunctionsMenu?.destroy(); this.manoeuvresMenu?.destroy()
        for (const view of [this.globe, this.room, this.globeB, this.roomB]) view.destroy()
        disposeScene(this.slotB)
        this.slotB.removeFromParent()
        this.environment.sunLight.removeFromParent()
        this.environment.sunLight.dispose()
    }
}
