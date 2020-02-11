const BISECTION_COUNT = 32;

class RayTracer {
    constructor(canvas, solidFunc, epsilon, normalEpsilon, originY, solidRadius) {
        this.canvas = canvas;
        this.solidFunc = solidFunc;
        this.epsilon = epsilon;
        this.normalEpsilon = normalEpsilon;
        this.originY = originY || -3;
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
    }

    render() {
        const ctx = this.canvas.getContext('2d');
        const data = ctx.createImageData(this.width, this.height);
        this.pixels.forEach((coord) => {
            const idx = 4 * (coord[1] * this.width + coord[0]);
            data.data[idx + 3] = 255;

            const ray = this._pixelCoordToRay(coord[0], coord[1]);
            const point = this._rayCollision(ray);
            if (!point) {
                return;
            }
            const normal = this._surfaceNormal(point);
            const lightDirection = normalizeVector(subVector(point, ray.origin));
            const brightness = Math.max(0, -Math.round(255 * dot(normal, lightDirection)));
            for (let i = 0; i < 3; i++) {
                data.data[idx + i] = brightness;
            }
        });
        ctx.putImageData(data, 0, 0);
    }

    _pixelCoordToRay(x, y) {
        const divider = Math.max(this.width, this.height) / 2;
        const xDist = (x - this.width / 2) / divider;
        const zDist = (y - this.height / 2) / divider;
        return new Ray([0, this.originY, 0], [xDist, 1, zDist]);
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
        const b = 2 * dot(ray.origin, ray.direction)
        const c = dot(ray.origin, ray.origin) - Math.pow(this.solidRadius, 2);
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
            const normed = scaleVector(d, this.normalEpsilon / vectorNorm(d));
            const p1 = addVectors(point, normed);
            if (!this._contains(p1)) {
                return true;
            } else {
                return false;
            }
        }
        const axes = [null, null].map(() => {
            let v1 = randomVector();
            let v2 = randomVector();
            if (!checkDirection(v1)) {
                v1 = scaleVector(v1, -1);
            }
            if (checkDirection(v2)) {
                v2 = scaleVector(v2, -1);
            }
            for (let i = 0; i < BISECTION_COUNT; i++) {
                let mp = normalizeVector(addVectors(v1, v2));
                if (checkDirection(mp)) {
                    v1 = mp;
                } else {
                    v2 = mp;
                }
            }
            return normalizeVector(addVectors(v1, v2));
        });
        const res = normalizeVector(crossProduct(axes[0], axes[1]));
        if (!checkDirection(res)) {
            return scaleVector(res, -1);
        }
        return res;
    }

    _contains(coord) {
        return vectorNorm(coord) < this.solidRadius &&
            this.solidFunc(coord[0], coord[1], coord[2]);
    }
}

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = normalizeVector(direction);
    }

    point(t) {
        return addVectors(this.origin, scaleVector(this.direction, t));
    }
}

function vectorNorm(v) {
    let res = 0;
    v.forEach((x) => res += Math.pow(x, 2));
    return Math.sqrt(res);
}

function scaleVector(v, s) {
    return v.map((x) => x * s);
}

function addVectors(v1, v2) {
    return v1.map((x, i) => x + v2[i]);
}

function subVector(v1, v2) {
    return addVectors(v1, scaleVector(v2, -1));
}

function normalizeVector(v) {
    return scaleVector(v, 1 / vectorNorm(v));
}

function dot(v1, v2) {
    let res = 0;
    v1.forEach((x, i) => res += x * v2[i]);
    return res;
}

function randomVector() {
    const res = [null, null, null].map(() => Math.random() * 2 - 1);
    return normalizeVector(res);
}

function crossProduct(v, v1) {
    return [
        v[1] * v1[2] - v[2] * v1[1],
        v[2] * v1[0] - v[0] * v1[2],
        v[0] * v1[1] - v[1] * v1[0]
    ];
}
