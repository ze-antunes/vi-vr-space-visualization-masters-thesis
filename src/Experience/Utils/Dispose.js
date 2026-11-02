// Remove components from three-mesh-ui's UpdateManager as well as the scene.
// Texture ownership stays with Resources; UI components must not dispose maps.
export function disposeUI(root, raycaster) {
    if (!root) return
    const descendants = new Set()
    root.traverse(node => descendants.add(node))
    if (raycaster) {
        const list = raycaster.objsToTest
        for (let i = list.length - 1; i >= 0; i--) {
            if (descendants.has(list[i])) list.splice(i, 1)
        }
    }
    root.removeFromParent()
    root.clear()
}

export function disposeScene(root) {
    const geometries = new Set()
    const materials = new Set()
    root.traverse(node => {
        if (node.geometry) geometries.add(node.geometry)
        if (node.material) for (const material of [].concat(node.material)) materials.add(material)
    })
    geometries.forEach(geometry => geometry.dispose())
    materials.forEach(material => material.dispose())
}
