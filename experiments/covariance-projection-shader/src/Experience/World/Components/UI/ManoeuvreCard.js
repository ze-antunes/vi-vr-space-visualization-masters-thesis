import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"
import ManoeuvrePopup from './ManoeuvrePopup'
import Panel from './Panel'

export default class ManoeuvreCard {
    constructor(grid, cardInfo, id, panel) {
        this.experience = new Experience()
        this.time = this.experience.time
        this.resources = this.experience.resources

        // Setup 
        this.grid = grid
        this.cardInfo = cardInfo
        this.id = id
        this.panel = panel
        this.objsToTest = this.experience.raycaster.objsToTest

        this.setTextures()
        this.setCard()
        this.setInfo()
        this.setManoeuvrePopup()
    }

    setTextures() {
        this.textures = {}

        this.textures.constantManoeuvre = this.resources.items.constantManoeuvreIcon
        this.textures.impulsiveManoeuvre = this.resources.items.impulsiveManoeuvreIcon
        this.textures.dragManoeuvre = this.resources.items.dragManoeuvreIcon
    }

    setCard() {
        this.card = new ThreeMeshUI.Block({
            width: 1.2,
            height: 0.25,
            justifyContent: 'space-between',
            contentDirection: 'row',
            margin: 0.02,
            backgroundColor: new THREE.Color("#505050"),
            backgroundOpacity: 1,
            padding: 0.02,
            borderRadius: 0.06,
        });

        let hoveredStateAttributes = {
            state: 'hovered',
            attributes: {
                offset: 0.035,
                backgroundColor: new THREE.Color("#949494"),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0xffffff)
            },
        };

        let idleStateAttributes = {
            state: 'idle',
            attributes: {
                offset: 0.035,
                backgroundColor: new THREE.Color("#505050"),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0xffffff),
                borderWidth: 0
            },
        };

        let selectedAttributes = {
            offset: 0.02,
            borderWidth: 0.005,
            borderColor: new THREE.Color("#FFBE0B"),
            backgroundOpacity: 0,
            borderOpacity: 1
        };

        this.card.setupState({
            state: 'selected',
            attributes: selectedAttributes,
            onSet: () => {
                if (this.panel.grid)
                    this.panel.grid.setActiveCard(this)
            }
        });
        this.card.setupState(hoveredStateAttributes);
        this.card.setupState(idleStateAttributes);


        this.grid.add(this.card)
        this.objsToTest.push(this.card)
    }

    setInfo() {
        let CardNameNStatus = new ThreeMeshUI.Block({
            width: 0.6,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            margin: 0.005,
            backgroundColor: new THREE.Color("#505050"),
            backgroundOpacity: 0,
            borderWidth: 0
        });

        let CardNameId = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.25,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        CardNameId.add(
            new ThreeMeshUI.Text({
                content: this.setValueTCA(this.cardInfo.collision_avoidance.tca),
                fontSize: 0.06
            }),
            new ThreeMeshUI.Text({
                content: "\n" + this.cardInfo.sum_duration.toString() + "s",
                fontColor: new THREE.Color("#DEDEDE"),
                fontSize: 0.045
            }),
        );

        let CardStatus = new ThreeMeshUI.Block({
            width: 0.15,
            height: 0.15,
            backgroundColor: new THREE.Color("#DB0000"),
            backgroundOpacity: 1,
            borderWidth: 0
        });

        if (this.cardInfo.type === "thrust") {
            CardStatus.set({
                backgroundColor: new THREE.Color("#FFBE0B"),
                backgroundTexture: this.textures.constantManoeuvre,
            });
        } else if (this.cardInfo.type === "impulsive") {
            CardStatus.set({
                backgroundColor: new THREE.Color("#FB5607"),
                backgroundTexture: this.textures.impulsiveManoeuvre,
            });
        } else if (this.cardInfo.type === "drag") {
            CardStatus.set({
                backgroundColor: new THREE.Color("#8338EC"),
                backgroundTexture: this.textures.dragManoeuvre,
            });
        }

        CardNameNStatus.add(CardStatus, CardNameId)

        let CardTCA = new ThreeMeshUI.Block({
            width: 0.3,
            height: 0.25,
            margin: 0.02,
            justifyContent: 'center',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });


        CardTCA.add(
            new ThreeMeshUI.Text({
                content: this.cardInfo.collision_avoidance.miss_distance.total.toFixed(0) + "m",
                fontSize: 0.06
            }),
            new ThreeMeshUI.Text({
                content: "\n+ '" + this.cardInfo.collision_avoidance.miss_distance.total.toFixed(0) + "m'",
                fontColor: new THREE.Color("#DEDEDE"),
                fontSize: 0.045
            }),
        );

        let CardPOC = new ThreeMeshUI.Block({
            width: 0.25,
            height: 0.25,
            justifyContent: 'center',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });


        CardPOC.add(
            new ThreeMeshUI.Text({
                content: this.cardInfo.collision_avoidance.poc.toExponential(2),
                fontSize: 0.06
            }),
            new ThreeMeshUI.Text({
                content: "\n'-2.63e-6'",
                fontColor: new THREE.Color("#DEDEDE"),
                fontSize: 0.045
            }),
        );

        // console.log(this.cardInfo)
        this.card.add(CardNameNStatus, CardPOC, CardTCA)
    }

    setValueTCA(isoDateString) {
        let date = new Date(isoDateString);

        let options = {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };

        // Extract parts
        let formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
        let time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        // Combine parts into desired format
        let [monthDay, timePart] = formattedDate.split(' ');

        return `${monthDay} ${timePart}, ${time}`;
    }

    setActive(isActive) {
        this.card.active = isActive;
        if (isActive) {
            this.card.setState('selected');
            if (this.popup) {
                if (this.popup.isOpen == false)
                    this.popup.show()
                else 
                    this.popup.hide()
            }
        } else {
            this.card.setState('idle');
            if (this.popup)
                this.popup.hide()
        }
    }

    setManoeuvrePopup() {
        this.popup = new ManoeuvrePopup(this.cardInfo)
    }

    // New destroy method
    destroy() {
        // console.log("ManoeuvreCard destroy")
        // Remove the card from the grid and objsToTest
        let index = this.grid.children.indexOf(this.card);
        if (index !== -1) {
            this.grid.children.splice(index, 1);
        }

        let testIndex = this.objsToTest.indexOf(this.card);
        if (testIndex !== -1) {
            this.objsToTest.splice(testIndex, 1);
        }

        // Dispose of ThreeMeshUI blocks, geometries, and materials
        this.disposeMeshUI(this.card);

        // Destroy the popup
        if (this.popup) {
            this.popup.destroy();
        }

        // Set references to null
        this.card = null;
        this.popup = null;
        this.textures = null;
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







