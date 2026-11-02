import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"
import FontJSON from '../../../../fonts/Roboto-msdf.json'
import FontImage from '../../../../fonts/Roboto-msdf.png'

export default class ObjectPopup {
    constructor(title, objectInfo, object) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.time = this.experience.time
        this.resources = this.experience.resources

        // Setup 
        this.title = title
        this.title = this.title.trim();
        this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
        this.object = object
        this.objectInfo = objectInfo
        this.isOpen = false

        this.setTextures()
        this.setInfo()
        this.hide()
    }

    setTextures() {
        this.textures = {}

        this.textures.satelliteIcon = this.resources.items.satelliteIcon
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

        // this.mesh.position.set(0, 1.6, -1)
        this.mesh.scale.set(0.5, 0.5, 0.5)

        // HEADER
        this.header = new ThreeMeshUI.Block({
            width: 0.8,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            borderRadius: 0,
            backgroundOpacity: 0,
            padding: 0.05,
        });

        // // Title 

        let title = new ThreeMeshUI.Block({
            width: 0.6,
            height: 0.15,
            justifyContent: 'center',
            textAlign: 'left',
            fontSize: 0.1,
            backgroundOpacity: 0,
        });

        title.add(
            new ThreeMeshUI.Text({ content: this.title }),
            new ThreeMeshUI.Text({
                content: "\n" + this.objectInfo,
                fontSize: 0.05,
                fontColor: new THREE.Color("#DEDEDE"),
            })
        );

        // // Options

        let options = new ThreeMeshUI.Block({
            width: 0.15,
            height: 0.15,
            justifyContent: 'center',
            textAlign: 'center',
            contentDirection: 'row',
            backgroundOpacity: 0
        });

        this.icon = new ThreeMeshUI.Block({
            width: 0.15,
            height: 0.15,
            margin: 0.05,
            justifyContent: 'center',
        });

        this.icon.set({
            backgroundTexture: this.textures.satelliteIcon,
        });

        // MAIN
        this.main = new ThreeMeshUI.Block({
            width: 0.8,
            margin: 0.02,
            backgroundColor: new THREE.Color("#505050"),
            backgroundOpacity: 1,
            padding: 0.02,
            borderRadius: 0.06,
            // borderColor: new THREE.Color("red"),
            // borderWidth: 0.01
        });

        //Cospar Id
        this.cosparId = new ThreeMeshUI.Block({
            width: 0.65,
            height: 0.18,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        this.cosparId.add(
            new ThreeMeshUI.Text({
                content: "Cospar Id",
                fontSize: 0.045,
                fontColor: new THREE.Color("#DEDEDE"),
            }),
            new ThreeMeshUI.Text({
                content: "\n" + this.objectInfo,
                fontSize: 0.06
            }),
        );

        //Span
        this.span = new ThreeMeshUI.Block({
            width: 0.65,
            height: 0.18,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        this.span.add(
            new ThreeMeshUI.Text({
                content: "Span",
                fontSize: 0.045,
                fontColor: new THREE.Color("#DEDEDE"),
            }),
            new ThreeMeshUI.Text({
                content: "\n0.70 m",
                fontSize: 0.06
            }),
        );

        //Mass
        this.mass = new ThreeMeshUI.Block({
            width: 0.65,
            height: 0.18,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        this.mass.add(
            new ThreeMeshUI.Text({
                content: "Mass",
                fontSize: 0.045,
                fontColor: new THREE.Color("#DEDEDE"),
            }),
            new ThreeMeshUI.Text({
                content: "\n4.00 kg",
                fontSize: 0.06
            }),
        );

        options.add(this.icon)
        this.header.add(title, options)
        this.main.add(this.cosparId, this.span, this.mass)
        this.mesh.add(this.header, this.main)
        this.object.view.add(this.mesh)
    }

    hide() {
        this.mesh.scale.set(0, 0, 0)
        this.isOpen = false
    }

    show() {
        this.mesh.scale.set(0.5, 0.5, 0.5)
        this.isOpen = true
    }

    update() {
        // console.log("objectpopup update()")
        this.mesh.position.set(this.object.model.position.x, this.object.model.position.y, this.object.model.position.z)
        this.mesh.lookAt(this.camera.object3D.position.x, this.camera.object3D.position.y, this.camera.object3D.position.z)
    }
}