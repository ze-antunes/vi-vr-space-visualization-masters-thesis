import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Panel from './Panel'
import { button, label } from './Widgets'

const format = value => Number.isFinite(value) ? value.toFixed(0) : 'N/A'
// A metric column inside the shared console, rather than a floating window.
export default class SimulationPanel {
    constructor(world, slot) {
        this.world = world
        this.slot = slot
        this.panel = new Panel(`Simulation ${slot}`, 'simulation', 0)
        this.panel.mesh.set({ backgroundOpacity: 0, borderRadius: 0, padding: 0 })
        this.panel.mesh.scale.setScalar(1)
        const mesh = this.panel.mesh
        this.heading = button(mesh, `Simulation ${slot}`, () => world.setActiveSlot(slot), world.experience.raycaster, 2.35)
        const card = new ThreeMeshUI.Block({ width: 2.35, height: 0.48, contentDirection: 'row', justifyContent: 'center', margin: 0.025, padding: 0.02, borderRadius: 0.06, backgroundColor: new THREE.Color('#505050') })
        this.poc = label(card, '', 0.7, 0.42)
        this.miss = label(card, '', 0.7, 0.42)
        this.cost = label(card, '', 0.7, 0.42)
        mesh.add(card)
        this.clock = label(mesh, '', 2.35, 0.2)
        mesh.traverse(node => { if (node.isText) node.set({ fontSize: 0.1 }) })
    }
    update() {
        const w = this.world, m = this.slot === 'A' ? w.manoeuvre : w.comparison
        if (this.slot === 'B' && !m) return
        const metric = m?.collision_avoidance, baseline = w.conjunction.summary
        const index = this.slot === 'A' ? w.currentManoeuvreIndex : w.comparisonIndex
        this.heading.active = w.activeSlot === this.slot
        this.heading.text.set({ content: `${this.slot} | ${m ? `manoeuvre #${index + 1}` : 'baseline'}${w.activeSlot === this.slot ? ' | editing' : ''}` })
        this.poc.set({ content: `PoC (data)\n${(metric?.poc ?? baseline.poc_latest)?.toExponential(2) ?? 'N/A'}` })
        this.miss.set({ content: `Miss (data)\n${format(metric?.miss_distance.total ?? baseline.miss_distance_latest)} m` })
        this.cost.set({ content: `Delta-v\n${Number.isFinite(m?.sum_total_delta_v) ? m.sum_total_delta_v.toFixed(4) : 'N/A'} m/s` })
        const room = this.slot === 'A' ? w.room : w.roomB
        this.clock.set({ content: `t ${w.slots[this.slot].time >= 0 ? '+' : ''}${w.slots[this.slot].time.toFixed(2)} s | estimate ${format(room.estimatedSeparation)} m` })
    }
    destroy() { this.panel.destroy() }
}
