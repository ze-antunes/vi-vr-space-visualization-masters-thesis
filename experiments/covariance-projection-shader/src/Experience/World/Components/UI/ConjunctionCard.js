import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"
import Panel from './Panel'

export default class ConjunctionCard {
    constructor(grid, cardInfo, id) {
        this.experience = new Experience()
        this.world = this.experience.world
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources

        // Setup 
        this.grid = grid
        this.cardInfo = cardInfo
        this.id = id
        this.objsToTest = this.experience.raycaster.objsToTest
        this.clicks = 0
        // this.geometries = []

        this.setTextures()
        this.setCard()
        this.setInfo()
    }

    setTextures() {
        this.textures = {}

        this.textures.conjunctinoStatus = this.resources.items.conjunctionStatusIcon
    }

    setCard() {
        this.card = new ThreeMeshUI.Block({
            width: 1.2,
            height: 0.25,
            justifyContent: 'space-between',
            contentDirection: 'row',
            margin: 0.025,
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
                this.experience.world.conjunctionsMenu.grid.setActiveCard(this)
                this.world.globe.updateVisualization(this.id)
                this.world.room.updateVisualization(this.id)
            }
        });
        this.card.setupState(hoveredStateAttributes);
        this.card.setupState(idleStateAttributes);

        this.grid.add(this.card)
        this.objsToTest.push(this.card)
    }

    setInfo() {
        let CardNameNStatus = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            margin: 0.025,
            backgroundColor: new THREE.Color("#505050"),
            backgroundOpacity: 0,
            borderWidth: 0
        });

        let CardNameId = new ThreeMeshUI.Block({
            width: 0.3,
            height: 0.25,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        CardNameId.add(
            new ThreeMeshUI.Text({ content: this.cardInfo.target.name }),
            // new ThreeMeshUI.Text({ content: this.id.toString() }),
            new ThreeMeshUI.Text({
                content: "\nDummy data",
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

        CardStatus.set({
            backgroundTexture: this.textures.conjunctinoStatus,
        });

        CardNameNStatus.add(CardStatus, CardNameId)

        let CardTCA = new ThreeMeshUI.Block({
            width: 0.45,
            height: 0.25,
            margin: 0.025,
            justifyContent: 'center',
            textAlign: 'right',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        CardTCA.add(
            new ThreeMeshUI.Text({ content: this.setValueTCA(this.cardInfo.summary.tca_latest) }),
            new ThreeMeshUI.Text({
                content: "\nDummy data",
                fontColor: new THREE.Color("#DEDEDE"),
                fontSize: 0.045
            }),
        );

        this.card.add(CardNameNStatus, CardTCA)
        // for (let i = 0; i < this.card.children.length; i++) {
        //     if (this.card.children[i].geometry) {
        //         this.geometries.push(this.card.children[i].geometry)
        //     } else {
        //         console.log("----------------")
        //     }
        // }

        // this.mergedGeometry = BufferGeometryUtils.mergeGeometries(this.geometries)
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
            if (this.manoeuvresMenu != null) {
                if (this.clicks % 2 == 0)
                    this.manoeuvresMenu.show()
                else
                    this.manoeuvresMenu.hide()
            } else {
                this.setManoeuvresMenu()
            }
            this.clicks++;
        } else {
            this.card.setState('idle');
            if (this.manoeuvresMenu) {
                this.manoeuvresMenu.destroy()
                this.manoeuvresMenu = null
            }
        }
    }

    setManoeuvresMenu() {
        this.manoeuvresMenu = new Panel("Manoeuvres", "manoeuvreCard", this.cardInfo.manoeuvres.length)
        this.manoeuvresMenu.mesh.position.set(1.4, 1.6, -1.2);
        this.manoeuvresMenu.mesh.rotation.y = -0.25;
        this.manoeuvresMenu.mesh.scale.set(0.5, 0.5, 0.5)
        this.manoeuvresMenu.setHeader()
        this.manoeuvresMenu.setGrid(this.cardInfo.manoeuvres, 7)
    }

    destroy() {
        // Properly dispose of ThreeMeshUI objects and their geometries/materials
        this.card.traverse(child => {
            if (child.isMesh) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });

        // Remove the card from the grid and raycaster's test objects
        this.grid.remove(this.card);
        this.card = null

        let index = this.objsToTest.indexOf(this.card);
        if (index > -1) {
            this.objsToTest.splice(index, 1);
        }
    }
}