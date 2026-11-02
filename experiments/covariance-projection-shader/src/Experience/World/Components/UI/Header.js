// import * as THREE from 'three'
import ThreeMeshUI, { update } from 'three-mesh-ui'
import Experience from "../../../Experience"
import ConjunctionInfo from './ConjunctionInfo'
import ManoeuvreInfo from './ManoeuvreInfo'

export default class Header {
    constructor(panel, title, cardType) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Setup 
        this.panel = panel
        this.title = title
        this.cardType = cardType
        this.objsToTest = this.experience.raycaster.objsToTest

        this.setTextures()
        this.setMesh()
        // this.setInfoPopup()
    }

    setTextures() {
        this.textures = {}

        this.textures.oneColumnIcon = this.resources.items.oneColumnIcon
        this.textures.twoColumnsIcon = this.resources.items.twoColumnsIcon
        this.textures.searchIcon = this.resources.items.searchIcon
        this.textures.infoIcon = this.resources.items.infoIcon
    }

    setMesh() {
        // HEADER
        this.header = new ThreeMeshUI.Block({
            width: 1.3,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            margin: 0.025,
            borderRadius: 0,
            backgroundOpacity: 0
        });

        // // Title 

        let title = new ThreeMeshUI.Block({
            width: 0.7,
            height: 0.15,
            justifyContent: 'center',
            fontSize: 0.1,
            margin: 0.1,
            backgroundOpacity: 0
        });

        title.add(
            new ThreeMeshUI.Text({ content: this.title })
        );

        // // Options

        let options = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.15,
            justifyContent: 'center',
            textAlign: 'center',
            contentDirection: 'row',
            backgroundOpacity: 0
        });

        // options.add(
        //     new ThreeMeshUI.Text({ content: 'options' })
        // );

        this.info = new ThreeMeshUI.Block({
            width: 0.1,
            height: 0.1,
            margin: 0.05,
            justifyContent: 'center',
        });

        this.info.set({
            backgroundTexture: this.textures.infoIcon,
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
                backgroundColor: new THREE.Color("#FFF"),
                backgroundOpacity: 1,
                borderWidth: 0
            },
        };

        let selectedAttributes = {
            offset: 0.02,
            borderWidth: 0.005,
            backgroundColor: new THREE.Color("#FFBE0B"),
            borderOpacity: 1
        };

        this.infoOpen = false

        this.info.setupState({
            state: 'selected',
            attributes: selectedAttributes,
            onSet: () => {
                this.infoOpen = !this.infoOpen

                if (this.infoOpen) {
                    // console.log("open info " + this.title)
                    this.infoPopup.show()
                }
                else {
                    // console.log("close info " + this.title)
                    this.infoPopup.hide()
                }
            }
        });
        this.info.setupState(hoveredStateAttributes);
        this.info.setupState(idleStateAttributes);

        if (this.cardType === 'manoeuvreCard') {
            this.columns = new ThreeMeshUI.Block({
                width: 0.1,
                height: 0.1,
                justifyContent: 'center',
            });

            this.columns.set({
                backgroundTexture: this.textures.oneColumnIcon,
            });

            this.columns.setupState({
                state: 'selected',
                attributes: selectedAttributes,
                onSet: () => {
                    console.log("test columns")
                }
            });

            this.columns.setupState(hoveredStateAttributes);
            this.columns.setupState(idleStateAttributes);

            options.add(this.columns, this.info)
            this.objsToTest.push(this.columns, this.info)
        }
        else {
            this.search = new ThreeMeshUI.Block({
                width: 0.1,
                height: 0.1,
                justifyContent: 'center',
            });

            this.search.set({
                backgroundTexture: this.textures.searchIcon,
            });

            this.search.setupState({
                state: 'selected',
                attributes: selectedAttributes,
                onSet: () => {
                    console.log("develop search bar + keyboard")
                }
            });

            this.search.setupState(hoveredStateAttributes);
            this.search.setupState(idleStateAttributes);

            options.add(this.search, this.info)
            this.objsToTest.push(this.search, this.info)
        }

        this.header.add(title, options)
        this.panel.add(this.header)

        if (this.title === 'Conjunctions') {
            this.infoPopup = new ConjunctionInfo()
        }
        else {
            this.infoPopup = new ManoeuvreInfo()
        }
    }

    destroy() {
        // Remove infoPopup
        if (this.infoPopup) {
            this.infoPopup.hide();
            // this.infoPopup = null;
        }

        // Remove header from panel
        if (this.panel && this.header) {
            this.panel.remove(this.header);
        }

        // Remove blocks from scene and dispose them
        if (this.header) {
            this.header.children.forEach(child => {
                if (child instanceof ThreeMeshUI.Block) {
                    child.children.forEach(grandchild => {
                        if (grandchild.material) {
                            grandchild.material.dispose();
                        }
                        if (grandchild.geometry) {
                            grandchild.geometry.dispose();
                        }
                        child.remove(grandchild);
                    });
                }
                this.header.remove(child);
            });
        }

        // Remove from raycaster objects to test
        this.objsToTest = this.objsToTest.filter(obj => obj !== this.info && obj !== this.columns && obj !== this.search);

        // Dispose textures
        Object.values(this.textures).forEach(texture => {
            if (texture && texture.dispose) {
                texture.dispose();
            }
        });

        // Nullify references
        this.header = null;
        this.info = null;
        this.columns = null;
        this.search = null;
        this.panel = null;
        this.textures = null;
        this.experience = null;
        this.scene = null;
        this.time = null;
        this.resources = null;
        this.debug = null;
    }
}