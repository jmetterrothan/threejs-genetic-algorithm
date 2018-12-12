import 'reset-css';
import './assets/sass/style.scss';

import SceneWrapper from './SceneWrapper';
import TDState from './States/TD';

const scene = new SceneWrapper();
const td = new TDState(scene);

scene.init();
scene.addState(td);
scene.start(0);
