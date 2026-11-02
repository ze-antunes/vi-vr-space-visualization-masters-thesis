/* global AFRAME, THREE */
AFRAME.registerComponent('pinchable', {
    schema: {
        pinchDistance: { default: 0.1 }
    },

    init: function () {
        console.log("init")
        var sceneEl = this.el.sceneEl;
        this.worldPosition = new THREE.Vector3();
        this.bindMethods();
        this.pinched = false;
        sceneEl.addEventListener('pinchstarted', this.onPinchStarted);
        sceneEl.addEventListener('pinchended', this.onPinchEnded);
        sceneEl.addEventListener('pinchmoved', this.onPinchMoved);
    },

    bindMethods: function () {
        this.onPinchStarted = this.onPinchStarted.bind(this);
        this.onPinchEnded = this.onPinchEnded.bind(this);
        this.onPinchMoved = this.onPinchMoved.bind(this);
    },

    onPinchStarted: function (evt) {
        console.log("pinch started", evt)
        var pinchDistance = this.calculatePinchDistance(evt.detail.position);
        if (pinchDistance < this.data.pinchDistance) {
            console.log("pinchedstarted");
            this.el.emit('pinchedstarted');
            this.pinched = true;
        }
    },

    calculatePinchDistance: function (pinchWorldPosition) {
        var el = this.el;
        var worldPosition = this.worldPosition;
        var pinchDistance;

        worldPosition.copy(el.object3D.position);
        el.object3D.parent.updateMatrixWorld();
        el.object3D.parent.localToWorld(worldPosition);

        pinchDistance = worldPosition.distanceTo(pinchWorldPosition);

        return pinchDistance;
    },

    onPinchEnded: function (evt) {
        if (this.pinched) {
            this.pinched = false;
            this.el.emit('pinchedended');
        }
    },

    onPinchMoved: function (evt) {
        var el = this.el;
        var pinchDistance = this.calculatePinchDistance(evt.detail.position);
        if (!this.pinched) { return; }
        if (pinchDistance < this.data.pinchDistance) {
            el.emit('pinchedmoved', evt.detail);
        } else {
            this.pinched = false;
            el.emit('pinchedended');
        }
    }
});



// < !--camera rig-- >
//     <a-entity id="player">
//         <!-- camera -->
//         <a-entity
//             id="camera"
//             position="0 1.7 0"
//             camera
//             wasd-controls
//             look-controls
//         ></a-entity>

//         <!-- hand controls -->
//         <a-entity
//             id="leftHand"
//             sphere-collider="objects: a-box"
//             super-hands
//             hand-tracking-controls="hand: left"
//         ></a-entity>
//         <a-entity
//             id="rightHand"
//             sphere-collider="objects: a-box"
//             super-hands
//             laser-controls="hand: right;"
//             hand-tracking-controls="hand: right"
//         ></a-entity>
//         <!-- blink-controls="collisionEntities: a-plane,[color='red']" -->
//     </a-entity>