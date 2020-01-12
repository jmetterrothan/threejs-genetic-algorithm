// @ts-nocheck
import * as THREE from "three";
import { SpriteText2D, textAlign } from "three-text2d";

import State from "./State";
import Population from "../Population";
import GenotypeBlueprint from "../GenotypeBlueprint";
import utility from "../utility";

class ChairState extends State {
  constructor(sceneWrapper) {
    super(sceneWrapper);

    this.gridCellSize = 375; // size of each cells in the grid
    this.gridDivisions = 100; // number of grid subdivisions
    this.gridOffset = 0; // grid offset
    this.generationDivisor = 5; // show every X generations only
  }

  init() {
    // ui panel
    this.ui = document.querySelector(".ui");
    this.ui.addEventListener("submit", e => {
      e.preventDefault();
      this.start();
    });

    this.initScene();
    this.initGrid();
  }

  initScene() {
    // init scene
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.65);
    directionalLight.target.position.set(1, 0, 0);
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

  createBlueprint() {
    /* Init algo */
    const uiR = parseInt(document.getElementById("uiR").value, 10);
    const uiG = parseInt(document.getElementById("uiG").value, 10);
    const uiB = parseInt(document.getElementById("uiB").value, 10);
    const uiSeatThickness = parseInt(
      document.getElementById("uiSeatThickness").value,
      10
    );
    const uiBackThickness = parseInt(
      document.getElementById("uiBackThickness").value,
      10
    );
    const uiSeatWidth = parseInt(
      document.getElementById("uiSeatWidth").value,
      10
    );
    const uiSeatDepth = parseInt(
      document.getElementById("uiSeatDepth").value,
      10
    );
    const uiFeetThickness = parseInt(
      document.getElementById("uiFeetThickness").value,
      10
    );
    const uiFeetHeight = parseInt(
      document.getElementById("uiFeetHeight").value,
      10
    );
    const uiBackHeight = parseInt(
      document.getElementById("uiBackHeight").value,
      10
    );
    const uiBackAngle = parseInt(
      document.getElementById("uiBackAngle").value,
      10
    );
    const uiF1 = document.getElementById("uiF1").checked ? 1 : 0;
    const uiF2 = document.getElementById("uiF2").checked ? 1 : 0;
    const uiF3 = document.getElementById("uiF3").checked ? 1 : 0;
    const uiF4 = document.getElementById("uiF4").checked ? 1 : 0;
    const uiF5 = document.getElementById("uiF5").checked ? 1 : 0;
    const uiB1 = document.getElementById("uiB1").checked ? 1 : 0;

    // Genotype setup
    this.blueprint = new GenotypeBlueprint();
    this.blueprint.addTrait("r", 0, 255, GenotypeBlueprint.INTEGER, uiR);
    this.blueprint.addTrait("g", 0, 255, GenotypeBlueprint.INTEGER, uiG);
    this.blueprint.addTrait("b", 0, 255, GenotypeBlueprint.INTEGER, uiB);
    this.blueprint.addTrait(
      "backThickness",
      1,
      25,
      GenotypeBlueprint.INTEGER,
      uiBackThickness
    );
    this.blueprint.addTrait(
      "seatThickness",
      1,
      25,
      GenotypeBlueprint.INTEGER,
      uiSeatThickness
    );
    this.blueprint.addTrait(
      "seatWidth",
      1,
      255,
      GenotypeBlueprint.INTEGER,
      uiSeatWidth
    );
    this.blueprint.addTrait(
      "seatDepth",
      1,
      255,
      GenotypeBlueprint.INTEGER,
      uiSeatDepth
    );
    this.blueprint.addTrait(
      "feetThickness",
      1,
      12,
      GenotypeBlueprint.INTEGER,
      uiFeetThickness
    );
    this.blueprint.addTrait(
      "feetHeight",
      1,
      255,
      GenotypeBlueprint.INTEGER,
      uiFeetHeight
    );
    this.blueprint.addTrait(
      "backHeight",
      1,
      255,
      GenotypeBlueprint.INTEGER,
      uiBackHeight
    );
    this.blueprint.addTrait(
      "backAngle",
      0,
      90,
      GenotypeBlueprint.INTEGER,
      uiBackAngle
    );
    this.blueprint.addTrait("f1", 0, 1, GenotypeBlueprint.INTEGER, uiF1);
    this.blueprint.addTrait("f2", 0, 1, GenotypeBlueprint.INTEGER, uiF2);
    this.blueprint.addTrait("f3", 0, 1, GenotypeBlueprint.INTEGER, uiF3);
    this.blueprint.addTrait("f4", 0, 1, GenotypeBlueprint.INTEGER, uiF4);
    this.blueprint.addTrait("f5", 0, 1, GenotypeBlueprint.INTEGER, uiF5);
    this.blueprint.addTrait("b1", 0, 1, GenotypeBlueprint.INTEGER, uiB1);
  }

  createBasePopulation() {
    this.population = Population.create(64, 0.001, this.blueprint);
  }

