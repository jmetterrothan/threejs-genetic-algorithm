// @ts-nocheck
import SceneWrapper from "../SceneWrapper";
class State {
  /**
   * State constructor
   * @param {SceneWrapper} sceneWrapper
   */
  constructor(sceneWrapper) {
    this.wrapper = sceneWrapper;
    this.scene = sceneWrapper.scene;
  }

  init() {}

  initPopulation() {}

  start() {
    this.wrapper.clean();
    this.initPopulation();
    this.run();
  }

  /**
   * Makes a generation loop and schedules the next one
   */
  run() {}

  /**
   * @param Population population
   */
  show(population) {}

  /**
   * Resize event
   * @param {number} w
   * @param {number} h
   */
  onResize(w, h) {}

  update() {}
}

export default State;
