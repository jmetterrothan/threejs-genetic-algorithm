import SceneWrapper from '../SceneWrapper';
class State 
{
    /**
     * State constructor
     * @param {SceneWrapper} sceneWrapper 
     */
    constructor(sceneWrapper) {
        this.wrapper = sceneWrapper;
        this.scene = sceneWrapper.scene;
    }

    init() { }
    
    update() { }

    /**
     * Resize event
     * @param {number} w 
     * @param {number} h 
     */
    onResize(w, h) { }
}

export default State;