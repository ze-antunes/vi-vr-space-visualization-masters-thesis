import { test, expect } from '@playwright/test'
import fs from 'node:fs'
const dataset = JSON.parse(fs.readFileSync(new URL('../../static/conjunctions.json', import.meta.url)))

async function ready(page) {
    await page.goto('/')
    await page.waitForFunction(() => window.experience?.initialized, { timeout: 20000 })
    await expect(page.locator('#loader')).toBeHidden()
}

async function click3D(page, target) {
    const man = target === 'next' || target === 'columns' || /^\d+$/.test(target)
    if (man && !(await page.evaluate(() => window.experience.world.manoeuvresMenu.mesh.visible))) await click3D(page, 'manoeuvres')
    if (target === 'search' && !(await page.evaluate(() => window.experience.world.conjunctionsMenu.mesh.visible))) await click3D(page, 'events')
    if (['projections', 'sigma'].includes(target)) await click3D(page, 'display')
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const point = await page.evaluate(target => {
        const e = window.experience, w = e.world, T = window.AFRAME.THREE
        const visibleCatalog = w.conjunctionsMenu.mesh.visible ? w.conjunctionsMenu : w.manoeuvresMenu
        const object = target === 'room' ? w.controls.roomViewButton
            : target === 'next' ? w.manoeuvresMenu.grid.pages.buttonNext
            : target === 'info' ? w.conjunctionsMenu.header.info
            : target.startsWith('key:') ? w.conjunctionsMenu.header.searchPopup.keys.get(target.slice(4))
            : target === 'search' ? w.conjunctionsMenu.header.search
            : target === 'columns' ? w.manoeuvresMenu.header.columns
            : target === 'events' ? visibleCatalog.catalogButtons.conjunctions
            : target === 'manoeuvres' ? visibleCatalog.catalogButtons.manoeuvres
            : ['analyse', 'display', 'details', 'help'].includes(target) ? w.controls.tabButtons[target]
            : ['play', 'link', 'speed', 'direction', 'loop'].includes(target) ? w.controls.timeline[target]
            : target === 'focusMode' ? w.controls.focusMode
            : target === 'catalog' ? w.controls.catalog
            : target.startsWith('sort:') ? w.manoeuvresMenu.sortButtons[target.slice(5)]
            : ['projections', 'sigma', 'compare'].includes(target) ? w.controls[target]
            : w.manoeuvresMenu.grid.cards[Number(target)].card
        e.scene.updateMatrixWorld(true)
        const center = new T.Box3().setFromObject(object).getCenter(new T.Vector3()).project(e.aframeScene.camera)
        const rect = e.aframeScene.canvas.getBoundingClientRect()
        return { x: rect.left + (center.x + 1) / 2 * rect.width, y: rect.top + (1 - center.y) / 2 * rect.height }
    }, target)
    await page.mouse.click(point.x, point.y)
}

test('the original 3D panel design is the interface, with no HTML dashboard', async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await ready(page)
    expect(await page.locator('aside, #controls, #toggle-controls').count()).toBe(0)
    const design = await page.evaluate(() => {
        const w = window.experience.world
        return { conjunctions: w.conjunctionsMenu.mesh.visible, manoeuvres: w.manoeuvresMenu.mesh.visible,
            radius: w.conjunctionsMenu.mesh.getBorderRadius(), fontSize: w.conjunctionsMenu.mesh.getFontSize(),
            cardHeight: w.conjunctionsMenu.grid.cards[0].card.getHeight(), icon: !!w.conjunctionsMenu.header.textures.infoIcon }
    })
    expect(design).toEqual({ conjunctions: true, manoeuvres: false, radius: 0.11, fontSize: 0.07, cardHeight: 0.25, icon: true })
    await page.waitForTimeout(150)
    await click3D(page, 'room')
    expect(await page.evaluate(() => window.experience.world.view)).toBe('room')
    await page.screenshot({ path: 'test-results/original-panels.png' })
    expect(errors).toEqual([])
})

