// @ts-nocheck
import * as THREE from "three";

import State from "../State";
import Population from "../../Population";
import GenotypeBlueprint from "../../GenotypeBlueprint";

import { BlueprintFormTypes } from "../../GenotypeBlueprint";
import ChairObject from './ChairObject';
import { blueprint as chairBlueprintCfg } from './blueprint';

class ChairState extends State {
  constructor(sceneWrapper) {
    super(sceneWrapper);

    this.gridCellSize = 375; // size of each cells in the grid
    this.gridDivisions = 100; // number of grid subdivisions
    this.gridOffset = 0; // grid offset
    this.previousScore = -1;
  }

  cleanSlate() {
    this.wrapper.clean();

    this.layers = new THREE.Group();
    this.layers.shouldBeDeletedOnCleanUp = true;
    this.scene.add(this.layers);
  }

  init() {
    this.wrapper.controls.getObject().position.set(-1100, 175, 600);

    // ui panel
    this.ui = document.querySelector(".ui");

    this.ui.addEventListener("change", e => {
      this.cleanSlate();
      this.createIdeal();
    });

    document.querySelector("#uiToggleBtn").addEventListener("click", e => {
      e.preventDefault();
      this.start();
    });

    this.initScene();
    this.initGrid();

    this.cleanSlate();
    this.createIdeal();
  }

  initScene() {
    // init scene
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
    directionalLight.target.position.set(1, 0.2, 0);
    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambientLight);
  }

  /**
   * Generate a baseline grid
   */
  initGrid() {
    const group = new THREE.Group();

    const grid = new THREE.GridHelper(
      this.gridCellSize * this.gridDivisions,
      this.gridDivisions,
      0x202026,
      0x202026
    );
    grid.translateY(1);
    group.add(grid);

    const geo = new THREE.PlaneBufferGeometry(
      this.gridCellSize * this.gridDivisions,
      this.gridCellSize * this.gridDivisions,
      this.gridDivisions,
      this.gridDivisions
    );
    const mat = new THREE.MeshBasicMaterial({
      color: 0x101013,
      side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(geo, mat);
    plane.rotateX(-Math.PI / 2);
    group.add(plane);

    this.scene.add(group);
  }

  /**
   * Place a chair on the grid
   * @param {ChairObject} chair
   * @param {number} col
   * @param {number} row
   */
  placeOnGrid(chair, col = 0, row = 0, addToLayer = false) {
    const x =
      col * this.gridCellSize - this.gridCellSize / 2 - chair.size.width / 2;
    const y = 0;
    const z =
      row * this.gridCellSize - this.gridCellSize / 2 - chair.size.depth / 2;

    chair.object.position.set(x, y, z);

    if (addToLayer) this.layers.add(chair.group);
  }

  createBlueprint() {
    const data = this.parseHTMLData();
    this.blueprint = new GenotypeBlueprint();

    Object.entries(chairBlueprintCfg).forEach(([k, params]) => {
      if (params.type === BlueprintFormTypes.NUMBER) {
        this.blueprint.addTrait(
          k,
          params.min,
          params.max,
          GenotypeBlueprint.INTEGER,
          data[k]
        );
      } else if (params.type === BlueprintFormTypes.BOOLEAN) {
        this.blueprint.addTrait(k, 0, 1, GenotypeBlueprint.INTEGER, data[k]);
      }
    });
  }

  parseHTMLData() {
    return Object.entries(chairBlueprintCfg).reduce((acc, [k, params]) => {
      const element = document.getElementById(`blueprint_${k}`);

      if (params.type === BlueprintFormTypes.NUMBER) {
        acc[k] = parseInt(element.value, 10);
      } else if (params.type === BlueprintFormTypes.BOOLEAN) {
        acc[k] = element.checked ? 1 : 0;
      }

      return acc;
    }, {});
  }

  createIdeal() {
    const target = ChairObject.fromProfile(this.parseHTMLData());
    this.placeOnGrid(target, -2, 0, true);

    target.addTitle(`Your chair`);
  }

  createBasePopulation() {
    this.population = Population.create(64, 0.001, this.blueprint);
  }

  /**
   * Place current population on a grid in 3d
   * @param {Population} population
   */
  show(population) {
    const mostFitIndividual = population.genotypes.find(
      genotype => genotype.fitness === 1
    );

    if (!mostFitIndividual) {
      return;
    }

    const score = (mostFitIndividual.score * 100).toFixed();

    if (this.previousScore === score) {
      return;
    }

    const group = new THREE.Group();
    group.shouldBeDeletedOnCleanUp = true;

    // display the 3d chair object
    const chair = ChairObject.fromGenotype(this.blueprint, mostFitIndividual);

    this.placeOnGrid(chair, this.gridOffset - 2, -4, true);

    chair.addTitle(
      `Generation ${population.generation}`,
      mostFitIndividual.score === 1
    );

    chair.addSubtitle(`(Score : ${score}%)`);

    this.gridOffset++;
    this.previousScore = score;
    this.layers.add(group);
  }

  start() {
    this.gridOffset = 0;
    this.previousScore = -1;

    this.cleanSlate();

    this.createBlueprint();

    this.createIdeal();

    this.createBasePopulation();

    this.run();
  }
  update() {}

  onResize() {}

  run() {
    this.show(this.population);

    const targets = this.population.hasTargets();
    // stop loop if we found the target specimen
    if (targets.length === 0) {
      const next = this.population.breed();
      next.evaluate(this.blueprint);
      this.population = next;
      this.run();
    }
  }
}

export default ChairState;
