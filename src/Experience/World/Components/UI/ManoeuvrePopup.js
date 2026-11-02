import { disposeUI } from '../../../Utils/Dispose'
import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"
import FontJSON from '../../../../fonts/Roboto-msdf.json'
import FontImage from '../../../../fonts/Roboto-msdf.png'

export default class ManoeuvrePopup {
    constructor(cardInfo) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources

        // Setup 
        this.cardInfo = cardInfo
        this.isOpen = false
        // console.log(this.cardInfo)

        this.setTextures()
        this.setInfo()
        this.hide()
    }

    setTextures() {
        this.textures = {}

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

        // this.mesh.position.set(0, 1.3, -1)
        // this.mesh.position.set(2.4, 1.6, -1.2);
        this.mesh.rotation.x = -0.35;
        // this.mesh.scale.set(0.5, 0.5, 0.5)

        // HEADER
        this.header = new ThreeMeshUI.Block({
            width: 1.3,
            height: 0.2,
            justifyContent: 'center',
            textAlign: 'left',
            borderRadius: 0,
            backgroundOpacity: 0
        });

        this.header.add(
            new ThreeMeshUI.Text({ content: "Manoeuvre" }),
            new ThreeMeshUI.Text({
                content: "\n" + this.cardInfo.id,
                fontSize: 0.05
            })
        );

        // MAIN
        this.main = new ThreeMeshUI.Block({
            width: 1.3,
            margin: 0.02,
            backgroundColor: new THREE.Color("#505050"),
            backgroundOpacity: 1,
            padding: 0.02,
            borderRadius: 0.06,
        });

        //TCA
        this.tcaBlock = new ThreeMeshUI.Block({
            width: 1.15,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        this.tcaBlock.add(
            new ThreeMeshUI.Text({
                content: "Post-manoeuvre TCA",
                fontSize: 0.045
            }),
            new ThreeMeshUI.Text({
                content: "\n" + this.setValueTCA(this.cardInfo.collision_avoidance.tca),
                fontSize: 0.06
            }),
        );

        //Type
        this.typeBlock = new ThreeMeshUI.Block({
            width: 1.15,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        this.typeBlock.add(
            new ThreeMeshUI.Text({
                content: "Manoeuvring Type",
                fontSize: 0.045
            }),
            new ThreeMeshUI.Text({
                content: "\n" + this.cardInfo.type,
                fontColor: new THREE.Color("#FFBE0B"),
                fontSize: 0.06
            }),
        );

        //Duration
        this.durationBlock = new ThreeMeshUI.Block({
            width: 1.15,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        this.durationBlock.add(
            new ThreeMeshUI.Text({
                content: "Duration",
                fontSize: 0.045
            }),
            new ThreeMeshUI.Text({
                content: "\n" + this.cardInfo.sum_duration.toString() + "sec",
                fontSize: 0.06
            }),
        );

        //POC
        this.pocBlock = new ThreeMeshUI.Block({
            width: 1.15,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        this.pocBlock.add(
            new ThreeMeshUI.Text({
                content: "Post-manoeuvre Probability Of Collision",
                fontSize: 0.045
            }),
            new ThreeMeshUI.Text({
                content: "\n" + this.cardInfo.collision_avoidance.poc.toExponential(2),
                fontSize: 0.06
            }),
        );

        //Miss Distance
        this.missDistanceBlock = new ThreeMeshUI.Block({
            width: 1.15,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        this.missDistanceBlock.add(
            new ThreeMeshUI.Text({
                content: "Post-manoeuvre Miss Distance",
                fontSize: 0.045
            }),
            new ThreeMeshUI.Text({
                content: "\n" + this.cardInfo.collision_avoidance.miss_distance.total.toFixed(0) + "m",
                fontSize: 0.06
            }),
        );

        this.main.add(this.tcaBlock, this.typeBlock, this.durationBlock, this.pocBlock, this.missDistanceBlock)
        this.mesh.add(this.header, this.main)
        this.scene.add(this.mesh)
    }

    setValueTCA(isoDateString) {
        let date = new Date(isoDateString);

        let monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        let month = monthNames[date.getUTCMonth()];
        let day = date.getUTCDate();
        let year = date.getUTCFullYear();
        let hours = String(date.getUTCHours()).padStart(2, '0');
        let minutes = String(date.getUTCMinutes()).padStart(2, '0');
        let seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${month} ${day} ${year} ${hours}:${minutes}:${seconds} UTC`;
    }

    hide() {
        this.mesh.visible = false
        this.isOpen = false
    }

    show() {
        this.mesh.visible = true
        this.mesh.scale.set(0.3, 0.3, 0.3)
        this.mesh.position.set(this.experience.camera.object3D.position.x, 1.3, this.experience.camera.object3D.position.z - 0.5)
        this.isOpen = true
    }

    destroy() {
        disposeUI(this.mesh, this.experience.raycaster)
        this.mesh = null
    }
}