test('original arrow buttons paginate to the final manoeuvre and selection updates both views', async ({ page }) => {
    await ready(page)
    await page.waitForTimeout(150)
    await click3D(page, 'next')
    expect(await page.evaluate(() => window.experience.world.manoeuvresMenu.grid.startIndex)).toBe(7)
    await page.evaluate(() => {
        const grid = window.experience.world.manoeuvresMenu.grid
        for (let i = 0; i < 20; i++) grid.pages.buttonNext.onActivate()
    })
    expect(await page.evaluate(() => window.experience.world.manoeuvresMenu.grid.cards.map(card => card.id))).toEqual([98, 99])
    await page.waitForTimeout(100)
    await click3D(page, '1')
    const selected = await page.evaluate(() => {
        const w = window.experience.world
        return { index: w.currentManoeuvreIndex, globe: w.globe.targetPosManoeuvre.view.position.toArray(),
            room: w.room.targetPosManoeuvre.view.position.toArray(), expected: w.room.transform.map(w.manoeuvre.collision_avoidance.state_vector_tca).toArray() }
    })
    expect(selected.index).toBe(99)
    expect(selected.room).toEqual(selected.expected)
    expect(selected.globe[0]).toBeCloseTo(dataset.conjunctions[0].manoeuvres[99].collision_avoidance.state_vector_tca.x / 6371000, 10)
})

test('models may finish before the dataset and each model URL is fetched once', async ({ page }) => {
    const models = []
    page.on('request', request => { if (request.url().endsWith('.glb')) models.push(request.url()) })
    await page.route('**/conjunctions.json', async route => {
        await new Promise(resolve => setTimeout(resolve, 800))
        await route.fulfill({ json: dataset })
    })
    await ready(page)
    expect(models).toHaveLength(2)
})

test('loading errors are visible and retry recovers', async ({ page }) => {
    let fail = true
    await page.route('**/conjunctions.json', route => fail ? route.fulfill({ status: 404, body: 'Not found' }) : route.fulfill({ json: dataset }))
    await page.goto('/')
    await expect(page.locator('#loading-error')).toContainText('HTTP 404')
    fail = false
    await page.click('#retry')
    await page.waitForFunction(() => window.experience?.initialized)
})

test('a missing model reaches an error state', async ({ page }) => {
    await page.route('**/models/satellites/target.glb', route => route.fulfill({ status: 404, body: 'Not found' }))
    await page.goto('/')
    await expect(page.locator('#loading-error')).toContainText('Unable to load')
    await expect(page.locator('#retry')).toBeVisible()
})

test('empty data is rejected and no-manoeuvre conjunctions remain usable', async ({ page }) => {
    await page.route('**/conjunctions.json', route => route.fulfill({ json: { conjunctions: [] } }))
    await page.goto('/')
    await expect(page.locator('#loading-error')).toContainText('at least one conjunction')
    await page.unroute('**/conjunctions.json')
    const sample = structuredClone(dataset)
    sample.conjunctions[0].manoeuvres = []
    await page.route('**/conjunctions.json', route => route.fulfill({ json: sample }))
    await ready(page)
    expect(await page.evaluate(() => window.experience.world.globe.targetPosManoeuvre.view.visible)).toBe(false)
    expect(await page.evaluate(() => window.experience.world.manoeuvresMenu.grid.status)).toBe('0 records')
})

test('original panels and information popups are cleaned up across repeated selection', async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await ready(page)
    const cycle = () => page.evaluate(async () => {
        const e = window.experience
        for (let i = 0; i < 12; i++) {
            e.world.selectConjunction(i % 4)
            e.world.manoeuvresMenu.grid.nextCards()
            e.world.manoeuvresMenu.grid.previousCards()
            e.world.manoeuvresMenu.header.info.onActivate()
            await new Promise(resolve => requestAnimationFrame(resolve))
        }
        e.world.selectConjunction(0)
        await new Promise(resolve => requestAnimationFrame(resolve))
        return { interactive: e.raycaster.objsToTest.length, geometries: e.renderer.renderer.info.memory.geometries }
    })
    const first = await cycle(), second = await cycle()
    expect(second.interactive).toBe(first.interactive)
    expect(second.geometries).toBeLessThanOrEqual(first.geometries + 2)
    expect(errors).toEqual([])
})

