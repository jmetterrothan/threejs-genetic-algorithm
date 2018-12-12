import * as THREE from 'three';

import State from './State';
import Genotype, { normalize } from '../Genotype';

class Population
{
    constructor(n, size) {
        this.genotypes = Genotype.createPopulation(n, size);
        this.generation = 0;
    }

    evaluate(target) {
        const result = this.genotypes.map(genotype => genotype.evaluate(target));
        
        // keep values in a range bewteen 0 - 1 so our fitness is relative to the whole population
        const normalizedResult = normalize(result);
        this.genotypes.forEach((genotype, i) => genotype.fitness = normalizedResult[i]);
    }
}

class TDState extends State
{
    init() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        this.wrapper.camera.position.set(0, 0, 1500);
        this.wrapper.controls.enabled = true;
        this.wrapper.controls.update();

        //const gridHelper = new THREE.GridHelper(64 * 64, 64);
        //this.scene.add(gridHelper)

        /* algo 

        1 byte => 8 bit

        * Box => Cube
        * -- Couleur (8 bits par couleurs : 0 - 255) 24 bits
        * -- Width (8 bits : 0 - 255)
        * -- Height (8 bits : 0 - 255)
        * -- Depth (8 bits : 0 - 255)
        * 11111111|11111111|11111111|0100|0100|0100
        */

        const decode = (genotype) => {
            const color = new THREE.Color();
            color.r = Number(parseInt(genotype.data.slice(0, 9).join(''), 2)) / 256;
            color.g = Number(parseInt(genotype.data.slice(9, 17).join(''), 2)) / 256;
            color.b = Number(parseInt(genotype.data.slice(17, 25).join(''), 2)) / 256;

            const width = Number(parseInt(genotype.data.slice(25, 33).join(''), 2));
            const height = Number(parseInt(genotype.data.slice(33, 41).join(''), 2));
            const depth = Number(parseInt(genotype.data.slice(41).join(''), 2));

            return { width, height, depth, color };
        };

        const show = (population) => {
            this.wrapper.clean();

            const group = new THREE.Group();
            group.shouldBeDeletedOnCleanUp = true;
    
            population.genotypes.forEach((genotype, i) => {
                const data = decode(genotype);
                const fit = genotype.fitness <= 0.25
                const opacity = fit ? 1 : 0.125;
                
                const geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
                const material = new THREE.MeshLambertMaterial({
                    color: data.color, 
                    transparent: true, 
                    opacity: opacity
                });

                const cube = new THREE.Mesh(geometry, material);
                cube.castShadow = true;
                cube.receiveShadow = true;
    
                const row = Math.floor(i / 12);
                const col = i % 12;
                cube.position.set(col * 255, fit ? 512 : 0, row * 255);
                
                group.add(cube);
            });
    
            new THREE.Box3().setFromObject(group).getCenter(group.position).multiplyScalar(-1);
            this.scene.add(group);
        }

        const target = [
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
            0, 0, 0, 0, 0, 1, 0, 0,
            0, 0, 0, 0, 0, 1, 0, 0,
            0, 0, 0, 0, 0, 1, 0, 0,
        ];

        let population = new Population(128, 48);
        population.evaluate(target);
        console.log(population)
        show(population);
    }
    update() { }
}

export default TDState;