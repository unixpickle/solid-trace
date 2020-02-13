class UserInterface {
    constructor() {
        this.exampleSelect = document.getElementById('example-select');
        this.solidCode = document.getElementById('solid-code');
        this.renderButton = document.getElementById('render-button');
        this.canvas = document.getElementById('rendering');
        this.rayTracer = null;
        this.solidFunc = (x, y, z) => false;
        this.rotationMatrix = Mat3.identity();

        this.exampleSelect.addEventListener('change', () => this.showExample());
        this.renderButton.addEventListener('click', () => this.updateCode());

        this._setupMouseEvents();
        this._setupTouchEvents();

        this.showExample();
    }

    updateCode() {
        const code = this.solidCode.value;
        // Using Function instead of eval is more performant,
        // since it runs code in the global scope.
        try {
            const solidFunc = new Function(code)();

            // Do a little fuzzing to make sure the function
            // is valid.
            solidFunc(0, 0, 0);
            solidFunc(0.5, -0.5, 1);

            this.solidFunc = solidFunc;
        } catch (e) {
            alert('Code error: ' + e);
            return;
        }
        this.render();
    }

    render() {
        if (this.rayTracer !== null) {
            this.rayTracer.cancel();
        }
        const solidFunc = (v) => {
            const v1 = this.rotationMatrix.transpose().apply(v);
            if (v1.maxAbs() > 1) {
                return false;
            }
            return this.solidFunc(v1.x, v1.y, v1.z);
        };
        this.rayTracer = new RayTracer(this.canvas, solidFunc, 0.01, 0.00001);
        this.rayTracer.renderFast();
        this.rayTracer.render();
    }

    showExample() {
        const name = this.exampleSelect.value;
        this.solidCode.value = EXAMPLE_CODES[name];
        this.updateCode();
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