test('both controller trigger paths select the original manoeuvre cards', async ({ page }) => {
    await ready(page)
    await click3D(page, 'manoeuvres')
    await page.waitForTimeout(150)
    for (const [handId, cardIndex] of [['leftController', 1], ['rightController', 2]]) {
        const selected = await page.evaluate(({ handId, cardIndex }) => {
            const e = window.experience, THREE = window.AFRAME.THREE
            const card = e.world.manoeuvresMenu.grid.cards[cardIndex].card
            e.scene.updateMatrixWorld(true)
            const target = new THREE.Box3().setFromObject(card).getCenter(new THREE.Vector3())
            const hand = document.getElementById(handId)
            hand.object3D.position.copy(target).add(new THREE.Vector3(0, 0, 0.4))
            hand.object3D.quaternion.identity()
            hand.emit('triggerdown')
            return e.world.currentManoeuvreIndex
        }, { handId, cardIndex })
        expect(selected).toBe(cardIndex)
        await page.evaluate(() => window.experience.world.manoeuvresMenu.grid.cards.forEach(card => card.popup.hide()))
    }
})


test('room surfaces, projected uncertainty and scale remain consistent across candidates', async ({ page }) => {
    await ready(page)
    const before = await page.evaluate(() => {
        const w = window.experience.world
        w.setView('room')
        return { scale: w.room.metersPerUnit, target: w.room.target.view.position.toArray(),
            radii: w.room.projections.children[0].children[0].children[0].scale.toArray(),
            walls: w.room.walls.children.filter(x => x.isMesh).map(x => x.material.transparent) }
    })
    expect(before.walls).toEqual([false, false, false, false])
    await page.evaluate(() => {
        const w = window.experience.world
        w.selectManoeuvre(99)
        w.showCovariance = false
        w.refresh()
    })
    const after = await page.evaluate(() => {
        const w = window.experience.world
        return { scale: w.room.metersPerUnit, target: w.room.target.view.position.toArray(), projections: w.room.projections.visible,
            covariance: w.room.target.covariance.ellipsoid.visible, postCovariance: w.room.targetPosManoeuvre.covariance.ellipsoid.visible }
    })
    expect(after).toEqual({ scale: before.scale, target: before.target, projections: true, covariance: false, postCovariance: false })
    await click3D(page, 'sigma') // 3 -> 1, without changing scene scale.
    const small = await page.evaluate(() => window.experience.world.room.projections.children[0].children[0].children[0].scale.toArray())
    expect(small[0] * 3).toBeCloseTo(before.radii[0], 9)
    expect(small[1] * 3).toBeCloseTo(before.radii[1], 9)
    await click3D(page, 'projections')
    expect(await page.evaluate(() => window.experience.world.room.projections.visible)).toBe(false)
})

test('search works with typing and the VR keyboard without moving the camera', async ({ page }) => {
    await ready(page)
    await click3D(page, 'search')
    await page.keyboard.type('swarm', { delay: 35 })
    expect(await page.evaluate(() => window.experience.world.conjunctionsMenu.grid.cards.map(card => card.id))).toEqual([0, 1])
    expect(await page.evaluate(() => window.experience.camera.object3D.position.toArray())).toEqual([0, 1.6, 0])
    await page.keyboard.press('Enter')
    await click3D(page, 'search')
    await page.keyboard.press('Backspace')
    expect(await page.evaluate(() => window.experience.world.conjunctionsMenu.header.searchPopup.query)).toBe('SWAR')
    await page.keyboard.type('zz')
    expect(await page.evaluate(() => window.experience.world.conjunctionsMenu.grid.status)).toBe('0 records')
    await page.evaluate(() => window.experience.world.conjunctionsMenu.header.searchPopup.setQuery(''))
    await click3D(page, 'key:L') // All four records contain L in a target/chaser name.
    expect(await page.evaluate(() => window.experience.world.conjunctionsMenu.grid.cards.map(card => card.id))).toEqual([0, 1, 2, 3])
    await expect.poll(() => page.evaluate(() => new Set(window.experience.world.conjunctionsMenu.grid.cards.map(card => card.card.position.y)).size)).toBe(4)
    await page.evaluate(() => window.experience.world.conjunctionsMenu.header.searchPopup.setQuery(''))
    await click3D(page, 'key:Z')
    expect(await page.evaluate(() => window.experience.world.conjunctionsMenu.grid.cards.map(card => card.id))).toEqual([3])
    await page.keyboard.press('Escape')
    expect(await page.evaluate(() => window.experience.world.conjunctionsMenu.header.searchPopup.panel.isOpen)).toBe(false)
})

