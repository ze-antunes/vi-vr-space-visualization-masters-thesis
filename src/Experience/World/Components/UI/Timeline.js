import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import { button, label, row } from './Widgets'

export default class Timeline {
    constructor(world, parent) {
        this.world = world
        const raycaster = world.experience.raycaster
        this.status = label(parent, '', 5.1, 0.18)
        this.bar = new ThreeMeshUI.Block({ width: 5, height: 0.13, margin: 0.025, borderRadius: 0.04, backgroundColor: new THREE.Color('#505050') })
        this.bar.setupState({ state: 'idle', attributes: { backgroundColor: new THREE.Color('#505050') } })
        this.bar.setupState({ state: 'hovered', attributes: { backgroundColor: new THREE.Color('#949494') } })
        this.bar.setupState({ state: 'selected', attributes: { backgroundColor: new THREE.Color('#505050') } })
        this.thumb = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.18, 0.012), new THREE.MeshBasicMaterial({ color: '#FFBE0B', transparent: true, depthWrite: false }))
        this.thumb.position.z = 0.03
        const tca = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.13, 0.006), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false }))
        tca.position.z = 0.02
        this.fill = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.055), new THREE.MeshBasicMaterial({ color: '#FFBE0B', transparent: true, opacity: 0.6, depthWrite: false }))
        this.fill.position.z = 0.015
        this.bar.add(this.fill, tca, this.thumb)
        this.bar.onScrub = hit => {
            const point = this.bar.worldToLocal(hit.point.clone())
            world.seek(world.activeSlot, THREE.MathUtils.clamp(point.x / 2.5, -1, 1) * world.timeWindow)
        }
        this.bar.onActivate = hit => { if (hit) this.bar.onScrub(hit) }
        raycaster.objsToTest.push(this.bar)
        parent.add(this.bar)
        const transport = row(5.3)
        button(transport, 'Start', () => world.seek(world.activeSlot, -world.timeWindow), raycaster, 0.4)
        this.back = button(transport, '-step', () => world.stepSlot(world.activeSlot, world.view === 'globe' ? -60 : -0.1), raycaster, 0.56)
        this.play = button(transport, 'Play', () => world.togglePlayback(), raycaster, 0.65)
        button(transport, 'TCA', () => world.seek(world.activeSlot, 0), raycaster, 0.5)
        this.forward = button(transport, '+step', () => world.stepSlot(world.activeSlot, world.view === 'globe' ? 60 : 0.1), raycaster, 0.56)
        this.direction = button(transport, 'Fwd', () => { world.playbackDirection *= -1; this.update() }, raycaster, 0.5)
        this.speed = button(transport, '1x', () => { world.playbackRate = world.playbackRate === 4 ? 0.25 : world.playbackRate * 2; this.update() }, raycaster, 0.55)
        this.link = button(transport, 'Link A/B', () => world.togglePlaybackLink(), raycaster, 0.7)
        this.loop = button(transport, 'Loop', () => { world.loopPlayback = !world.loopPlayback; this.update() }, raycaster, 0.55)
        parent.add(transport)
    }
    update() {
        const w = this.world, slot = w.slots[w.activeSlot]
        this.thumb.position.x = slot.time / w.timeWindow * 2.5
        this.fill.scale.x = Math.max(0.001, this.thumb.position.x + 2.5)
        this.fill.position.x = (this.thumb.position.x - 2.5) / 2
        this.back.text.set({ content: w.view === 'globe' ? '-60s' : '-0.1s' })
        this.forward.text.set({ content: w.view === 'globe' ? '+60s' : '+0.1s' })
        this.play.text.set({ content: slot.playing ? 'Pause' : 'Play' })
        this.play.active = slot.playing
        this.direction.text.set({ content: w.playbackDirection > 0 ? 'Fwd' : 'Rev' })
        const speed = (w.view === 'globe' ? 30 : 0.1) * w.playbackRate
        this.speed.text.set({ content: `${Number(speed.toPrecision(2))}x` })
        this.loop.active = w.loopPlayback
        this.link.active = w.linkedPlayback
        this.link.disabled = !w.comparison
        this.status.set({ content: `${w.linkedPlayback && w.comparison ? 'A + B: linked TCA offsets' : `Simulation ${w.activeSlot}`} | -${w.timeWindow}s  /  TCA  /  +${w.timeWindow}s | drag timeline` })
    }
}
