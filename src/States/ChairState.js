import * as THREE from 'three';

import State from './State';
import Population from '../Population';
import Genotype from '../Genotype';
import GenotypeBlueprint from '../GenotypeBlueprint';

class ChairState extends State
{
    constructor(sceneWrapper) {
        super(sceneWrapper);

        this.delay = 150;
        this.nbPerRow = 6;
        this.cellsize = 1000;
        this.basePopulationCount = 36;
    }

    init() {
        this.layers = new THREE.Group();
        this.layers.shouldBeDeletedOnCleanUp = true;
        this.scene.add(this.layers);

        // init scene
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const x = this.nbPerRow / 2 * this.cellsize;
        const z = this.nbPerRow / 2 * this.cellsize;
        const y = 0;
        this.wrapper.controls.getObject().position.set(x, y, z);

        /* init algo 

        1 byte => 8 bit

        ** GENOTYPE :
        * -- Couleur (8 bits par couleurs : 0 - 255) 24 bits
        * -- Width (8 bits : 0 - 255)
        * -- Height (8 bits : 0 - 255)
        * -- Depth (8 bits : 0 - 255)
        */

        this.chairBlueprint = new GenotypeBlueprint();
        this.chairBlueprint.addTrait('r', 8, GenotypeBlueprint.INTEGER, 255, value => value / 255);
        this.chairBlueprint.addTrait('g', 8, GenotypeBlueprint.INTEGER, 128, value => value / 255);
        this.chairBlueprint.addTrait('b', 8, GenotypeBlueprint.INTEGER, 0, value => value / 255);

        this.chairBlueprint.addTrait('width', 8, GenotypeBlueprint.INTEGER, 16);
        this.chairBlueprint.addTrait('height', 8, GenotypeBlueprint.INTEGER, 16);
        this.chairBlueprint.addTrait('depth', 8, GenotypeBlueprint.INTEGER, 16);

        this.population = new Population(this.basePopulationCount, this.chairBlueprint.size, 0.0075);
        this.population.evaluate(this.chairBlueprint);

        // this.show();
        // this.loop();

        const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color(0xffffff), 
            transparent: true, 
            opacity: 1.0
        });

        const cfv1 = new THREE.Mesh(new THREE.BoxGeometry(8, 72, 8), material);
        
        const cf1 = cfv1.clone();
        const cf2 = cfv1.clone();
        const cf3 = cfv1.clone();
        const cf4 = cfv1.clone();

        cf1.position.set(0, 0, 64);
        cf2.position.set(64, 0, 64);
        cf3.position.set(0, 0, 0);
        cf4.position.set(64, 0, 0);

        this.scene.add(cf1);
        this.scene.add(cf2);
        this.scene.add(cf3);
        this.scene.add(cf4);

        const p = new THREE.Mesh(new THREE.BoxGeometry(64 + 12, 8, 64 + 12), material);
        p.position.set(32, 36, 32);
        this.scene.add(p);

        const d = new THREE.Mesh(new THREE.BoxGeometry(64 + 12, 96, 8), material);
        d.position.set(32, 36 + 96 / 2, 0);
        d.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 20);
        this.scene.add(d);
    }

    loop() {
        setTimeout(() => {
            const target = this.population.select(this.chairBlueprint);
            this.show();

            // stop loop if we found the target specimen
            if (target === null) {
                this.loop();
            }
        }, this.delay);
    }

    /**
     * Place current population on a grid in 3d
     */
    show() {
        const group = new THREE.Group();
        group.shouldBeDeletedOnCleanUp = true;

        this.population.genotypes.forEach((genotype, i) => {
            const data = this.chairBlueprint.decode(genotype);
            
            const geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color(data.r, data.g, data.b), 
                transparent: true, 
                opacity: 1.0
            });

            const object = new THREE.Mesh(geometry, material);
            object.shouldBeDeletedOnCleanUp = true;
            object.castShadow = true;
            object.receiveShadow = true;

            const row = Math.floor(i / this.nbPerRow);
            const col = i % this.nbPerRow;

            const x = col * this.cellsize;
            const y = 0;
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

export default ChairState;