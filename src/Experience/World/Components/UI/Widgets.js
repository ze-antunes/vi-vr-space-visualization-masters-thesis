import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'

export function row(width = 2.7) {
    return new ThreeMeshUI.Block({ width, contentDirection: 'row', justifyContent: 'center', backgroundOpacity: 0, margin: 0.015 })
}

export function label(parent, content, width = 2.7, height = 0.16) {
    const block = new ThreeMeshUI.Block({ width, height, justifyContent: 'center', backgroundOpacity: 0, fontSize: 0.07 })
    const text = new ThreeMeshUI.Text({ content })
    block.add(text)
    parent.add(block)
    return text
}

export function button(parent, content, action, raycaster, width = 0.5) {
    const block = new ThreeMeshUI.Block({ width, height: 0.25, margin: 0.025, padding: 0.02, borderRadius: 0.06, justifyContent: 'center', textAlign: 'center', fontSize: 0.07 })
    const text = new ThreeMeshUI.Text({ content })
    block.add(text)
    block.setupState({ state: 'idle', attributes: { backgroundColor: new THREE.Color('#505050'), backgroundOpacity: 1, borderWidth: 0 } })
    block.setupState({ state: 'hovered', attributes: { backgroundColor: new THREE.Color('#949494'), backgroundOpacity: 1, borderWidth: 0 } })
    block.setupState({ state: 'selected', attributes: { backgroundColor: new THREE.Color('#121212'), backgroundOpacity: 1, borderColor: new THREE.Color('#FFBE0B'), borderWidth: 0.005, borderOpacity: 1 } })
    block.setupState({ state: 'disabled', attributes: { backgroundColor: new THREE.Color('#505050'), backgroundOpacity: 0.35, borderWidth: 0 } })
    block.onActivate = action
    block.text = text
    parent.add(block)
    raycaster.objsToTest.push(block)
    return block
}
