class UserInterface {
    constructor() {
        this.solidCode = document.getElementById('solid-code');
        this.renderButton = document.getElementById('render-button');
        this.canvas = document.getElementById('rendering');
        this.rayTracer = null;
        this.rotationMatrix = Mat3.identity();

        this.renderButton.addEventListener('click', () => this.render());

        this._setupMouseEvents();
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
