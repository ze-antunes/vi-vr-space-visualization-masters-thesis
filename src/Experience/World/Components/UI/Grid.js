import ThreeMeshUI from 'three-mesh-ui'
import ConjunctionCard from './ConjunctionCard'
import ManoeuvreCard from './ManoeuvreCard'
import Pages from './Pages'
import { disposeUI } from '../../../Utils/Dispose'
import { pageWindow } from '../../../Utils/Pagination'

export default class Grid {
    constructor(panel, data, pageSize) {
        this.panel = panel
        this.experience = panel.experience
        this.data = data
        this.entries = data.map((value, index) => ({ value, index }))
        this.pageSize = pageSize
        this.columns = 1
        this.rows = []
        this.numbCards = pageSize
        this.startIndex = 0
        this.cards = []
        this.selectedIndex = null
        this.grid = new ThreeMeshUI.Block({ width: 1.2, justifyContent: 'center', contentDirection: 'column', margin: 0.02, backgroundOpacity: 0 })
        panel.mesh.add(this.grid)
        this.setCards(0)
        this.pages = new Pages(panel.mesh, data.length, this.status, this)
        this.pages.update()
    }
    setCards(requested) {
        this.cards.forEach(card => card.destroy())
        this.cards = []
        this.rows.forEach(row => disposeUI(row))
        this.rows = []
        if (this.empty) { disposeUI(this.empty); this.empty = null }
        this.window = pageWindow(this.entries.length, this.numbCards, requested)
        this.startIndex = this.window.start
        const Card = this.panel.cardType === 'conjunctionCard' ? ConjunctionCard : ManoeuvreCard
        for (const [offset, entry] of this.entries.slice(this.window.start, this.window.end).entries()) {
            if (this.columns === 2 && offset % 2 === 0) {
                const row = new ThreeMeshUI.Block({ width: 2.55, contentDirection: 'row', justifyContent: 'center', backgroundOpacity: 0 })
                this.rows.push(row)
                this.grid.add(row)
            }
            const parent = this.columns === 2 ? this.rows.at(-1) : this.grid
            const card = new Card(parent, entry.value, entry.index, this.panel)
            card.setActive(entry.index === this.selectedIndex)
            this.cards.push(card)
        }
        if (!this.entries.length) {
            this.empty = new ThreeMeshUI.Block({ width: 1.25, height: 0.25, backgroundOpacity: 0 })
            this.empty.add(new ThreeMeshUI.Text({ content: 'No matching records' }))
            this.grid.add(this.empty)
        }
        this.status = this.entries.length ? `${this.window.start + 1}-${this.window.end} of ${this.entries.length}` : '0 records'
        this.pages?.update()
        // Adding Block children does not invalidate an unchanged parent layout in
        // three-mesh-ui. Filters with the same result count still need a reflow.
        this.panel.mesh.update(false, true, false)
    }
    toggleColumns() {
        this.columns = this.columns === 1 ? 2 : 1
        this.numbCards = this.pageSize * this.columns
        this.grid.set({ width: this.columns === 1 ? 1.2 : 2.55 })
        this.experience.world.layoutCatalog()
        this.setCards(Math.floor(this.startIndex / this.numbCards) * this.numbCards)
    }
    setSort(key) {
        const value = item => key === 'poc' ? item.collision_avoidance.poc : key === 'miss' ? -item.collision_avoidance.miss_distance.total : (item.sum_total_delta_v ?? Infinity)
        this.entries.sort((a, b) => value(a.value) - value(b.value) || a.index - b.index)
        this.setCards(0)
    }
    setFilter(query) {
        const term = query.trim().toLowerCase()
        this.entries = this.data.map((value, index) => ({ value, index })).filter(({ value }) =>
            `${value.target?.name ?? ''} ${value.chaser?.name ?? ''} ${value.target?.cospar_id ?? ''} ${value.chaser?.cospar_id ?? ''}`.toLowerCase().includes(term))
        this.setCards(0)
    }
    markSelected(index) {
        this.selectedIndex = index
        const entry = this.entries.findIndex(entry => entry.index === index)
        if (entry >= 0 && (entry < this.window.start || entry >= this.window.end)) this.setCards(entry)
        this.cards.forEach(card => card.setActive(card.id === index))
    }
    previousCards() { this.setCards(this.startIndex - this.numbCards) }
    nextCards() { this.setCards(this.startIndex + this.numbCards) }
    destroy() {
        if (!this.grid) return
        this.cards.forEach(card => card.destroy())
        this.cards = []
        this.pages?.destroy()
        disposeUI(this.grid, this.experience.raycaster)
        this.grid = null
    }
}
