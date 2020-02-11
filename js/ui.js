class UserInterface {
    constructor() {
        this.exampleSelect = document.getElementById('example-select');
        this.solidCode = document.getElementById('solid-code');
        this.renderButton = document.getElementById('render-button');
        this.canvas = document.getElementById('rendering');
        this.rayTracer = null;
        this.rotationMatrix = Mat3.identity();

        this.exampleSelect.addEventListener('change', () => this.showExample());
        this.renderButton.addEventListener('click', () => this.render());

        this._setupMouseEvents();
        this._setupTouchEvents();

        this.showExample();
    }

    render() {
        if (this.rayTracer !== null) {
            this.rayTracer.cancel();
        }
        const rawSolidFunc = eval(this.solidCode.value);
        const solidFunc = (v) => {
            const v1 = this.rotationMatrix.transpose().apply(v);
            if (v1.maxAbs() > 1) {
                return false;
            }
            return rawSolidFunc(v1.x, v1.y, v1.z);
        };
        this.rayTracer = new RayTracer(this.canvas, solidFunc, 0.01, 0.00001);
        this.rayTracer.renderFast();
        this.rayTracer.render();
    }

    showExample() {
        const name = this.exampleSelect.value;
        const codes = {
            'sphere': '(x, y, z) => {\n  return x*x + y*y + z*z < 1;\n}',
            'hole-box': '(x, y, z) => {\n' +
                '  if (Math.abs(x) > 1 || Math.abs(y) > 1 || Math.abs(z) > 1) {\n' +
                '    return false;\n' +
                '  }\n' +
                '  return x*x + z*z > 0.1;\n' +
                '}',
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
        };
        this.solidCode.value = codes[name];
        this.render();
    }

    _setupMouseEvents() {
        this._setupMovementEvents('mousedown', 'mousemove', 'mouseup');
    }

    _setupTouchEvents() {
        this._setupMovementEvents('touchstart', 'touchmove', 'touchend');
    }

    _setupMovementEvents(start, move, end) {
        const eventCoord = (e) => {
            const bounds = this.canvas.getBoundingClientRect();
            if (start == 'touchstart') {
                e = e.touches[0];
            }
            return [e.clientX - bounds.left, e.clientY - bounds.top];
        }
        this.canvas.addEventListener(start, (e) => {
            e.preventDefault();

            const startCoord = eventCoord(e);
            const startRotation = this.rotationMatrix;

            let moveHandler, upHandler;
            const cancelEvents = () => {
                window.removeEventListener(move, moveHandler);
                window.removeEventListener(end, upHandler);
            };
            moveHandler = (e) => {
                const newCoord = eventCoord(e);
                const distance = Math.sqrt(Math.pow(startCoord[0] - newCoord[0], 2) +
                    Math.pow(startCoord[1] - newCoord[1], 2));
                if (distance === 0) {
                    this.rotationMatrix = startRotation;
                } else {
                    const rotAxis = new Vec3(newCoord[1] - startCoord[1], 0,
                        startCoord[0] - newCoord[0]).normalize();
                    const rotAngle = -0.01 * distance;
                    this.rotationMatrix = Mat3.rotation(rotAxis, rotAngle).mul(startRotation);
                }
                this.render();
            };
            upHandler = cancelEvents;
            window.addEventListener(move, moveHandler);
            window.addEventListener(end, upHandler);
        });
    }
}

new UserInterface();
