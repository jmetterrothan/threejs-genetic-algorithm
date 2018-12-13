import * as THREE from 'three';

import State from './State';
import Genotype, { normalize } from '../Genotype';

class Population
{
    constructor(n, size) {
        this.genotypes = Genotype.createPopulation(n, size);
        this.generation = 0;
    }

    /**
     * Evaluate the whole population
     * @param {number[]} target 
     */
    evaluate(target) {
        const results = this.genotypes.map(genotype => genotype.evaluate(target));
        // keep values in a range bewteen 0 - 1 so our fitness is relative to the whole population
        const normalizedResults = normalize(results);

        this.genotypes.forEach((genotype, i) => {
            genotype.score = results[i];
            genotype.fitness = normalizedResults[i];
        });
    }

    selectBestCandidates(threshold) {
        this.genotypes = this.genotypes.filter(genotype => genotype.fitness <= threshold);
    }

    size() {
        return this.genotypes.length;
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
        * 1111 1111|1111 1111|1111 1111|0000 1000|0000 1000|0000 1000
        */

        const decode = (genotype) => {
            const color = new THREE.Color();
            color.r = Number(parseInt(genotype.data.slice(0, 8).join(''), 2)) / 255;
            color.g = Number(parseInt(genotype.data.slice(8, 16).join(''), 2)) / 255;
            color.b = Number(parseInt(genotype.data.slice(16, 24).join(''), 2)) / 255;
            
            const width = Number(parseInt(genotype.data.slice(24, 32).join(''), 2));
            const height = Number(parseInt(genotype.data.slice(32, 40).join(''), 2));
            const depth = Number(parseInt(genotype.data.slice(40).join(''), 2));

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
            0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0,
        ];

        let population = new Population(64, 48);
        population.evaluate(target);

        while (population.generation < 32) {
            if (population.size() <= 1) {
                break;
            }
            
            population.generation++;
            population.selectBestCandidates(0.5);

            // children
            const temp = [];
            for (let i = 0; i < population.size(); i += 2) {
                if (population.genotypes[i] && population.genotypes[i + 1]) {
                    const child = population.genotypes[i].crossWith(population.genotypes[i + 1]);
                    temp.push(...child);
                }
            }
            population.genotypes.push(...temp);

            // mutate
            population.genotypes.forEach(genotype => {
                genotype.mutate(0.1);
            });

            population.evaluate(target);
        }
        
        show(population);
        console.log(population)
    }
    update() { }
}

export default TDState;