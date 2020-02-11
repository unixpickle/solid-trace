class UserInterface {
    constructor() {
        this.solidCode = document.getElementById('solid-code');
        this.canvas = document.getElementById('rendering');

        this.solidCode.addEventListener('change', () => {
            const func = eval(this.solidCode.value);
            const rt = new RayTracer(this.canvas, func, 0.01, 0.00001);
            rt.render();
        });
    }
}

new UserInterface();
