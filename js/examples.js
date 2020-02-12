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
  const x1 = (x + 1) * 199;
  const y1 = (z + 1) * 199;
  let sum = 0;
  for (let i = 0; i < 2; i++) {
    const x = Math.floor(x1) + i;
    const w1 = 1 - Math.abs(x - x1);
    for (let j = 0; j < 2; j++) {
      const y = Math.floor(y1) + j;
      const w2 = 1 - Math.abs(y - y1);
      const idx = 4 * (x + y*400);
      sum += w1*w2*data.data[idx+3];
    }
  }
  return sum > 128;
}`,
    'screw': `(x, y, z) => {
  const dx = Math.cos(z*20) * 0.1;
  const dy = Math.sin(z*20) * 0.1;
  return Math.pow(x+dx, 2) + Math.pow(y+dy, 2) < 0.2;
}`,
};
