import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { validateDataset } from './SpatialMath.js'

export default class Resources {
    constructor(sources) {
        this.sources = sources
        this.items = {}
        this.cache = new Map()
        this.controller = new AbortController()
        this.manager = new THREE.LoadingManager()
        this.manager.onProgress = (_url, loaded, total) => {
            const percent = Math.round(loaded / total * 100)
            document.getElementById('progress-bar').value = percent
            document.getElementById('progress-bar-label').textContent = `${percent} %`
        }
        this.gltfLoader = new GLTFLoader(this.manager)
        this.textureLoader = new THREE.TextureLoader(this.manager)
        this.ready = this.initialize()
    }

    async initialize() {
        await Promise.all([this.fetchData(), ...this.sources.map(source => this.load(source))])
        return this
    }

    async fetchData() {
        const response = await fetch(`${import.meta.env.BASE_URL}conjunctions.json`, { signal: this.controller.signal })
        if (!response.ok) throw new Error(`Dataset request failed: HTTP ${response.status}`)
        this.data = validateDataset(await response.json())
    }

    async load(source) {
        const key = `${source.type}:${source.path}`
        if (!this.cache.has(key)) {
            const loader = source.type === 'gltfModel' ? this.gltfLoader : this.textureLoader
            this.cache.set(key, loader.loadAsync(`${import.meta.env.BASE_URL}${source.path}`))
        }
        const file = await this.cache.get(key)
        this.items[source.name] = source.type === 'gltfModel' ? { ...file, scene: clone(file.scene) } : file
    }

    destroy() {
        this.controller.abort()
        // Includes late loader completions when the scene is removed during loading.
        for (const promise of this.cache.values()) promise.then(file => {
            if (file.isTexture) { file.dispose(); return }
            const textures = new Set()
            file.scene.traverse(node => {
                node.geometry?.dispose()
                for (const material of [].concat(node.material ?? [])) {
                    Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value) })
                    material.dispose()
                }
            })
            textures.forEach(texture => texture.dispose())
        }).catch(() => {})
        this.cache.clear()
    }
}
