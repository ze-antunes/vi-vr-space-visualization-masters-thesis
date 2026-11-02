import AFRAME from 'aframe'
import Experience from './Experience/Experience'

AFRAME.registerComponent('experience-driver', {
    tick(time, delta) { window.experience?.update(time, delta) },
    remove() { window.experience?.destroy() }
})

const scene = document.getElementById('myScene')
let started = false
function start() {
    if (started || !scene.renderer || !scene.camera) return
    started = true
    new Experience(scene, scene.object3D, document.getElementById('myCamera'), document.getElementById('rightController'), document.getElementById('leftController'))
    scene.setAttribute('experience-driver', '')
}
scene.addEventListener('renderstart', start, { once: true })
start()
document.getElementById('retry').addEventListener('click', () => window.location.reload())
document.addEventListener('keydown', event => {
    if (event.repeat || event.target?.matches?.('input, select, textarea, button')) return
    const world = window.experience?.world
    if (!world || world.conjunctionsMenu.header.searchPopup?.panel.isOpen) return
    if (event.code === 'Space') { event.preventDefault(); world.togglePlayback() }
    if (event.key.toLowerCase() === 't') world.seek(world.activeSlot, 0)
    if (event.key.toLowerCase() === 'c') world.toggleComparison()
    if (event.key.toLowerCase() === 'f') world.controls.toggleCompact()
    if (event.key === '[' || event.key === ']') world.stepSlot(world.activeSlot, (event.key === '[' ? -1 : 1) * (world.view === 'globe' ? 60 : 0.1))
    if (event.key.toLowerCase() === 'e') scene.hasAttribute('stats') ? scene.removeAttribute('stats') : scene.setAttribute('stats', '')
    if (event.key.toLowerCase() === 'r') world.reset()
    if (event.key.toLowerCase() === 'u') { world.showCovariance = !world.showCovariance; world.refresh() }
    if (event.key.toLowerCase() === 'p') { world.showProjections = !world.showProjections; world.refresh() }
    if (event.key.toLowerCase() === 'm') { world.handMenus = !world.handMenus; world.layoutCatalog() }
})
