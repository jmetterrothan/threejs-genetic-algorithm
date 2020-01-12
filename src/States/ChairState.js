// @ts-nocheck
import * as THREE from "three";
import { SpriteText2D, textAlign } from "three-text2d";

import State from "./State";
import Population from "../Population";
import GenotypeBlueprint from "../GenotypeBlueprint";

import utility from "../utility";

const BlueprintFormTypes = {
  NUMBER: 1,
  BOOLEAN: 2
};

const chairProfile = {
  color_r: 135,
  color_g: 200,
  color_b: 250,
  seat_thickness: 8,
  back_thickness: 8,
  feet_thickness: 4,
  seat_width: 64,
  seat_depth: 64,
  feet_height: 64,
  back_height: 72,
  back_angle: 25,
  has_feet1: 1,
  has_feet2: 1,
  has_feet3: 1,
  has_feet4: 1,
  has_feet5: 0,
  has_back: 1
};

const blueprintCfg = {
  color_r: { type: BlueprintFormTypes.NUMBER, min: 0, max: 255, step: 1 },
  color_g: { type: BlueprintFormTypes.NUMBER, min: 0, max: 255, step: 1 },
  color_b: { type: BlueprintFormTypes.NUMBER, min: 0, max: 255, step: 1 },
  seat_thickness: {
    type: BlueprintFormTypes.NUMBER,
    min: 1,
    max: 25,
    step: 1
  },
  back_thickness: {
    type: BlueprintFormTypes.NUMBER,
    min: 1,
    max: 25,
    step: 1
  },
  feet_thickness: {
    type: BlueprintFormTypes.NUMBER,
    min: 1,
    max: 12,
    step: 1
  },
  seat_width: {
    type: BlueprintFormTypes.NUMBER,
    min: 1,
    max: 255,
    step: 1
  },
  seat_depth: {
    type: BlueprintFormTypes.NUMBER,
    min: 1,
    max: 255,
    step: 1
  },
  feet_height: {
    type: BlueprintFormTypes.NUMBER,
    min: 1,
    max: 255,
    step: 1
  },
  back_height: {
    type: BlueprintFormTypes.NUMBER,
    min: 1,
    max: 255,
    step: 1
  },
  back_angle: { type: BlueprintFormTypes.NUMBER, min: 0, max: 90, step: 1 },
  has_feet1: { type: BlueprintFormTypes.BOOLEAN },
  has_feet2: { type: BlueprintFormTypes.BOOLEAN },
  has_feet3: { type: BlueprintFormTypes.BOOLEAN },
  has_feet4: { type: BlueprintFormTypes.BOOLEAN },
  has_feet5: { type: BlueprintFormTypes.BOOLEAN },
  has_back: { type: BlueprintFormTypes.BOOLEAN }
};

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

    Object.entries(blueprintCfg).forEach(([k, params]) => {
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
    return Object.entries(blueprintCfg).reduce((acc, [k, params]) => {
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

    if (!mostFitIndividual || this.previousScore === mostFitIndividual.score) {
      return;
    }

    const group = new THREE.Group();
    group.shouldBeDeletedOnCleanUp = true;

    // display the 3d chair object
    const chair = ChairObject.fromGenotype(this.blueprint, mostFitIndividual);
    const score = (mostFitIndividual.score * 100).toFixed();

    this.placeOnGrid(chair, this.gridOffset, 0, true);

    chair.addTitle(
      `Generation ${population.generation}`,
      mostFitIndividual.score === 1
    );

    chair.addSubtitle(`(Score : ${score}%)`);

    this.gridOffset++;
    this.previousScore = mostFitIndividual.score;
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

class ChairObject {
  constructor(data) {
    this.data = data;

    this.group = new THREE.Group();
    this.object = null;
  }

  /**
   * Build a chair model
   * @return {THREE.Group}
   */
  build() {
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color(
        this.data.color_r / 255,
        this.data.color_g / 255,
        this.data.color_b / 255
      ),
      transparent: true,
      opacity: 1.0,
      emissiveIntensity: 0.75
    });

    const chair = new THREE.Group();
    chair.shouldBeDeletedOnCleanUp = true;
    chair.castShadow = true;
    chair.receiveShadow = true;

    // feet
    const cf1 = new THREE.Mesh(
      new THREE.BoxGeometry(
        this.data.feet_thickness,
        this.data.feet_height,
        this.data.feet_thickness
      ),
      material
    );
    cf1.shouldBeDeletedOnCleanUp = true;
    const cf2 = cf1.clone();
    const cf3 = cf1.clone();
    const cf4 = cf1.clone();
    const cf5 = cf1.clone();

    cf1.position.set(
      this.data.feet_thickness / 2,
      this.data.feet_height / 2,
      this.data.seat_depth - this.data.feet_thickness / 2
    );
    cf2.position.set(
      this.data.seat_width - this.data.feet_thickness / 2,
      this.data.feet_height / 2,
      this.data.seat_depth - this.data.feet_thickness / 2
    );
    cf3.position.set(
      this.data.feet_thickness / 2,
      this.data.feet_height / 2,
      this.data.feet_thickness / 2
    );
    cf4.position.set(
      this.data.seat_width - this.data.feet_thickness / 2,
      this.data.feet_height / 2,
      this.data.feet_thickness / 2
    );
    cf5.position.set(
      this.data.seat_width / 2 - this.data.feet_thickness / 2,
      this.data.feet_height / 2,
      this.data.seat_depth / 2 - this.data.feet_thickness / 2
    );

    if (this.data.has_feet1 === 1) chair.add(cf1);
    if (this.data.has_feet2 === 1) chair.add(cf2);
    if (this.data.has_feet3 === 1) chair.add(cf3);
    if (this.data.has_feet4 === 1) chair.add(cf4);
    if (this.data.has_feet5 === 1) chair.add(cf5);

    // seat
    const p = new THREE.Mesh(
      new THREE.BoxGeometry(
        this.data.seat_width,
        this.data.seat_thickness,
        this.data.seat_depth
      ),
      material
    );
    p.shouldBeDeletedOnCleanUp = true;
    p.position.set(
      this.data.seat_width / 2,
      this.data.feet_height + this.data.seat_thickness / 2,
      this.data.seat_depth / 2
    );
    chair.add(p);

    //  back
    if (this.data.has_back === 1) {
      const d = new THREE.Mesh(
        new THREE.BoxGeometry(
          this.data.seat_width,
          this.data.back_height,
          this.data.back_thickness
        ),
        material
      );
      d.shouldBeDeletedOnCleanUp = true;
      d.geometry.translate(
        this.data.seat_width / 2,
        this.data.back_height / 2,
        0
      );
      d.rotateX(-utility.degToRad(this.data.back_angle));
      d.position.set(
        0,
        this.data.feet_height + this.data.back_thickness / 2,
        this.data.back_thickness / 2
      );
      chair.add(d);
    }

    chair.updateMatrix();

    const box = new THREE.Box3().setFromObject(chair);
    const size = box.getSize(new THREE.Vector3());
    this.size = { width: size.x, height: size.y, depth: size.z };

    this.object = chair;
    this.group.add(chair);
  }

  addTitle(text, active = false) {
    // tags
    const titleTag = new SpriteText2D(text, {
      align: textAlign.center,
      font: "bold 16px Arial",
      fillStyle: !active ? "#ffffff" : "#00ff00",
      antialias: true,
      shadowColor: "rgba(0, 0, 0, 0.2)",
      shadowBlur: 3,
      shadowOffsetX: 2,
      shadowOffsetY: 2
    });

    titleTag.material.alphaTest = 0.1;
    titleTag.position.set(
      this.object.position.x + this.size.width / 2,
      this.object.position.y + (this.size.height + 50),
      this.object.position.z
    );
    this.group.add(titleTag);
  }

  addSubtitle(text) {
    const subtitleTag = new SpriteText2D(text, {
      align: textAlign.center,
      font: "bold 12px Arial",
      fillStyle: "#dadada",
      antialias: true,
      shadowColor: "rgba(0, 0, 0, 0.2)",
      shadowBlur: 3,
      shadowOffsetX: 2,
      shadowOffsetY: 2
    });

    subtitleTag.material.alphaTest = 0.1;
    subtitleTag.position.set(
      this.object.position.x + this.size.width / 2,
      this.object.position.y + (this.size.height + 50) - 20,
      this.object.position.z
    );
    this.group.add(subtitleTag);
  }
}

ChairObject.fromGenotype = (blueprint, genotype) => {
  const data = blueprint.decode(genotype);

  const chair = new ChairObject(data);
  chair.build();

  return chair;
};

ChairObject.fromProfile = profile => {
  const chair = new ChairObject(profile);
  chair.build();

  return chair;
};

export default ChairState;
