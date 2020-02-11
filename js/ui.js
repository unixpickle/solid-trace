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
        }
        this.solidCode.value = codes[name];
        this.render();
    }

    _setupMouseEvents() {
        const eventCoord = (e) => {
            const bounds = this.canvas.getBoundingClientRect();
            return [e.clientX - bounds.left, e.clientY - bounds.top];
        }
        this.canvas.addEventListener('mousedown', (e) => {
            const startCoord = eventCoord(e);
            const startRotation = this.rotationMatrix;

            let moveHandler, upHandler;
            const cancelEvents = () => {
                window.removeEventListener('mousemove', moveHandler);
                window.removeEventListener('mouseup', upHandler);
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
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);
        })
    }
}

new UserInterface();
