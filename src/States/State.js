class State 
{
    constructor(sceneWrapper) {
        this.wrapper = sceneWrapper;
        this.scene = sceneWrapper.scene;
    }
    init() { }
    update() { }
    onResize(w, h) { }
}

export default State;