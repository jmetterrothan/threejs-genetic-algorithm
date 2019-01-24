import * as THREE from 'three';

import State from './State';
import Population from '../Population';
import GenotypeBlueprint from '../GenotypeBlueprint';
import utility from '../utility';

class CubeState extends State
{
    constructor(sceneWrapper) {
        super(sceneWrapper);

        this.delay = 150;
        this.nbPerRow = 6;
        this.cellsize = 1000;
        this.basePopulationCount = this.nbPerRow * this.nbPerRow;
    }

    init() {
        // init scene
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.target.position.set(1, 0, 0);
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
        this.scene.add(ambientLight);

        const x = this.nbPerRow / 2 * this.cellsize;
        const z = this.nbPerRow / 2 * this.cellsize;
        const y = 0;
        this.wrapper.controls.getObject().position.set(x, y, z);

        // ui panel
        this.ui = document.querySelector('.ui');
        this.ui.addEventListener('submit', (e) => {
            e.preventDefault();
            this.wrapper.clean();
            this.initPopulation();
        });
    }

    initPopulation() {
        /* Init algo */
        const uiR = parseInt(document.getElementById('uiR').value, 10);
        const uiG = parseInt(document.getElementById('uiG').value, 10);
        const uiB = parseInt(document.getElementById('uiB').value, 10);

        // Genotype setup
        this.layers = new THREE.Group();
        this.layers.shouldBeDeletedOnCleanUp = true;
        this.scene.add(this.layers);

        this.cubeBlueprint = new GenotypeBlueprint();
        this.cubeBlueprint.addTrait('r', 0, 255, GenotypeBlueprint.INTEGER, uiR);
        this.cubeBlueprint.addTrait('g', 0, 255, GenotypeBlueprint.INTEGER, uiG);
        this.cubeBlueprint.addTrait('b', 0, 255, GenotypeBlueprint.INTEGER, uiB);
        this.cubeBlueprint.addTrait('w', 1, 350, GenotypeBlueprint.INTEGER, 50);
        this.cubeBlueprint.addTrait('h', 1, 350, GenotypeBlueprint.INTEGER, 50);
        this.cubeBlueprint.addTrait('d', 1, 350, GenotypeBlueprint.INTEGER, 50);

        this.population = new Population(this.basePopulationCount, this.cubeBlueprint.size, 0.0065);
        this.population.evaluate(this.cubeBlueprint);

        this.show();
        this.loop();
    }

    /**
     * Makes a generation loop and schedules the next one
     */
    loop() {
        setTimeout(() => {
            const targets = this.population.breed(this.cubeBlueprint);
            this.show();

            // stop loop if we found the target specimen
            if (targets.length === 0) {
                this.loop();
            }
        }, this.delay);
    }

    /**
     * Create a cube model
     * @param {Object} data Genotype parsed data
     * @return {THREE.Mesh}
     */
    createcube(data) {
        const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color(data.r / 255, data.g / 255, data.b / 255), 
            transparent: true, 
            opacity: 1.0
        });
        
        const geometry = new THREE.BoxGeometry(data.w, data.h, data.d);

        const cube = new THREE.Mesh(geometry, material);
        cube.shouldBeDeletedOnCleanUp = true;
        cube.castShadow = true;
        cube.receiveShadow = true;

        return cube;
    }

    /**
     * Place current population on a grid in 3d
     */
    show() {
        const group = new THREE.Group();
        group.shouldBeDeletedOnCleanUp = true;

        this.population.genotypes.forEach((genotype, i) => {
            const data = this.cubeBlueprint.decode(genotype);
            const object = this.createcube(data);

            const row = Math.floor(i / this.nbPerRow);
            const col = i % this.nbPerRow;

            const x = col * this.cellsize;
            const y = genotype.score === 0 ? 256 : 0;
            const z = row * this.cellsize;

            object.position.set(x, y, z);
           
            group.add(object);
        });

        // y position based on generation
        group.position.y = this.population.generation * 750;

        this.layers.add(group);
    }

    update(delta) {
        
    }
}

export default CubeState;