test('independent A/B simulations retain separate selections and clocks', async ({ page }) => {
    await ready(page)
    await page.evaluate(() => window.experience.world.setView('room'))
    await click3D(page, 'compare')
    const initial = await page.evaluate(() => {
        const w = window.experience.world
        return { a: w.currentManoeuvreIndex, b: w.comparisonIndex, visible: w.slotB.visible, sameGeometry: w.globe.earth === w.globeB.earth }
    })
    expect(initial).toEqual({ a: 0, b: 1, visible: true, sameGeometry: false })
    await page.evaluate(() => window.experience.world.selectManoeuvre(99))
    expect(await page.evaluate(() => [window.experience.world.currentManoeuvreIndex, window.experience.world.comparisonIndex])).toEqual([0, 99])
    const clocks = await page.evaluate(() => {
        const w = window.experience.world
        w.stepSlot('B', 0.2)
        return { a: w.slots.A.time, b: w.slots.B.time, scaleA: w.room.metersPerUnit, scaleB: w.roomB.metersPerUnit,
            globeA: w.globe.targetPosManoeuvre.view.position.toArray(), globeB: w.globeB.targetPosManoeuvre.view.position.toArray() }
    })
    expect(clocks.a).toBe(0)
    expect(clocks.b).toBe(0.2)
    expect(clocks.scaleA).toBe(clocks.scaleB)
    expect(clocks.globeA).not.toEqual(clocks.globeB)
    await page.evaluate(() => window.experience.world.setActiveSlot('A'))
    await click3D(page, 'columns')
    expect(await page.evaluate(() => window.experience.world.manoeuvresMenu.grid.cards.map(card => card.id))).toEqual(Array.from({ length: 14 }, (_, i) => i))
    await click3D(page, 'next')
    expect(await page.evaluate(() => window.experience.world.manoeuvresMenu.grid.startIndex)).toBe(14)
    await page.evaluate(() => window.experience.world.selectConjunction(1))
    expect(await page.evaluate(() => window.experience.world.slotB.visible)).toBe(false)
    await click3D(page, 'help')
    expect(await page.evaluate(() => window.experience.world.controls.tab === 'help')).toBe(true)
})

test('restored camera look and independent scene rotation have separate input paths', async ({ page }) => {
    await ready(page)
    await page.mouse.move(720, 250)
    await page.mouse.down()
    await page.mouse.move(760, 270, { steps: 5 })
    await page.mouse.up()
    await expect.poll(() => page.evaluate(() => Math.abs(window.experience.camera.object3D.rotation.y))).toBeGreaterThan(0.01)
    await page.keyboard.press('r')
    await expect.poll(() => page.evaluate(() => Math.abs(window.experience.camera.object3D.rotation.y))).toBeLessThan(0.001)
    await click3D(page, 'compare')
    const center = await page.evaluate(() => {
        const e = window.experience, v = new window.AFRAME.THREE.Vector3()
        e.world.globe.earth.getWorldPosition(v).project(e.aframeScene.camera)
        return { x: (v.x + 1) * 720, y: (1 - v.y) * 500 }
    })
    await page.mouse.move(center.x, center.y)
    await page.mouse.down({ button: 'right' })
    await page.mouse.move(center.x + 30, center.y + 10, { steps: 4 })
    await page.mouse.up({ button: 'right' })
    const rotations = await page.evaluate(() => ({ a: window.experience.world.slotA.rotation.y, b: window.experience.world.slotB.rotation.y,
        camera: window.experience.camera.object3D.rotation.y }))
    expect(Math.abs(rotations.a)).toBeGreaterThan(0.01)
    expect(rotations.b).toBe(0)
    expect(Math.abs(rotations.camera)).toBeLessThan(0.001)
})

