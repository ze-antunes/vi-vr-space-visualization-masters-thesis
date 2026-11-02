import * as THREE from 'three'
import EventEmitter from "./EventEmitter";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class Resources extends EventEmitter {
    constructor(sources) {
        super()

        // Options
        this.sources = sources

        //Setup
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.fetchData()
        
        this.setLoaders()
        this.startLoading()
    }
    
    setLoaders() {
        this.loaders = {}
        this.loadingManager = new THREE.LoadingManager()
        let progressBar = document.getElementById('progress-bar')
        let label = document.getElementById('progress-bar-label')

        this.loadingManager.onProgress = (url, loaded, total) => {
            // console.log(`start loading: ${url}`)
            label.innerHTML = (((loaded / total) * 100).toFixed(0)).toString() + " %"
            progressBar.value = (loaded / total) * 100
        }

        this.loaders.gltfLoader = new GLTFLoader(this.loadingManager)
        this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager)
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager)
    }
    
    startLoading() {
        for (let source of this.sources) {
            if (source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            } else if (source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file

        this.loaded++

        if (this.loaded === this.toLoad) {
            this.trigger('ready')
        }
    }

    fetchData() {
        fetch("https://raw.githubusercontent.com/ze-antunes/ARVI_Assets/main/exp_conjunctions.json")
            .then(response => response.json())
            .then(data => {
                this.setData(data)
            })
            .catch(error => {
                // Handle any errors that occurred during the fetch
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    setData(data) {
        this.data = data

        if (this.data) {
            this.trigger('dataReady')
        }
    }
}