import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"

export default class Views {
    constructor(panel) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.globeView = this.experience.world.globe
        this.roomView = this.experience.world.room

        // Setup 
        this.panel = panel
        this.objsToTest = this.experience.raycaster.objsToTest

        this.setTextures()
        this.setMesh()
    }

    setTextures() {
        this.textures = {}

        this.textures.globeViewIcon = this.resources.items.globeViewIcon
        this.textures.roomViewIcon = this.resources.items.roomViewIcon
    }

    setMesh() {
        // FOOTER

        let footer = new ThreeMeshUI.Block({
            width: 1,
            justifyContent: 'center',
            textAlign: 'left',
            margin: 0.02,
            backgroundOpacity: 0
        });

        // FOOTER TITLE 

        let footerTitle = new ThreeMeshUI.Block({
            width: 1,
            height: 0.15,
            justifyContent: 'center',
            textAlign: 'left',
            margin: 0.02,
            backgroundOpacity: 0
        });

        footerTitle.add(
            new ThreeMeshUI.Text({ content: 'Views' })
        );

        // FOOTER OPTIONS 

        let footerOptions = new ThreeMeshUI.Block({
            width: 1,
            justifyContent: 'center',
            contentDirection: 'row',
            margin: 0.02,
            backgroundOpacity: 0
        });

        this.globeViewButton = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.5,
            justifyContent: 'center',
            margin: 0.02,
            backgroundColor: new THREE.Color("#1E1E1E"),
            backgroundOpacity: 1
        });

        let globeIcon = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.5,
            justifyContent: 'center',
            margin: 0.02
        });

        globeIcon.set({
            backgroundTexture: this.textures.globeViewIcon,
        });

        this.globeViewButton.add(globeIcon)

        this.roomViewButton = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.5,
            justifyContent: 'center',
            margin: 0.02,
            backgroundColor: new THREE.Color("#1E1E1E"),
            backgroundOpacity: 1
        });


        let roomIcon = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.5,
            justifyContent: 'center',
            margin: 0.02
        });

        roomIcon.set({
            backgroundTexture: this.textures.roomViewIcon,
        });

        this.roomViewButton.add(roomIcon)

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
            borderOpacity: 1
        };

        this.globeViewButton.setupState({
            state: 'selected',
            attributes: selectedAttributes,
            onSet: () => {
                this.roomView.hide()
                this.globeView.show()
            }
        });
        this.globeViewButton.setupState(hoveredStateAttributes)
        this.globeViewButton.setupState(idleStateAttributes)

        this.roomViewButton.setupState({
            state: 'selected',
            attributes: selectedAttributes,
            onSet: () => {
                this.globeView.hide()
                this.roomView.show()
            }
        });
        this.roomViewButton.setupState(hoveredStateAttributes)
        this.roomViewButton.setupState(idleStateAttributes)
        
        footerOptions.add(this.globeViewButton, this.roomViewButton)
        footer.add(footerTitle, footerOptions)
        this.panel.add(footer)
        this.objsToTest.push(this.globeViewButton, this.roomViewButton)
    }
} 