  /**
   * Create a chair model
   * @param {Object} data Genotype parsed data
   * @return {THREE.Group}
   */
  createChair(data) {
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color(data.r / 255, data.g / 255, data.b / 255),
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
        data.feetThickness,
        data.feetHeight,
        data.feetThickness
      ),
      material
    );
    cf1.shouldBeDeletedOnCleanUp = true;
    const cf2 = cf1.clone();
    const cf3 = cf1.clone();
    const cf4 = cf1.clone();
    const cf5 = cf1.clone();

    cf1.position.set(
      data.feetThickness / 2,
      0,
      data.seatDepth - data.feetThickness / 2
    );
    cf2.position.set(
      data.seatWidth - data.feetThickness / 2,
      0,
      data.seatDepth - data.feetThickness / 2
    );
    cf3.position.set(data.feetThickness / 2, 0, data.feetThickness / 2);
    cf4.position.set(
      data.seatWidth - data.feetThickness / 2,
      0,
      data.feetThickness / 2
    );
    cf5.position.set(
      data.seatWidth / 2 - data.feetThickness / 2,
      0,
      data.seatDepth / 2 - data.feetThickness / 2
    );

    if (data.f1 === 1) chair.add(cf1);
    if (data.f2 === 1) chair.add(cf2);
    if (data.f3 === 1) chair.add(cf3);
    if (data.f4 === 1) chair.add(cf4);
    if (data.f5 === 1) chair.add(cf5);

    // seat
    const p = new THREE.Mesh(
      new THREE.BoxGeometry(data.seatWidth, data.seatThickness, data.seatDepth),
      material
    );
    p.shouldBeDeletedOnCleanUp = true;
    p.position.set(
      data.seatWidth / 2,
      data.feetHeight / 2 + data.seatThickness / 2,
      data.seatDepth / 2
    );
    chair.add(p);

    //  back
    if (data.b1 === 1) {
      const d = new THREE.Mesh(
        new THREE.BoxGeometry(
          data.seatWidth,
          data.backHeight,
          data.backThickness
        ),
        material
      );
      d.shouldBeDeletedOnCleanUp = true;
      d.geometry.translate(data.seatWidth / 2, data.backHeight / 2, 0);
      d.rotateX(-utility.degToRad(data.backAngle));
      d.position.set(
        0,
        data.feetHeight / 2 + data.backThickness / 2,
        data.backThickness / 2
      );
      chair.add(d);
    }

    return chair;
  }

  /**
   * Place current population on a grid in 3d
   * @param {Population} population
   * @param {boolean} force
   */
  show(population, force = false) {
    if (!force && population.generation % this.generationDivisor !== 0) {
      return;
    }

    const group = new THREE.Group();
    group.shouldBeDeletedOnCleanUp = true;

    const mostFitIndividual = population.genotypes.find(
      genotype => genotype.fitness === 1
    );

    if (!mostFitIndividual) {
      return;
    }

    // display the 3d chair object
    const data = this.blueprint.decode(mostFitIndividual);
    const object = this.createChair(data);

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());

    const bbW = size.x;
    const bbH = size.y;
    const bbD = size.z;

    const x =
      this.gridOffset * this.gridCellSize - this.gridCellSize / 2 - bbW / 2;
    const y = data.feetHeight / 2;
    const z = -this.gridCellSize / 2 - bbD / 2;

    object.position.set(x, y, z);
    group.add(object);

    // tags
    const titleTag = new SpriteText2D(`Generation ${population.generation}`, {
      align: textAlign.center,
      font: "bold 16px Arial",
      fillStyle: population.hasTargets() ? "#ffffff" : "#00ff00",
      antialias: true,
      shadowColor: "rgba(0, 0, 0, 0.2)",
      shadowBlur: 3,
      shadowOffsetX: 2,
      shadowOffsetY: 2
    });

    titleTag.material.alphaTest = 0.1;
    titleTag.position.set(x + bbW / 2, y + (bbH + 50), z);
    group.add(titleTag);

    const score = (mostFitIndividual.score * 100).toFixed();
    const subtitleTag = new SpriteText2D(`(Score : ${score}%)`, {
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
    subtitleTag.position.set(x + bbW / 2, y + (bbH + 50) - 20, z);
    group.add(subtitleTag);

    this.gridOffset++;
    this.layers.add(group);
  }

  start() {
    this.gridOffset = 0;

    this.wrapper.clean();

    this.createBlueprint();
    this.createBasePopulation();

    this.layers = new THREE.Group();
    this.layers.shouldBeDeletedOnCleanUp = true;
    this.scene.add(this.layers);

    this.run();
  }

  update() {}

  onResize() {}

  run() {
    const targets = this.population.hasTargets();
    // stop loop if we found the target specimen
    if (targets.length === 0) {
      this.show(this.population, false);

      const next = this.population.breed();
      next.evaluate(this.blueprint);
      this.population = next;
      this.run();
    } else {
      this.show(this.population, true);
    }
  }
}

export default ChairState;
