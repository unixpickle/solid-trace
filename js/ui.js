class UserInterface {
    constructor() {
        this.solidCode = document.getElementById('solid-code');
        this.canvas = document.getElementById('rendering');
        this.rayTracer = null;

        this.solidCode.addEventListener('change', () => {
            this.render();
        });
    }

    render() {
        if (this.rayTracer !== null) {
            this.rayTracer.cancel();
        }
        const func = eval(this.solidCode.value);
        this.rayTracer = new RayTracer(this.canvas, func, 0.01, 0.00001);
        this.rayTracer.renderFast();
        this.rayTracer.render();
    }
}

new UserInterface();
