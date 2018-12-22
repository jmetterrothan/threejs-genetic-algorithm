import * as THREE from 'three';
import assert from 'assert';

import State from './State';
import Population from '../Population';
import GenotypeBlueprint from '../GenotypeBlueprint';

class TDState extends State
{
    init() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        this.wrapper.camera.position.set(0, 0, 0);

        /* algo 

        1 byte => 8 bit

        * Box => Cube
        * -- Couleur (8 bits par couleurs : 0 - 255) 24 bits
        * -- Width (8 bits : 0 - 255)
        * -- Height (8 bits : 0 - 255)
        * -- Depth (8 bits : 0 - 255)
        * 1111 1111|1111 1111|1111 1111|0000 1000|0000 1000|0000 1000
        */

       const nbPerRow = 5;
       const cellsize = 750;

       const cubeBlueprint = new GenotypeBlueprint();

       cubeBlueprint.addTrait('r', 8, GenotypeBlueprint.INTEGER, 255, value => value / 255);
       cubeBlueprint.addTrait('g', 8, GenotypeBlueprint.INTEGER, 0, value => value / 255);
       cubeBlueprint.addTrait('b', 8, GenotypeBlueprint.INTEGER, 0, value => value / 255);
       cubeBlueprint.addTrait('width', 8, GenotypeBlueprint.INTEGER, 16);
       cubeBlueprint.addTrait('height', 8, GenotypeBlueprint.INTEGER, 16);
       cubeBlueprint.addTrait('depth', 8, GenotypeBlueprint.INTEGER, 16);

       cubeBlueprint.updateTargetModel();
       
        const show = (population) => {
            const group = new THREE.Group();
            group.shouldBeDeletedOnCleanUp = true;
    
            population.genotypes.forEach((genotype, i) => {
                const data = cubeBlueprint.decode(genotype);
                
                const geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
                const material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color(data.r, data.g, data.b), 
                    transparent: true, 
                    opacity: 1.0
                });

                const cube = new THREE.Mesh(geometry, material);
                cube.castShadow = true;
                cube.receiveShadow = true;
    
                const row = Math.floor(i / nbPerRow);
                const col = i % nbPerRow;

                const x = col * cellsize;
                const y = population.generation * 750;
                const z = row * cellsize;

                cube.position.set(x, y, z);

                if (population.size <= 1 || genotype.score === 0) {
                    this.wrapper.camera.position.set(x, y, z);
                }
                
                group.add(cube);
            });
    
            //new THREE.Box3().setFromObject(group).getCenter(group.position).multiplyScalar(-1);
            this.scene.add(group);
        }

        let loop = true;
        let population = new Population(20, cubeBlueprint.size);
        population.evaluate(cubeBlueprint);

        const generate = () => {
            show(population);
            population.generation++;
            population.evaluate(cubeBlueprint);

            const selection = population.selectBestCandidates(Math.floor(population.size() * 0.5));

            if (population.hasTarget(cubeBlueprint) || selection.length <= 0) {
                loop = false;
            }
            else {
                // children
                for (let i = 0, n = selection.length; i < n; i += 2) {
                    if (selection[i] && selection[i + 1]) {
                        const child = selection[i].crossWith(selection[i + 1]);
                        selection.push(...child);
                    }
                }

                // mutate
                population.genotypes = selection.map(genotype => genotype.mutate(0.005));
            }
            generationLoop();
        };

        const generationLoop = () => {
            if (loop) {
                setTimeout(() => generate(), 500);
            }
        };

        generationLoop();
    }
    update() { }
}

export default TDState;