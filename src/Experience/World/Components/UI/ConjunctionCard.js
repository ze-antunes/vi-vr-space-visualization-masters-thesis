import { disposeUI } from '../../../Utils/Dispose'
import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"

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
            justifyContent: 'center',
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
            attributes: selectedAttributes
        });
        this.card.setupState(hoveredStateAttributes);
        this.card.setupState(idleStateAttributes);

        this.card.onActivate = () => this.world.selectConjunction(this.id)
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
            borderWidth: 0,
            bestFit: "shrink"
        });

        CardNameId.add(
            new ThreeMeshUI.Text({ content: this.cardInfo.target.name }),
            new ThreeMeshUI.Text({
                content: "\n" + this.cardInfo.target.cospar_id,
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

        // console.log(this.cardInfo.summary)

        CardTCA.add(
            new ThreeMeshUI.Text({ content: this.setValueTCA(this.cardInfo.summary.tca_latest) }),
            new ThreeMeshUI.Text({
                content: "\n" + this.cardInfo.summary.miss_distance_latest + "m",
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

    setValueTCA(value) {
        return new Date(value).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).replace(',', '')
    }

    setActive(active) {
        this.card.active = active
        this.card.setState(active ? 'selected' : 'idle')
    }

    destroy() {
        disposeUI(this.card, this.experience.raycaster)
        this.card = null
    }

}