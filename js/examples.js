const EXAMPLE_CODES = {
    'sphere': '(x, y, z) => {\n  return x*x + y*y + z*z < 1;\n}',
    'hole-box': `(x, y, z) => {
  if (Math.abs(x) > 1 || Math.abs(y) > 1 || Math.abs(z) > 1) {
    return false;
  }
  return x*x + z*z > 0.1;
}`,
    'corner-cut': `(x, y, z) => {
  if (Math.abs(x) > 1 || Math.abs(y) > 1 || Math.abs(z) > 1) {
    return false;
  }
  let cutOff = false;
  [-1, 1].forEach((cx) => {
    [-1, 1].forEach((cy) => {
      [-1, 1].forEach((cz) => {
        if (Math.pow(x-cx, 2) + Math.pow(y-cy, 2) + Math.pow(z-cz, 2) < 0.4) {
          cutOff = true;
        }
      });
    });
  });
  return !cutOff;
}`,
    'text': `const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext('2d');
ctx.font = '350px serif';
ctx.textBaseline = 'middle';
ctx.textAlign = 'center';
ctx.fillText('Hi', 200, 200);
const data = ctx.getImageData(0, 0, 400, 400);

(x, y, z) => {
  if (x < -1 || x > 1 || z < -1 || z > 1 || y > -0.5) {
    return false;
  }
  const x1 = Math.floor((x + 1) * 200);
  const y1 = Math.floor((z + 1) * 200);
  return data.data[4 * (x1 + y1*400) + 3] > 128;
}`,
};