test('panels fit the viewport and globes remain spherical at multiple aspect ratios', async ({ page }) => {
    await ready(page)
    await page.evaluate(() => { const w = window.experience.world; w.toggleComparison(); w.manoeuvresMenu.header.columns.onActivate() })
    for (const size of [{ width: 1440, height: 1000 }, { width: 1280, height: 720 }, { width: 800, height: 1000 }]) {
        await page.setViewportSize(size)
        await page.evaluate(() => { window.experience.world.layout(); window.experience.world.setView('room') })
        await page.waitForTimeout(120)
        const bounds = await page.evaluate(() => {
            const e = window.experience, T = window.AFRAME.THREE
            e.scene.updateMatrixWorld(true)
            return [e.world.manoeuvresMenu.mesh.visible ? e.world.manoeuvresMenu.mesh : e.world.conjunctionsMenu.mesh, e.world.controls.panel.mesh].map(root => {
                // Project actual mesh vertices. Corners of a world AABB can
                // fall offscreen even when the tilted panel itself is fully visible.
                const points = [], materials = []
                root.traverse(node => {
                    if (!node.isMesh) return
                    materials.push(...[].concat(node.material))
                    const attribute = node.geometry?.attributes.position
                    if (!attribute) return
                    for (let i = 0; i < attribute.count; i++) points.push(new T.Vector3().fromBufferAttribute(attribute, i).applyMatrix4(node.matrixWorld).project(e.aframeScene.camera))
                })
                return { inside: points.every(p => Math.abs(p.x) < 1 && Math.abs(p.y) < 1), depth: materials.every(m => !m.depthTest) }
            })
        })
        expect(bounds).toEqual(Array.from({ length: 2 }, () => ({ inside: true, depth: true })))
        const shapes = await page.evaluate(() => {
            const e = window.experience, T = window.AFRAME.THREE
            e.world.setView('globe')
            e.scene.updateMatrixWorld(true)
            return [e.world.globe.earth, e.world.globeB.earth].map(mesh => {
                const vertices = mesh.geometry.attributes.position
                const screen = new T.Box2()
                for (let i = 0; i < vertices.count; i++) {
                    const p = new T.Vector3().fromBufferAttribute(vertices, i).applyMatrix4(mesh.matrixWorld).project(e.aframeScene.camera)
                    screen.expandByPoint(new T.Vector2(p.x * window.innerWidth, p.y * window.innerHeight))
                }
                const size = screen.getSize(new T.Vector2())
                const scale = mesh.getWorldScale(new T.Vector3())
                return { ratio: size.x / size.y, uniform: Math.max(scale.x, scale.y, scale.z) - Math.min(scale.x, scale.y, scale.z) }
            })
        })
        for (const shape of shapes) {
            expect(shape.ratio).toBeGreaterThan(0.96)
            expect(shape.ratio).toBeLessThan(1.04)
            expect(shape.uniform).toBeLessThan(1e-8)
        }
    }
})


test('two permanent panels combine catalogue, comparison and progressive details', async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await ready(page)
    const panels = () => page.evaluate(() => window.experience.scene.children.filter(x => x.isUI && x.visible && x.scale.x > 0.001).length)
    expect(await panels()).toBe(2)
    await click3D(page, 'manoeuvres')
    await click3D(page, '1')
    expect(await page.evaluate(() => window.experience.world.manoeuvresMenu.grid.cards.some(x => x.popup.isOpen))).toBe(false)
    await click3D(page, 'compare')
    expect(await panels()).toBe(2)
    expect(await page.evaluate(() => window.experience.world.summaryB.panel.mesh.parent === window.experience.world.controls.summaryRow)).toBe(true)
    await click3D(page, 'details')
    expect(await panels()).toBe(2)
    await click3D(page, 'analyse')
    await click3D(page, 'focusMode')
    expect(await page.evaluate(() => window.experience.world.controls.compact)).toBe(true)
    await click3D(page, 'analyse')
    expect(await page.evaluate(() => window.experience.world.controls.pageHost.parent === window.experience.world.controls.panel.mesh)).toBe(true)
    await click3D(page, 'catalog')
    expect(await panels()).toBe(1)
    await click3D(page, 'catalog')
    expect(await panels()).toBe(2)
    expect(errors).toEqual([])
})

test('dragging the timeline synchronises A/B without moving the camera and playback stops cleanly', async ({ page }) => {
    await ready(page)
    await click3D(page, 'compare')
    await click3D(page, 'room')
    await click3D(page, 'link')
    const points = await page.evaluate(() => {
        const e = window.experience, T = window.AFRAME.THREE, bar = e.world.controls.timeline.bar
        e.scene.updateMatrixWorld(true)
        return [-1.5, 1.8].map(x => {
            const p = bar.localToWorld(new T.Vector3(x, 0, 0.03)).project(e.aframeScene.camera)
            return { x: (p.x + 1) * 720, y: (1 - p.y) * 500 }
        })
    })
    await page.mouse.move(points[0].x, points[0].y)
    await page.mouse.down()
    await page.mouse.move(points[1].x, points[1].y, { steps: 10 })
    await page.mouse.up()
    const scrub = await page.evaluate(() => ({ a: window.experience.world.slots.A.time, b: window.experience.world.slots.B.time, yaw: window.experience.camera.object3D.rotation.y }))
    expect(scrub.a).toBeGreaterThan(0.3)
    expect(scrub.a).toBeLessThan(0.45)
    expect(scrub.a).toBe(scrub.b)
    expect(Math.abs(scrub.yaw)).toBeLessThan(0.001)
    await page.evaluate(() => { const w = window.experience.world; w.seek('B', 0.49); w.playbackRate = 4; w.togglePlayback() })
    await expect.poll(() => page.evaluate(() => window.experience.world.slots.B.playing)).toBe(false)
    expect(await page.evaluate(() => window.experience.world.controls.timeline.play.text.content)).toBe('Play')
    expect(await page.evaluate(() => window.experience.world.slots.A.time)).toBe(0.5)
    await click3D(page, 'direction')
    await page.evaluate(() => { const w = window.experience.world; w.seek('B', -0.49); w.togglePlayback() })
    await expect.poll(() => page.evaluate(() => window.experience.world.slots.B.playing)).toBe(false)
    expect(await page.evaluate(() => window.experience.world.slots.A.time)).toBe(-0.5)
})

