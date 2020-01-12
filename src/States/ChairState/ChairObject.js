// @ts-nocheck
import * as THREE from "three";
import { SpriteText2D, textAlign } from "three-text2d";

import utility from "../../utility";

/*
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
*/

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

export default ChairObject;