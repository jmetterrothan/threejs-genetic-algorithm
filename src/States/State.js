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
}

export default State;