test('VR command events and held-trigger timeline scrubbing manipulate the analysis', async ({ page }) => {
    await ready(page)
    await page.keyboard.press('Space')
    expect(await page.evaluate(() => window.experience.world.slots.A.playing)).toBe(true)
    await page.evaluate(() => window.experience.rightHand.emit('abuttondown'))
    expect(await page.evaluate(() => window.experience.world.slots.A.playing)).toBe(false)
    await page.evaluate(() => window.experience.rightHand.emit('bbuttondown'))
    expect(await page.evaluate(() => window.experience.world.view)).toBe('room')
    await page.evaluate(() => window.experience.leftHand.emit('xbuttondown'))
    expect(await page.evaluate(() => window.experience.world.catalogOpen)).toBe(false)
    await page.evaluate(() => {
        const e = window.experience, T = window.AFRAME.THREE
        const bar = e.world.controls.timeline.bar
        e.scene.updateMatrixWorld(true)
        const target = bar.localToWorld(new T.Vector3(-1, 0, 0.03))
        e.rightHand.object3D.position.copy(target).add(new T.Vector3(0, 0, 0.4))
        e.rightHand.object3D.quaternion.identity()
        e.aframeScene.addState('vr-mode')
        e.rightHand.emit('triggerdown')
    })
    expect(await page.evaluate(() => window.experience.raycaster.controllerScrubs.size)).toBe(1)
    await page.evaluate(() => {
        const e = window.experience, T = window.AFRAME.THREE
        const target = e.world.controls.timeline.bar.localToWorld(new T.Vector3(1, 0, 0.03))
        e.rightHand.object3D.position.copy(target).add(new T.Vector3(0, 0, 0.4))
    })
    await expect.poll(() => page.evaluate(() => window.experience.world.slots.A.time)).toBeGreaterThan(0.1)
    await page.evaluate(() => { const e = window.experience; e.rightHand.emit('triggerup'); e.aframeScene.removeState('vr-mode') })
    expect(await page.evaluate(() => window.experience.raycaster.controllerScrubs.size)).toBe(0)
})

test('catalogue sorting preserves IDs and changing display options preserves workspace placement', async ({ page }) => {
    await ready(page)
    await click3D(page, 'manoeuvres')
    await click3D(page, 'sort:poc')
    const sorted = await page.evaluate(() => window.experience.world.manoeuvresMenu.grid.cards.map(x => ({ id: x.id, value: x.cardInfo.collision_avoidance.poc })))
    expect(sorted.map(x => x.value)).toEqual(sorted.map(x => x.value).sort((a, b) => a - b))
    const original = await page.evaluate(() => window.experience.world.root.position.toArray())
    await page.evaluate(() => { const e = window.experience; e.camera.components['look-controls'].yawObject.rotation.y = 0.4 })
    await page.waitForTimeout(100)
    await page.evaluate(() => window.experience.world.manoeuvresMenu.header.columns.onActivate())
    expect(await page.evaluate(() => window.experience.world.root.position.toArray())).toEqual(original)
    await page.evaluate(() => {
        const e = window.experience
        e.aframeScene.addState('vr-mode')
        e.leftHand.emit('ybuttondown')
        e.aframeScene.removeState('vr-mode')
    })
    expect(await page.evaluate(() => window.experience.world.root.position.toArray())).not.toEqual(original)
})
