const BISECTION_COUNT = 32;
const FAST_RENDER_SUBSAMPLE = 5;
const RENDER_INTERVAL = 30;
const RENDER_CPU = 0.5;
const TIME_CHECK_INTERVAL = 100;
const AMBIENT_LIGHT = 20;

class RayTracer {
    constructor(canvas, solidFunc, epsilon, normalEpsilon, originY, solidRadius) {
        this.canvas = canvas;
        this.solidFunc = solidFunc;
        this.epsilon = epsilon;
        this.normalEpsilon = normalEpsilon;
        this.originY = originY || -2.7;
        this.solidRadius = solidRadius || Math.sqrt(3);

        this.width = canvas.width;
        this.height = canvas.height;

        // Render the pixels in a random order.
        this.pixels = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.pixels.push([i, j]);
            }
        }
        for (let i = 0; i < this.pixels.length; ++i) {
            const j = i + Math.floor(Math.random() * (this.pixels.length - i - 1e-8));
            const backup = this.pixels[i];
            this.pixels[i] = this.pixels[j]
            this.pixels[j] = backup;
        }

        this.renderInterval = null;
    }

    renderFast() {
        const ctx = this.canvas.getContext('2d');
        const data = ctx.createImageData(this.width, this.height);
        for (let i = 0; i < this.height; i += FAST_RENDER_SUBSAMPLE) {
            for (let j = 0; j < this.width; j += FAST_RENDER_SUBSAMPLE) {
                const ray = this._pixelCoordToRay(j + FAST_RENDER_SUBSAMPLE / 2,
                    i + FAST_RENDER_SUBSAMPLE / 2);
                const brightness = this._rayBrightness(ray);
                for (let y = 0; y < FAST_RENDER_SUBSAMPLE; y++) {
                    for (let x = 0; x < FAST_RENDER_SUBSAMPLE; x++) {
                        const idx = 4 * (x + j + (y + i) * this.width);
                        data.data[idx + 3] = 255;
                        for (let i = 0; i < 3; i++) {
                            data.data[idx + i] = brightness;
                        }
                    }
                }
            }
        }
        ctx.putImageData(data, 0, 0);
    }

    render() {
        this.cancel();
        let pixelIdx = 0;
        this.renderInterval = setInterval(() => {
            const startTime = new Date().getTime();
            const ctx = this.canvas.getContext('2d');
            const data = ctx.getImageData(0, 0, this.width, this.height);
            while (pixelIdx < this.pixels.length) {
                const coord = this.pixels[pixelIdx];
                const ray = this._pixelCoordToRay(coord[0], coord[1]);
                const brightness = this._rayBrightness(ray);
                const idx = 4 * (coord[0] + coord[1] * this.width);
                data.data[idx + 3] = 255;
                for (let i = 0; i < 3; i++) {
                    data.data[idx + i] = brightness;
                }
                pixelIdx++;

                // Prevent too much blocking of the main thread.
                if (pixelIdx % TIME_CHECK_INTERVAL === 0) {
                    if (new Date().getTime() - startTime > RENDER_INTERVAL * RENDER_CPU) {
                        break;
                    }
                }
            }
            if (pixelIdx === this.pixels.length) {
                clearInterval(this.renderInterval);
            }
            ctx.putImageData(data, 0, 0);
        }, this.renderInterval);
    }

    cancel() {
        if (this.renderInterval !== null) {
            clearInterval(this.renderInterval);
            this.renderInterval = null;
        }
    }

    _pixelCoordToRay(x, y) {
        const divider = Math.max(this.width, this.height) / 2;
        const xDist = (x - this.width / 2) / divider;
        const zDist = (y - this.height / 2) / divider;
        return new Ray(new Vec3(0, this.originY, 0), new Vec3(xDist, 1, zDist));
    }

    _rayBrightness(ray) {
        const point = this._rayCollision(ray);
        if (!point) {
            return 0;
        }
        const normal = this._surfaceNormal(point);
        const lightDirection = point.sub(ray.origin).normalize();
        const rawBrightness = 255 * -normal.dot(lightDirection) + AMBIENT_LIGHT;
        return Math.min(Math.max(0, Math.round(rawBrightness)), 255)
    }

    _rayCollision(ray) {
        // We hit the sphere at times t where:
        // c = center of sphere (0)
        // o = origin of ray
        // d = direction of ray, unit vector
        // ||c - (o + d*t)||^2 = r^2
        // ||o + d*t||^2 = r^2
        // ||o||^2 + ||d||^2*t^2 + 2*o*d*t - r^2 = 0
        // ||o||^2 + *t^2 + 2*o*d*t - r^2 = 0
        // Which is a quadratic equation:
        // a=1, b=2*o*d, c=||o||^2-r^2
        const b = 2 * ray.origin.dot(ray.direction);
        const c = ray.origin.normSquared() - Math.pow(this.solidRadius, 2);
        if (4 * c > b * b) {
            // No collision.
            return null;
        }
        const t1 = (-b - Math.sqrt(b * b - 4 * c)) / 2;
        const t2 = (-b + Math.sqrt(b * b - 4 * c)) / 2;
        for (let t = t1; t < t2; t += this.epsilon) {
            if (!this._contains(ray.point(t))) {
                continue;
            }
            let startT = t - this.epsilon;
            let endT = t;
            for (let i = 0; i < BISECTION_COUNT; i++) {
                const midT = (startT + endT) / 2;
                if (this._contains(ray.point(midT))) {
                    endT = midT;
                } else {
                    startT = midT;
                }
            }
            const p = ray.point((startT + endT) / 2);
            return ray.point((startT + endT) / 2);
        }
        return null;
    }

    _surfaceNormal(point) {
        const checkDirection = (d) => {
            const normed = d.scale(this.normalEpsilon / d.norm());
            const p1 = point.add(normed);
            if (!this._contains(p1)) {
                return true;
            } else {
                return false;
            }
        }
        const axes = [null, null].map(() => {
            let v1 = Vec3.random();
            let v2 = Vec3.random();
            if (!checkDirection(v1)) {
                v1 = v1.scale(-1);
            }
            if (checkDirection(v2)) {
                v2 = v2.scale(-1);
            }
            for (let i = 0; i < BISECTION_COUNT; i++) {
                let mp = v1.add(v2).normalize();
                if (checkDirection(mp)) {
                    v1 = mp;
                } else {
                    v2 = mp;
                }
            }
            return v1.add(v2).normalize();
        });
        const res = axes[0].cross(axes[1]).normalize();
        if (!checkDirection(res)) {
            return res.scale(-1);
        }
        return res;
    }

    _contains(coord) {
        return coord.norm() < this.solidRadius && this.solidFunc(coord);
    }
}

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction.normalize();
    }

    point(t) {
        return this.origin.add(this.direction.scale(t));
    }
}
