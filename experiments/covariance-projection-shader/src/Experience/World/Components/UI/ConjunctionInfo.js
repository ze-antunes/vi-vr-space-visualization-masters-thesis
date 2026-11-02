import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"
import FontJSON from '../../../../fonts/Roboto-msdf.json'
import FontImage from '../../../../fonts/Roboto-msdf.png'

export default class ConjunctionInfo {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources

        this.setTextures()
        this.setInfo()
        this.hide()
    }

    setTextures() {
        this.textures = {}

        this.textures.conjunctinoStatus = this.resources.items.conjunctionStatusIcon
        this.textures.constantManoeuvre = this.resources.items.constantManoeuvreIcon
        this.textures.impulsiveManoeuvre = this.resources.items.impulsiveManoeuvreIcon
        this.textures.dragManoeuvre = this.resources.items.dragManoeuvreIcon
    }

    setInfo() {
        this.mesh = new ThreeMeshUI.Block({
            backgroundColor: new THREE.Color("#121212"),
            justifyContent: 'center',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.05,
            borderRadius: 0.11,
            backgroundOpacity: 1,
        });

        this.mesh.position.set(0, 1.6, -1)
        this.mesh.scale.set(0.5, 0.5, 0.5)

        // HEADER
        this.header = new ThreeMeshUI.Block({
            width: 1.2,
            height: 0.2,
            justifyContent: 'center',
            textAlign: 'left',
            borderRadius: 0,
            padding: 0.02,
            backgroundOpacity: 0
        });

        this.header.add(
            new ThreeMeshUI.Text({ content: "Information" })
        );

        // MAIN
        this.main = new ThreeMeshUI.Block({
            margin: 0.02,
            justifyContent: 'center',
            textAlign: 'left',
            backgroundOpacity: 0,
            padding: 0.02,
            borderRadius: 0.06,
        });

        // Manoeuvres Status
        this.manoeuvresStatus = new ThreeMeshUI.Block({
            width: 1.2,
            height: 0.1,
            justifyContent: 'center',
            textAlign: 'left',
            borderRadius: 0,
            padding: 0.02,
            backgroundOpacity: 0
        });

        this.manoeuvresStatus.add(
            new ThreeMeshUI.Text({ content: "Conjunction Status", fontSize: 0.06 })
        );

        //Status
        //Alert
        let alert = new ThreeMeshUI.Block({
            height: 0.15,
            justifyContent: 'center',
            contentDirection: 'row',
            backgroundColor: new THREE.Color("#505050"),
            backgroundOpacity: 0
        });

        let alertStatus = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.1,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        alertStatus.add(
            new ThreeMeshUI.Text({
                content: "Alert",
                fontSize: 0.05
            }),
        );

        let alertIcon = new ThreeMeshUI.Block({
            width: 0.1,
            height: 0.1,
            backgroundColor: new THREE.Color("#DB0000"),
            backgroundOpacity: 1,
            borderWidth: 0
        });

        alertIcon.set({
            backgroundTexture: this.textures.conjunctinoStatus,
        });

        alert.add(alertIcon, alertStatus)

        //Minor Concern
        let minorConcern = new ThreeMeshUI.Block({
            height: 0.15,
            justifyContent: 'center',
            contentDirection: 'row',
            backgroundColor: new THREE.Color("#505050"),
            backgroundOpacity: 0
        });

        let minorConcernStatus = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.1,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        minorConcernStatus.add(
            new ThreeMeshUI.Text({
                content: "Minor Concern",
                fontSize: 0.05
            }),
        );

        let minorConcernIcon = new ThreeMeshUI.Block({
            width: 0.1,
            height: 0.1,
            backgroundColor: new THREE.Color("#FFBE0B"),
            backgroundOpacity: 1,
            borderWidth: 0
        });

        minorConcernIcon.set({
            backgroundTexture: this.textures.conjunctinoStatus,
        });

        minorConcern.add(minorConcernIcon, minorConcernStatus)

        //No Threat
        let noThreat = new ThreeMeshUI.Block({
            height: 0.15,
            justifyContent: 'center',
            contentDirection: 'row',
            backgroundColor: new THREE.Color("#505050"),
            backgroundOpacity: 0
        });

        let noThreatStatus = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.1,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        noThreatStatus.add(
            new ThreeMeshUI.Text({
                content: "No Threat",
                fontSize: 0.05
            }),
        );

        let noThreatIcon = new ThreeMeshUI.Block({
            width: 0.1,
            height: 0.1,
            backgroundColor: new THREE.Color("#5AEC00"),
            backgroundOpacity: 1,
            borderWidth: 0
        });

        noThreatIcon.set({
            backgroundTexture: this.textures.conjunctinoStatus,
        });

        noThreat.add(noThreatIcon, noThreatStatus)


        this.main.add(this.manoeuvresStatus, alert, minorConcern, noThreat)

        this.mesh.add(this.header, this.setCard(), this.main)
        this.scene.add(this.mesh)
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

        let CardNameNStatus = new ThreeMeshUI.Block({
            width: 0.6,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            margin: 0.025,
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
            new ThreeMeshUI.Text({ content: "Target Satellite" }),
            new ThreeMeshUI.Text({
                content: "\nCospar Id",
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
            new ThreeMeshUI.Text({ content: "TCA" }),
            new ThreeMeshUI.Text({
                content: "\nTime to TCA",
                fontColor: new THREE.Color("#DEDEDE"),
                fontSize: 0.045
            }),
        );

        this.card.add(CardNameNStatus, CardTCA)
        return this.card
    }

    hide() {
        this.mesh.scale.set(0, 0, 0)
    }

    show() {
        this.mesh.scale.set(0.5, 0.5, 0.5)
    }
}