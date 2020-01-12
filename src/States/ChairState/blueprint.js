import { BlueprintFormTypes } from "../../GenotypeBlueprint";

export const blueprint = {
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