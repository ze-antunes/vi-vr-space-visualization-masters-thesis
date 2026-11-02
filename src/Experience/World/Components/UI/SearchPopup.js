import Panel from './Panel'
import * as THREE from 'three'
import { button, label, row } from './Widgets'

export default class SearchPopup {
    constructor(owner) {
        this.owner = owner
        this.query = ''
        this.keys = new Map()
        this.panel = new Panel('Search', 'search', 0)
        this.panel.mesh.position.set(0, 1.6, -3.5)
        this.panel.mesh.scale.setScalar(0.9)
        const mesh = this.panel.mesh, raycaster = owner.experience.raycaster
        label(mesh, 'Search name or COSPAR ID', 3.3, 0.2)
        this.value = label(mesh, 'All conjunctions', 3.3, 0.2)
        for (const keys of ['ABCDEFGHIJ', 'KLMNOPQRST', 'UVWXYZ0123', '456789- ']) {
            const line = row(3.3)
            for (const key of keys) this.keys.set(key, button(line, key === ' ' ? '_' : key, () => this.setQuery(this.query + key), raycaster, 0.26))
            mesh.add(line)
        }
        const actions = row(3.3)
        button(actions, 'Delete', () => this.setQuery(this.query.slice(0, -1)), raycaster, 0.7)
        button(actions, 'Clear', () => this.setQuery(''), raycaster, 0.7)
        button(actions, 'Done', () => this.toggle(), raycaster, 0.7)
        mesh.add(actions)
        this.keyListener = event => {
            if (!this.panel.isOpen || event.ctrlKey || event.metaKey || event.altKey) return
            if (event.key === 'Escape' || event.key === 'Enter') this.toggle()
            else if (event.key === 'Backspace') this.setQuery(this.query.slice(0, -1))
            else if (/^[a-z0-9 -]$/i.test(event.key)) this.setQuery(this.query + event.key.toUpperCase())
            else return
            event.preventDefault()
        }
        document.addEventListener('keydown', this.keyListener)
        this.panel.hide()
    }
    setQuery(query) {
        this.query = query.slice(0, 40)
        this.owner.grid.setFilter(this.query)
        this.value.set({ content: this.query || 'All conjunctions' })
    }
    toggle() {
        this.panel.isOpen ? this.panel.hide() : this.panel.show()
        if (this.panel.isOpen) {
            const camera = this.owner.experience.aframeScene.camera
            const pov = camera.getWorldPosition(new THREE.Vector3())
            const forward = camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize()
            if (forward.lengthSq() < 0.1) forward.set(0, 0, -1)
            this.panel.mesh.position.copy(pov).addScaledVector(forward, 2)
            this.panel.mesh.lookAt(pov)
            this.panel.mesh.scale.setScalar(0.55)
        }
        this.owner.header.search.active = this.panel.isOpen
        this.owner.experience.raycaster.modalRoot = this.panel.isOpen ? this.panel.mesh : null
        const movement = this.owner.experience.camera.components['wasd-controls']
        movement?.velocity.set(0, 0, 0)
        if (this.panel.isOpen) movement?.pause()
        else movement?.play()
    }
    destroy() { if (this.panel.isOpen) this.toggle(); document.removeEventListener('keydown', this.keyListener); this.panel.destroy() }
}
