class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static random() {
        const res = new Vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        return res.normalize();
    }

    dot(v1) {
        return this.x * v1.x + this.y * v1.y + this.z * v1.z;
    }

    add(v1) {
        return new Vec3(this.x + v1.x, this.y + v1.y, this.z + v1.z);
    }

    sub(v1) {
        return new Vec3(this.x - v1.x, this.y - v1.y, this.z - v1.z);
    }

    scale(s) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }

    norm() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
    }

    normSquared() {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);
    }

    normalize() {
        return this.scale(1 / this.norm());
    }

    cross(v1) {
        return new Vec3(
            this.y * v1.z - this.z * v1.y,
            this.z * v1.x - this.x * v1.z,
            this.x * v1.y - this.y * v1.x,
        );
    }

    maxAbs() {
        const x = Math.abs(this.x);
        const y = Math.abs(this.y);
        const z = Math.abs(this.z);
        return Math.max(Math.max(x, y), z);
    }
}
