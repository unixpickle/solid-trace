class UserInterface {
    constructor() {
        this.solidCode = document.getElementById('solid-code');
        this.renderButton = document.getElementById('render-button');
        this.canvas = document.getElementById('rendering');

        this.renderButton.addEventListener('click', () => this.render());

        this.rayTracer = null;
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
