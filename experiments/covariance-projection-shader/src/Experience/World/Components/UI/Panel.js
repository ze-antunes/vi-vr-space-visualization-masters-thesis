import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"
import FontJSON from '../../../../fonts/Roboto-msdf.json'
import FontImage from '../../../../fonts/Roboto-msdf.png'
import Header from './Header'
import Grid from './Grid'
import Views from './Views'
import Pages from './Pages'

export default class Panel {
    constructor(title, cardType, maxCardsLength) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Setup 
        this.title = title
        this.cardType = cardType
        this.maxCardsLength = maxCardsLength

        this.setMesh()
    }

    setMesh() {
        this.mesh = new ThreeMeshUI.Block({
            backgroundColor: new THREE.Color("#121212"),
            justifyContent: 'center',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11,
            backgroundOpacity: 1,
        });

        this.scene.add(this.mesh);
    }

    setHeader() {
        this.header = new Header(this.mesh, this.title, this.cardType)
    }

    setGrid(data, numbCards) {
        this.grid = new Grid(this.mesh, data, this.cardType, this.maxCardsLength, numbCards, this)
    }

    setViews() {
        this.views = new Views(this.mesh)
    }

    hide() {
        this.mesh.scale.set(0, 0, 0)
        this.isOpen = false
    }

    show() {
        this.mesh.scale.set(0.5, 0.5, 0.5)
        this.isOpen = true
    }

    // New destroy method
    destroy() {
        // console.log("Panel destroy")
        // Remove the mesh from the scene
        this.scene.remove(this.mesh);

        // Dispose of ThreeMeshUI blocks, geometries, and materials
        this.disposeMeshUI(this.mesh);

        if (this.grid)
            this.grid.destroy()
        if (this.header)
            this.header.destroy()

        // Set references to null
        this.mesh = null;
        this.header = null;
        this.grid = null;
        this.views = null;
    }

    disposeMeshUI(block) {
        if (block) {
            // Recursively dispose children
            if (block.children) {
                for (let i = 0; i < block.children.length; i++) {
                    this.disposeMeshUI(block.children[i]);
                }
            }

            // Dispose of the block itself
            if (block.geometry) {
                block.geometry.dispose();
            }
            if (block.material) {
                // If material is an array, dispose each material
                if (Array.isArray(block.material)) {
                    block.material.forEach((material) => material.dispose());
                } else {
                    block.material.dispose();
                }
            }
            if (block.texture) {
                block.texture.dispose();
            }
        }
    }
}