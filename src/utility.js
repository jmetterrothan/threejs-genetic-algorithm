const TWO_PI = Math.PI * 2;

const degToRad = deg => {
  return (deg * Math.PI) / 180;
};

const radToDeg = rad => {
  return (rad * 180) / Math.PI;
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
  return ((x % m) + m) % m;
};

/**
 * @param {Array} a
 * @return Array
 */
const shuffleArray = a => {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
};

export default {
  TWO_PI,
  degToRad,
  radToDeg,
  lerp,
  mod,
  shuffleArray
};
