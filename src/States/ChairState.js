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
        const uiThickness = parseInt(document.getElementById('uiThickness').value, 10);
        const uiSeatWidth = parseInt(document.getElementById('uiSeatWidth').value, 10);
        const uiSeatDepth = parseInt(document.getElementById('uiSeatDepth').value, 10);
        const uiFeetThickness = parseInt(document.getElementById('uiFeetThickness').value, 10);
        const uiFeetHeight = parseInt(document.getElementById('uiFeetHeight').value, 10);
        const uiBackHeight = parseInt(document.getElementById('uiBackHeight').value, 10);
        const uiBackAngle = parseInt(document.getElementById('uiBackAngle').value, 10);
        const uiF1 = document.getElementById('uiF1').checked ? 1 : 0;
        const uiF2 = document.getElementById('uiF2').checked ? 1 : 0;
        const uiF3 = document.getElementById('uiF3').checked ? 1 : 0;
        const uiF4 = document.getElementById('uiF4').checked ? 1 : 0;
        const uiF5 = document.getElementById('uiF5').checked ? 1 : 0;

        this.layers = new THREE.Group();
        this.layers.shouldBeDeletedOnCleanUp = true;
        this.scene.add(this.layers);

        this.chairBlueprint = new GenotypeBlueprint();
        this.chairBlueprint.addTrait('r', 0, 255, GenotypeBlueprint.INTEGER, uiR);
        this.chairBlueprint.addTrait('g', 0, 255, GenotypeBlueprint.INTEGER, uiG);
        this.chairBlueprint.addTrait('b', 0, 255, GenotypeBlueprint.INTEGER, uiB);
        this.chairBlueprint.addTrait('thickness', 1, 25, GenotypeBlueprint.INTEGER, uiThickness);
        this.chairBlueprint.addTrait('seatWidth', 1, 150, GenotypeBlueprint.INTEGER, uiSeatWidth);
        this.chairBlueprint.addTrait('seatDepth', 1, 150, GenotypeBlueprint.INTEGER, uiSeatDepth);
        this.chairBlueprint.addTrait('feetThickness', 1, 10, GenotypeBlueprint.INTEGER, uiFeetThickness);
        this.chairBlueprint.addTrait('feetHeight', 1, 100, GenotypeBlueprint.INTEGER, uiFeetHeight);
        this.chairBlueprint.addTrait('backHeight', 1, 100, GenotypeBlueprint.INTEGER, uiBackHeight);
        this.chairBlueprint.addTrait('backAngle', 0, 90, GenotypeBlueprint.INTEGER, uiBackAngle);
        this.chairBlueprint.addTrait('f1', 0, 1, GenotypeBlueprint.INTEGER, uiF1);
        this.chairBlueprint.addTrait('f2', 0, 1, GenotypeBlueprint.INTEGER, uiF2);
        this.chairBlueprint.addTrait('f3', 0, 1, GenotypeBlueprint.INTEGER, uiF3);
        this.chairBlueprint.addTrait('f4', 0, 1, GenotypeBlueprint.INTEGER, uiF4);
        this.chairBlueprint.addTrait('f5', 0, 1, GenotypeBlueprint.INTEGER, uiF5);

        this.population = new Population(this.basePopulationCount, this.chairBlueprint.size, 0.0065);
        this.population.evaluate(this.chairBlueprint);

        this.show();
        this.loop();
    }

    loop() {
        setTimeout(() => {
            const targets = this.population.select(this.chairBlueprint);
            this.show();

            // stop loop if we found the target specimen
            if (targets.length === 0) {
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
        cf1.shouldBeDeletedOnCleanUp = true;
        const cf2 = cf1.clone();
        const cf3 = cf1.clone();
        const cf4 = cf1.clone();
        const cf5 = cf1.clone();

        cf1.position.set(data.feetThickness / 2, 0, data.seatDepth - data.feetThickness / 2);
        cf2.position.set(data.seatWidth - data.feetThickness / 2, 0, data.seatDepth - data.feetThickness / 2);
        cf3.position.set(data.feetThickness / 2, 0, data.feetThickness / 2);
        cf4.position.set(data.seatWidth - data.feetThickness / 2, 0, data.feetThickness / 2);
        cf5.position.set(data.seatWidth / 2 - data.feetThickness / 2, 0, data.seatDepth / 2 - data.feetThickness / 2);

        if (data.f1 === 1) chair.add(cf1);
        if (data.f2 === 1) chair.add(cf2);
        if (data.f3 === 1) chair.add(cf3);
        if (data.f4 === 1) chair.add(cf4);
        if (data.f5 === 1) chair.add(cf5);

        const p = new THREE.Mesh(new THREE.BoxGeometry(data.seatWidth, data.thickness, data.seatDepth), material);
        p.shouldBeDeletedOnCleanUp = true;
        p.position.set(data.seatWidth / 2, data.feetHeight / 2 + data.thickness / 2, data.seatDepth / 2);
        chair.add(p);

        const d = new THREE.Mesh(new THREE.BoxGeometry(data.seatWidth, data.backHeight, data.thickness), material);
        d.shouldBeDeletedOnCleanUp = true;
        d.geometry.translate(data.seatWidth / 2, data.backHeight / 2, 0);
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

export default ChairState;