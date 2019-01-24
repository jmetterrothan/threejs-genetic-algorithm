import 'reset-css';
import './assets/sass/style.scss';

import SceneWrapper from './SceneWrapper';
import CubeState from './States/CubeState';
import ChairState from './States/ChairState';

const scene = new SceneWrapper();
const cubeState = new CubeState(scene);
const chairState = new ChairState(scene);

scene.init();
scene.addState(cubeState);
scene.addState(chairState);
scene.start(1);