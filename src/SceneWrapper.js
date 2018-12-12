import * as THREE from 'three';

import OrbitControls from 'three-orbitcontrols';
import State from './States/State';

class SceneWrapper {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

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
        // Scene basic setup
        this.renderer.setClearColor(0x000000);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.shadowMap.enabled = true;
        
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        document.body.appendChild(this.renderer.domElement);


        // Window resize event handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio || 1);

            this.stateList[this.state].onResize(this.renderer.domElement.width, this.renderer.domElement.height);
        });
    }

    run(delta = 0) {
        if (this.running) {
            this.controls.update();
            this.stateList[this.state].update(delta);
        }

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
