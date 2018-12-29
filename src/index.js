import 'reset-css';
import './assets/sass/style.scss';

import SceneWrapper from './SceneWrapper';
import ChairState from './States/ChairState';

const scene = new SceneWrapper();
const chairState = new ChairState(scene);

scene.init();
scene.addState(chairState);
scene.start(0);
