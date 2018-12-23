const TWO_PI = Math.PI * 2;

const degToRad = (deg) => {
    return deg * Math.PI / 180;
};

const radToDeg = (rad) => {
    return rad * 180 / Math.PI;
};

const lerp = (a, b, t) => {
    return (1 - t) * a + t * b;
};

/**
 * Modulo function that handles negative values
 * @param {number} x 
 * @param {number} m 
 * @return number
 */
const mod = (x, m) => {
    return (x % m + m) % m;
};

const shuffleArray = arr => arr
  .map(a => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map(a => a[1]);

export default {
    TWO_PI,
    degToRad,
    radToDeg,
    lerp,
    mod,
    shuffleArray,
};