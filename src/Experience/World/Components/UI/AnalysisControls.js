import ThreeMeshUI from 'three-mesh-ui'
import Panel from './Panel'
import Timeline from './Timeline'
import FontJSON from '../../../../fonts/Roboto-msdf.json'
import FontImage from '../../../../fonts/Roboto-msdf.png'
import { button, label, row } from './Widgets'

export default class AnalysisControls {
    constructor(world) {
        this.world = world
        this.tab = 'analyse'
        this.compact = false
        this.panel = new Panel('Analysis console', 'controls', 0)
        const mesh = this.panel.mesh, raycaster = world.experience.raycaster
        const navigation = row(5.4)
        this.globeViewButton = button(navigation, 'Globe', () => world.setView('globe'), raycaster, 0.7)
        this.roomViewButton = button(navigation, 'Room', () => world.setView('room'), raycaster, 0.7)
        this.compare = button(navigation, 'Compare A/B', () => world.toggleComparison(), raycaster, 1.1)
        this.catalog = button(navigation, 'Catalogue', () => world.toggleCatalog(), raycaster, 0.95)
        this.focusMode = button(navigation, 'Focus', () => this.toggleCompact(), raycaster, 0.75)
        button(navigation, 'Recenter', () => world.reset(), raycaster, 0.8)
        mesh.add(navigation)
        const tabs = row(5.4)
        this.tabButtons = {}
        for (const [id, title] of [['analyse', 'Analyse'], ['display', 'Display'], ['details', 'Details'], ['help', 'Help']]) {
            this.tabButtons[id] = button(tabs, title, () => this.setTab(id), raycaster, 1.15)
        }
        this.help = this.tabButtons.help
        this.tabsRow = tabs
        mesh.add(tabs)
        this.pageHost = new ThreeMeshUI.Block({ width: 5.4, height: 1.85, justifyContent: 'center', backgroundOpacity: 0 })
        mesh.add(this.pageHost)
        this.pages = {}
        for (const id of Object.keys(this.tabButtons)) this.pages[id] = new ThreeMeshUI.Block({ width: 5.35, height: 1.85, justifyContent: 'center', backgroundOpacity: 0, fontFamily: FontJSON, fontTexture: FontImage })
        this.summaryRow = row(5.2)
        this.pages.analyse.add(this.summaryRow)
        this.timeline = new Timeline(world, this.pages.analyse)
        const options = row(5.2)
        this.uncertainty = button(options, 'Covariance', () => { world.showCovariance = !world.showCovariance; world.refresh() }, raycaster, 1)
        this.projections = button(options, 'Projections', () => { world.showProjections = !world.showProjections; world.refresh() }, raycaster, 1)
        this.sigma = button(options, '3 sigma', () => { world.sigma = world.sigma % 3 + 1; world.refresh() }, raycaster, 0.75)
        this.tracks = button(options, 'Trajectories', () => { world.showTrajectories = !world.showTrajectories; world.refresh() }, raycaster, 1)
        this.focus = button(options, 'Position focus', () => { world.detailFocus = !world.detailFocus; world.refresh() }, raycaster, 1.15)
        this.pages.display.add(options)
        this.displayInfo = label(this.pages.display, '', 5.1, 0.45)
        this.menus = button(this.pages.display, 'Attach catalogue to left hand', () => { world.handMenus = !world.handMenus; world.layoutCatalog() }, raycaster, 2.7)
        label(this.pages.display, 'Green: baseline target | Blue: chaser | Yellow: candidate target', 5.1, 0.22)
        this.details = label(this.pages.details, '', 5.1, 1.5)
        label(this.pages.help, 'Trigger selects / drags timeline. Grip moves each scene. Right A: play/pause; B: Globe/Room. Left X: catalogue; Y: recenter.', 5.1, 0.4)
        label(this.pages.help, 'Right stick: horizontal scrubs time; vertical resizes the active scene. Select an A/B card before choosing its manoeuvre. Link A/B synchronises relative TCA offsets.', 5.1, 0.4)
        label(this.pages.help, 'Mouse: left drag looks; right drag rotates a scene; wheel resizes it. WASD moves; R recenters. Focus collapses this console; catalogue can be hidden.', 5.1, 0.4)
        label(this.pages.help, 'Dashed paths and animation are two-body estimates, not reconstructed thrust. Supplied PoC/miss stay distinct from estimated separation. Covariance remains at baseline epoch.', 5.1, 0.4)
        this.context = label(mesh, '', 5.3, 0.2)
        for (const root of [mesh, ...Object.values(this.pages)]) root.traverse(node => { if (node.isText) node.set({ fontSize: 0.1 }) })
        this.setTab('analyse')
    }
    mountSummaries(a, b) {
        this.summaries = { a, b }
        this.summaryRow.add(a.panel.mesh)
        this.syncComparison()
    }
    syncComparison() {
        if (!this.summaries) return
        const { a, b } = this.summaries
        if (this.world.comparison) { this.summaryRow.add(b.panel.mesh); b.panel.mesh.visible = true }
        else { b.panel.mesh.removeFromParent(); b.panel.mesh.visible = false }
        a.panel.mesh.scale.setScalar(1); b.panel.mesh.scale.setScalar(1)
        this.panel.mesh.update(false, true, false)
    }
    setTab(tab) {
        if (!this.pages[tab]) return
        if (this.currentPage) { this.currentPage.removeFromParent(); this.currentPage.visible = false }
        this.tab = tab
        this.compact = false
        this.currentPage = this.pages[tab]
        this.currentPage.visible = true
        this.pageHost.add(this.currentPage)
        if (!this.pageHost.parent) { this.panel.mesh.add(this.pageHost); this.panel.mesh.add(this.context.parent) }
        this.focusMode.text.set({ content: 'Focus' })
        this.pageHost.visible = true
        for (const [id, item] of Object.entries(this.tabButtons)) item.active = id === tab
        this.update()
        this.panel.mesh.update(false, true, false)
    }
    toggleCompact() {
        this.compact = !this.compact
        if (this.compact) this.pageHost.removeFromParent()
        else { this.panel.mesh.add(this.pageHost); this.panel.mesh.add(this.context.parent) }
        this.focusMode.text.set({ content: this.compact ? 'Expand' : 'Focus' })
        this.pageHost.visible = !this.compact
        this.panel.mesh.update(false, true, false)
    }
    update() {
        const w = this.world
        if (!this.timeline) return
        this.uncertainty.active = w.showCovariance
        this.projections.active = w.showProjections
        this.tracks.active = w.showTrajectories
        this.focus.active = w.detailFocus
        this.menus.active = w.handMenus
        this.compare.active = !!w.comparison
        this.compare.disabled = !w.manoeuvre || w.conjunction.manoeuvres.length < 2
        this.globeViewButton.active = w.view === 'globe'
        this.roomViewButton.active = w.view === 'room'
        this.catalog.active = w.catalogOpen
        this.sigma.text.set({ content: `${w.sigma} sigma` })
        this.timeline.update()
        const room = w.activeSlot === 'A' ? w.room : w.roomB
        if (!room.transform) return
        this.displayInfo.set({ content: `Same position scale for A/B: 1 unit = ${(room.metersPerUnit / 1000).toFixed(2)} km\nBaseline covariance display x${room.covarianceGain.toPrecision(2)} | symbolic object sizes` })
        const m = w.activeSlot === 'A' ? w.manoeuvre : w.comparison
        const utc = value => new Date(value).toISOString().replace('T', ' ').replace('Z', ' UTC')
        const baseline = w.conjunction.summary
        this.details.set({ content: `Simulation ${w.activeSlot} | ${w.conjunction.target.name} / ${w.conjunction.chaser.name}\nBaseline TCA: ${utc(w.conjunction.details.tca)}\nCandidate TCA: ${utc(m?.collision_avoidance.tca ?? w.conjunction.details.tca)}\nFuel (dataset): ${m?.sum_fuel_consumption?.toFixed(4) ?? 'N/A'} | duration: ${m?.sum_duration?.toFixed(1) ?? 'N/A'} s\nBaseline PoC: ${baseline.poc_latest?.toExponential(2) ?? 'N/A'} | baseline miss: ${baseline.miss_distance_latest.toFixed(0)} m\nCovariance is not propagated. Estimated paths do not reconstruct burn execution.` })
        this.context.set({ content: `${w.conjunction.target.name} | editing ${w.activeSlot} | supplied metrics / estimated motion` })
    }
    destroy() {
        // Detached pages still own UI resources and interactive registrations.
        for (const page of Object.values(this.pages)) if (page !== this.currentPage) this.panel.mesh.add(page)
        if (!this.pageHost.parent) this.panel.mesh.add(this.pageHost)
        this.panel.destroy()
    }
}
