import * as THREE from 'three';

import State from './State';
import Population from '../Population';
import GenotypeBlueprint from '../GenotypeBlueprint';
import utility from '../utility';

class ChairState extends State
{
    constructor(sceneWrapper) {
        super(sceneWrapper);

        this.delay = 150;
        this.nbPerRow = 6;
        this.cellsize = 1000;
        this.basePopulationCount = this.nbPerRow * this.nbPerRow;
    }

    init() {
        this.layers = new THREE.Group();
        this.layers.shouldBeDeletedOnCleanUp = true;
        this.scene.add(this.layers);

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

        /* init algo 

        1 byte => 8 bit

        ** GENOTYPE :
        * -- r/g/b (8 bits par couleurs : 0 - 255) 24 bits
        * -- angle (0 - 90) 
        */

        this.chairBlueprint = new GenotypeBlueprint();
        this.chairBlueprint.addTrait('r', 0, 255, GenotypeBlueprint.INTEGER, 255);
        this.chairBlueprint.addTrait('g', 0, 255, GenotypeBlueprint.INTEGER, 128);
        this.chairBlueprint.addTrait('b', 0, 255, GenotypeBlueprint.INTEGER, 0);

        this.chairBlueprint.addTrait('thickness', 1, 100, GenotypeBlueprint.INTEGER, 8);
        this.chairBlueprint.addTrait('seatSize', 1, 160, GenotypeBlueprint.INTEGER, 64);
        this.chairBlueprint.addTrait('feetThickness', 1, 10, GenotypeBlueprint.INTEGER, 4);
        this.chairBlueprint.addTrait('feetHeight', 1, 100, GenotypeBlueprint.INTEGER, 72);
        this.chairBlueprint.addTrait('backHeight', 1, 100, GenotypeBlueprint.INTEGER, 84);
        this.chairBlueprint.addTrait('backAngle', 0, 90, GenotypeBlueprint.INTEGER, 25);
        this.chairBlueprint.addTrait('f1', 0, 1, GenotypeBlueprint.INTEGER, 1);
        this.chairBlueprint.addTrait('f2', 0, 1, GenotypeBlueprint.INTEGER, 1);
        this.chairBlueprint.addTrait('f3', 0, 1, GenotypeBlueprint.INTEGER, 1);
        this.chairBlueprint.addTrait('f4', 0, 1, GenotypeBlueprint.INTEGER, 1);
        this.chairBlueprint.addTrait('f5', 0, 1, GenotypeBlueprint.INTEGER, 0);

        this.population = new Population(this.basePopulationCount, this.chairBlueprint.size, 0.0065);
        this.population.evaluate(this.chairBlueprint);

        this.show();
        this.loop();
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

    createChair(data) {
        const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color(data.r / 255, data.g / 255, data.b / 255), 
            transparent: true, 
            opacity: 1.0
        });
        
        const chair = new THREE.Group();
        chair.shouldBeDeletedOnCleanUp = true;
        chair.castShadow = true;
        chair.receiveShadow = true;

        const cf1 = new THREE.Mesh(new THREE.BoxGeometry(data.feetThickness, data.feetHeight, data.feetThickness), material);
        const cf2 = cf1.clone();
        const cf3 = cf1.clone();
        const cf4 = cf1.clone();
        const cf5 = cf1.clone();

        cf1.position.set(data.feetThickness / 2, 0, data.seatSize - data.feetThickness / 2);
        cf2.position.set(data.seatSize - data.feetThickness / 2, 0, data.seatSize - data.feetThickness / 2);
        cf3.position.set(data.feetThickness / 2, 0, data.feetThickness / 2);
        cf4.position.set(data.seatSize - data.feetThickness / 2, 0, data.feetThickness / 2);
        cf5.position.set(data.seatSize / 2, 0, data.seatSize / 2);

        if (data.f1 === 1) chair.add(cf1);
        if (data.f2 === 1) chair.add(cf2);
        if (data.f3 === 1) chair.add(cf3);
        if (data.f4 === 1) chair.add(cf4);
        if (data.f5 === 1) chair.add(cf5);

        const p = new THREE.Mesh(new THREE.BoxGeometry(data.seatSize, data.thickness, data.seatSize), material);
        p.position.set(data.seatSize / 2, data.feetHeight / 2 + data.thickness / 2, data.seatSize / 2);
        chair.add(p);

        const d = new THREE.Mesh(new THREE.BoxGeometry(data.seatSize, data.backHeight, data.thickness), material);
        d.geometry.translate(data.seatSize / 2, data.backHeight / 2, 0);
        d.rotateX(-utility.degToRad(data.backAngle));
        d.position.set(0, data.feetHeight / 2 + data.thickness / 2, data.thickness / 2);
        chair.add(d);

        return chair;
    }

    /**
     * Place current population on a grid in 3d
     */
    show() {
        const group = new THREE.Group();
        group.shouldBeDeletedOnCleanUp = true;

        this.population.genotypes.forEach((genotype, i) => {
            const data = this.chairBlueprint.decode(genotype);
            const object = this.createChair(data);

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