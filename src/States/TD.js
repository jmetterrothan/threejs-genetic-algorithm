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

        this.wrapper.camera.position.set(0, 0, 500);
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

       const cubeBlueprint = new GenotypeBlueprint();

       cubeBlueprint.addTrait('r', 8, GenotypeBlueprint.INTEGER, 255, value => value / 255);
       cubeBlueprint.addTrait('g', 8, GenotypeBlueprint.INTEGER, 0, value => value / 255);
       cubeBlueprint.addTrait('b', 8, GenotypeBlueprint.INTEGER, 0, value => value / 255);
       cubeBlueprint.addTrait('width', 8, GenotypeBlueprint.INTEGER, 16);
       cubeBlueprint.addTrait('height', 8, GenotypeBlueprint.INTEGER, 16);
       cubeBlueprint.addTrait('depth', 8, GenotypeBlueprint.INTEGER, 16);

       cubeBlueprint.updateTargetModel();
       
        const show = (population) => {
            this.wrapper.clean();

            const group = new THREE.Group();
            group.shouldBeDeletedOnCleanUp = true;
    
            population.genotypes.forEach((genotype, i) => {
                const data = cubeBlueprint.decode(genotype);
                const opacity = (population.size <= 1 || genotype.score === 0) ? 1 : 0.2; // Math.max(1 - genotype.score / genotype.data.length, 0.2);
                
                const geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
                const material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color(data.r, data.g, data.b), 
                    transparent: true, 
                    opacity: opacity
                });

                const cube = new THREE.Mesh(geometry, material);
                cube.castShadow = true;
                cube.receiveShadow = true;
    
                const row = Math.floor(i / 32);
                const col = i % 32;
                cube.position.set(col * 255, 0, row * 255);

                if (population.size <= 1 || genotype.score === 0) {
                    this.wrapper.controls.target = new THREE.Vector3(col * 255, 0, row * 255);
                    this.wrapper.camera.position.set(col * 255, 100, row * 255);
                }
                
                group.add(cube);
            });
    
            //new THREE.Box3().setFromObject(group).getCenter(group.position).multiplyScalar(-1);
            this.scene.add(group);
        }

        let population = new Population(30000, cubeBlueprint.size);
        population.evaluate(cubeBlueprint);

        while (population.generation < 25) {
            population.generation++;
            population.evaluate(cubeBlueprint);

            const selection = population.selectBestCandidates(Math.floor(population.size() * 0.25));

            if (population.hasTarget(cubeBlueprint) > 0) { console.log('ok'); break; }
            if (selection.length <= 0) { break; }

            // children
            for (let i = 0, n = selection.length; i < n; i += 2) {
                if (selection[i] && selection[i + 1]) {
                    const child = selection[i].crossWith(selection[i + 1]);
                    selection.push(...child);
                }
            }

            // mutate
            selection.forEach(genotype => {
                genotype.mutate(0.15);
            });

            population.genotypes = selection;
        }
        
        show(population);
        console.log(population)
    }
    update() { }
}

export default TDState;