import { disposeUI } from '../../../Utils/Dispose'
import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"
import ConjunctionInfo from './ConjunctionInfo'
import ManoeuvreInfo from './ManoeuvreInfo'
import SearchPopup from './SearchPopup'

export default class Header {
    constructor(panel, title, cardType, owner) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Setup 
        this.panel = panel
        this.owner = owner
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
            attributes: selectedAttributes
        });
        this.info.onActivate = () => {
            this.experience.world.controls?.setTab('help')
        }
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
                attributes: selectedAttributes
            });

            this.columns.setupState(hoveredStateAttributes);
            this.columns.setupState(idleStateAttributes);

            this.columns.setupState({ state: 'disabled', attributes: { backgroundOpacity: 0.5 } })
            this.columns.onActivate = () => {
                this.owner.grid.toggleColumns()
                this.columns.set({ backgroundTexture: this.owner.grid.columns === 2 ? this.textures.twoColumnsIcon : this.textures.oneColumnIcon })
            }
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
                attributes: selectedAttributes
            });

            this.search.setupState(hoveredStateAttributes);
            this.search.setupState(idleStateAttributes);

            this.search.setupState({ state: 'disabled', attributes: { backgroundOpacity: 0.5 } })
            this.search.onActivate = () => {
                this.searchPopup ??= new SearchPopup(this.owner)
                this.searchPopup.toggle()
            }
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
        this.searchPopup?.destroy()
        if (this.infoPopup?.mesh) disposeUI(this.infoPopup.mesh, this.experience.raycaster)
        disposeUI(this.header, this.experience.raycaster)
        this.header = null
        this.infoPopup = null
    }
}
