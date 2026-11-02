import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"
import ConjunctionCard from './ConjunctionCard'
import ManoeuvreCard from './ManoeuvreCard'
import Pages from "./Pages"
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default class Grid { 
    constructor(parentMesh, data, cardType, maxCardsLength, numbCards, parentPanel) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        
        // Setup 
        this.parentMesh = parentMesh
        this.data = data
        this.cardType = cardType
        this.cardsCreated = 0
        this.maxCardsLength = maxCardsLength
        this.numbCards = numbCards
        this.parentPanel = parentPanel
        this.startIndex = 0
        this.cards = []

        this.setMesh()
        this.setPages()
    }

    setMesh() {
        this.grid = new ThreeMeshUI.Block({
            width: 1.2,
            justifyContent: 'center',
            contentDirection: 'column',
            margin: 0.02,
            backgroundOpacity: 0
        });

        this.parentMesh.add(this.grid)
        this.setCards(this.startIndex)
        // console.log(this.grid.children.length)
        // console.log(this.grid.children)
    }

    setCards(startIndex) {
        let id = 0;
        for (let i = startIndex; i < Math.min(startIndex + this.numbCards, this.maxCardsLength); i++) {
            if (this.cardType === 'manoeuvreCard') {
                this.createCard(this.data[i], id);
            } else {
                this.createCard(this.data[i], id);
            }
            id++;
        }
        this.updateStatus(startIndex)
    }

    setPages() {
        this.pages = new Pages(this.parentMesh, this.maxCardsLength, this.status, this)
    }

    createCard(cardInfo, id) {
        if (this.cardType === 'conjunctionCard') {
            this.card = new ConjunctionCard(this.grid, cardInfo, id, this.parentPanel)
        } else if (this.cardType === 'manoeuvreCard') {
            // console.log(this.panel)
            this.card = new ManoeuvreCard(this.grid, cardInfo, id, this.parentPanel)
        }
        this.cards.push(this.card)
        this.cardsCreated++

        // // this.mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)
        // if (this.cardsCreated === this.maxCardsLength) {
        //     console.log("All cards created")
        // }
    }

    updateStatus(startIndex) {
        let endIndex = Math.min(startIndex + this.numbCards, this.maxCardsLength);
        this.status = `${startIndex + 1} - ${endIndex} of ${this.maxCardsLength}`;
    }

    previousCards() {
        this.startIndex = Math.max(this.startIndex - this.numbCards, 0);
        this.setCards(this.startIndex);
        // nextButton.disabled = false;
        if (this.startIndex === 0) {
            // prevButton.disabled = true;
            // console.log("prevButton.disabled = true")
        }
    }

    setActiveCard(selectedCard) {
        this.cards.forEach(card => {
            card.setActive(card === selectedCard);
        });
    }

    nextCards() {
        this.startIndex += this.numbCards;
        this.setCards(this.startIndex)
        // prevButton.disabled = false;
        if (this.startIndex + this.numbCards >= this.maxCardsLength) {
            // nextButton.disabled = true;
            // console.log("nextButton.disabled = true")
        }
    }

    destroy() {
        // console.log("Grid destroy")

        // Dispose of all cards
        this.cards.forEach(card => {
            if (card.destroy) {
                card.destroy();
            }
        });
        

        if (this.pages)
            this.pages.destroy()

        // Dispose of ThreeMeshUI blocks, geometries, and materials
        this.disposeMeshUI(this.grid);

        // Remove the grid from the panel
        if (this.parentMesh.children) {
            let index = this.parentMesh.children.indexOf(this.grid);
            if (index !== -1) {
                this.parentMesh.children.splice(index, 1);
            }
        }

        // Dispose pages
        if (this.pages && this.pages.destroy) {
            this.pages.destroy();
        }

        // Clear references
        this.cards = [];
        this.grid = null;
        this.parentMesh = null;
        this.pages = null;
    }

    disposeMeshUI(block) {
        if (block) {
            // Recursively dispose children
            if (block.children) {
                block.children.forEach(child => {
                    this.disposeMeshUI(child);
                });
            }

            // Dispose of the block itself
            if (block.geometry) {
                block.geometry.dispose();
            }
            if (block.material) {
                // If material is an array, dispose each material
                if (Array.isArray(block.material)) {
                    block.material.forEach(material => material.dispose());
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