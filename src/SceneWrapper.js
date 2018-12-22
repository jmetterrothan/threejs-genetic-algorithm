import * as THREE from 'three';

import 'three/examples/js/controls/PointerLockControls';

import State from './States/State';

class SceneWrapper {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });

        this.controls = new THREE.PointerLockControls(this.camera);
        this.speed = new THREE.Vector3(2500, 2500, 2500);
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;

        this.lastTime = 0;

        this.state = -1;
        this.stateList = [];
        this.state = null;

        // state of the animation (play/pause)
        this.running = false;

        this.createAxesHelper();
    }
    
    /**
     * Main initialization of the scene
     */
    init() {
        this.scene.add(this.controls.getObject());

        // Scene basic setup
        this.renderer.setClearColor(0x000000);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.shadowMap.enabled = true;

        document.body.appendChild(this.renderer.domElement);


        // Window resize event handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio || 1);

            this.stateList[this.state].onResize(this.renderer.domElement.width, this.renderer.domElement.height);
        });

        // handle pointer lock authorization
        if ('pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document) {

            const pointerlockchange = (e) => {
                this.controls.enabled = document.pointerLockElement === document.body 
                || document.mozPointerLockElement === document.body 
                || document.webkitPointerLockElement === document.body;
            };
    
            const pointerlockerror = (e) => { };
    
            document.addEventListener('pointerlockchange', pointerlockchange, false);
            document.addEventListener('mozpointerlockchange', pointerlockchange, false);
            document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
            document.addEventListener('pointerlockerror', pointerlockerror, false);
            document.addEventListener('mozpointerlockerror', pointerlockerror, false);
            document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
    
            document.body.addEventListener('click', () => {
                document.body.requestPointerLock = document.body.requestPointerLock 
                || document.body.mozRequestPointerLock 
                || document.body.webkitRequestPointerLock;
                document.body.requestPointerLock();
            });
        }

        
        document.body.addEventListener('keydown', e => this.handleKeyboard(e.key, true && this.controls.enabled));
        document.body.addEventListener('keyup', e => this.handleKeyboard(e.key, false));
    }

    /**
     * Handle keyboard input
     * @param {string} key
     * @param {boolean} active
     */
    handleKeyboard(key, active) {
        switch (key) {
        case 'ArrowUp': case 'z': this.moveForward = active; break;
        case 'ArrowDown': case 's': this.moveBackward = active; break;
        case 'ArrowLeft': case 'q': this.moveLeft = active; break;
        case 'ArrowRight': case 'd': this.moveRight = active; break;
        case '+': case 'a': this.moveUp = active; break;
        case '-': case 'e': this.moveDown = active; break;
        }
    }

    run(time = 0) {
        const deltaTime = time - this.lastTime;
        const delta = deltaTime / 1000;
        this.lastTime = time;

        if (this.running) {
            this.stateList[this.state].update(delta);
        }
        this.move(delta);
        
        this.renderer.render(this.scene, this.camera);
        
        requestAnimationFrame(this.run.bind(this));
    }

    start(stateIndex) {
        this.switchState(stateIndex);

        this.running = true;
        this.run();
    }

    resume() {
        this.running = true;
    }

    pause() {
        this.running = false;
    }

    addState(state) {
        if (!(state instanceof State)) {
            throw new Error('Invalid state');
        }
        this.stateList.push(state);
    }

    /**
     * Show axes in the center of the scene
     * @param {number} scale Size of the gizmo
     */
    createAxesHelper(scale = 1) {
        const object = new THREE.AxesHelper();
        object.position.set(0, 0, 0);
        object.scale.x = object.scale.y = object.scale.z = scale;
        object.shouldBeDeletedOnCleanUp = true;

        this.scene.add(object);
    }

    /**
     * @param {number} delta
     */
    move(delta) {
        // movement
        if (this.moveForward) {
            this.velocity.z = -this.speed.z;
        } else {
            if (this.velocity.z < 0) { this.velocity.z = 0; }
        }

        if (this.moveBackward) {
            this.velocity.z = this.speed.z;
        } else {
            if (this.velocity.z > 0) { this.velocity.z = 0; }
        }

        if (this.moveRight) {
            this.velocity.x = this.speed.x;
        } else {
            if (this.velocity.x > 0) { this.velocity.x = 0; }
        }

        if (this.moveLeft) {
            this.velocity.x = -this.speed.x;
        } else {
            if (this.velocity.x < 0) { this.velocity.x = 0; }
        }

        if (this.moveDown) {
            this.velocity.y = this.speed.y;
        } else {
            if (this.velocity.y > 0) { this.velocity.y = 0; }
        }

        if (this.moveUp) {
            this.velocity.y = -this.speed.y;
        } else {
            if (this.velocity.y < 0) { this.velocity.y = 0; }
        }

        this.controls.getObject().translateX(this.velocity.x * delta);
        this.controls.getObject().translateY(this.velocity.y * delta);
        this.controls.getObject().translateZ(this.velocity.z * delta);
    }

    /**
     * Change the current state of the scene
     * @param {number} state index
     */
    switchState(state) {
        this.clean();
        this.controls.enabled = true;

        this.state = state;
        this.stateList[state].init();
    }

    /**
     * Removes all elements from the scene
     */
    clean() {
        this.removeItem(this.scene);
    }

    /**
     * Remove all children from a given object
     * @param {THREE.Object3D} obj
     */
    removeItem(obj) {
        for(let i = obj.children.length - 1; i >= 0; i--) {
            if(obj.children[i].shouldBeDeletedOnCleanUp === true) {
                this.removeItem(obj.children[i]);
                obj.remove(obj.children[i]);
            }
        }
    }
}

export default SceneWrapper;
