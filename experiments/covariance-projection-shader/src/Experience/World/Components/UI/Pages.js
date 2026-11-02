import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"

export default class Pages {
    constructor(panel, numbCards, status, grid) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Setup 
        this.panel = panel
        this.numbCards = numbCards
        this.status = status
        this.grid = grid
        this.objsToTest = this.experience.raycaster.objsToTest

        this.setTextures()
        this.setMesh()
    }

    setTextures() {
        this.textures = {}

        this.textures.leftArrowIcon = this.resources.items.leftArrowIcon
        this.textures.rightArrowIcon = this.resources.items.rightArrowIcon
    }

    setMesh() {
        let buttons = new ThreeMeshUI.Block({
            width: 1,
            height: 0.15,
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            margin: 0.02,
            backgroundOpacity: 0
        });

        // We start by creating objects containing options that we will use with the two buttons,
        // in order to write less code.

        let buttonOptions = {
            width: 0.3,
            height: 0.3,
            justifyContent: 'center',
            margin: 0.02,
            borderRadius: 0.075
        };

        let pagesOptions = {
            width: 0.4,
            height: 0.4,
            justifyContent: 'center',
            backgroundOpacity: 0
        };

        // Options for component.setupState().
        // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

        let hoveredStateAttributes = {
            state: 'hovered',
            attributes: {
                offset: 0.035,
                backgroundColor: new THREE.Color("#FFFFFF"),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0xffffff)
            },
        };

        let idleStateAttributes = {
            state: 'idle',
            attributes: {
                offset: 0.035,
                backgroundColor: new THREE.Color("#929292"),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0xffffff),
                borderWidth: 0
            },
        };

        this.buttonNext = new ThreeMeshUI.Block(buttonOptions);
        this.pages = new ThreeMeshUI.Block(pagesOptions);
        this.buttonPrevious = new ThreeMeshUI.Block(buttonOptions);

        this.pages.add(
            new ThreeMeshUI.Text({ content: this.status })
        );

        let selectedAttributes = {
            offset: 0.02,
            backgroundColor: new THREE.Color("#FFBE0B"),
            fontColor: new THREE.Color(0x222222),
        };

        this.buttonNext.setupState({
            state: 'selected',
            attributes: selectedAttributes,
            onSet: () => {
                console.log("bottonNext")
                // console.log(this.buttonNext)
                // this.grid.nextCards()
            }
        });
        this.buttonNext.setupState(hoveredStateAttributes);
        this.buttonNext.setupState(idleStateAttributes);

        //

        this.buttonPrevious.setupState({
            state: 'selected',
            attributes: selectedAttributes,
            onSet: () => {
                console.log("buttonPrevious")
                // this.grid.previousCards()
            }
        });
        this.buttonPrevious.setupState(hoveredStateAttributes);
        this.buttonPrevious.setupState(idleStateAttributes);

        this.buttonNext.set({
            backgroundTexture: this.textures.rightArrowIcon,
        });

        this.buttonPrevious.set({
            backgroundTexture: this.textures.leftArrowIcon,
        });

        buttons.add(this.buttonNext, this.pages, this.buttonPrevious);
        this.panel.add(buttons)
        this.objsToTest.push(this.buttonNext, this.buttonPrevious)
    }

    destroy() {
        // Remove from raycaster objects to test
        this.objsToTest = this.objsToTest.filter(obj => obj !== this.buttonNext && obj !== this.buttonPrevious);

        // Remove buttons from panel
        if (this.panel && this.buttons) {
            this.panel.remove(this.buttons);
        }

        // Dispose buttons and pages
        [this.buttonNext, this.buttonPrevious, this.pages].forEach(block => {
            if (block && block.children) {
                block.children.forEach(child => {
                    if (child.material) {
                        child.material.dispose();
                    }
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    block.remove(child);
                });
            }
        });

        // Dispose textures
        if (this.textures) {
            Object.values(this.textures).forEach(texture => {
                if (texture && texture.dispose) {
                    texture.dispose();
                }
            });
        }

        // Nullify references
        this.buttons = null;
        this.buttonNext = null;
        this.buttonPrevious = null;
        this.pages = null;
        this.panel = null;
        this.textures = null;
        this.experience = null;
        this.scene = null;
        this.time = null;
        this.resources = null;
        this.debug = null;
    }
}