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

    orthoBasis() {
        let basis1;
        if (Math.abs(this.x) > Math.abs(this.y)) {
            basis1 = new Vec3(-this.z, 0, this.x);
        } else {
            basis1 = new Vec3(0, -this.z, this.y);
        }
        basis1 = basis1.normalize();

        const basis2 = this.cross(basis1).normalize();
        return [basis1, basis2];
    }
}

class Mat3 {
    constructor(data) {
        this.data = data;
    }

    static identity() {
        return new Mat3([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }

    static rotation(axis, angle) {
        const [b1, b2] = axis.orthoBasis();
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const basisMatrix = new Mat3([
            axis.x, axis.y, axis.z,
            b1.x, b1.y, b1.z,
            b2.x, b2.y, b2.z,
        ]);
        const basisRotation = new Mat3([
            1, 0, 0,
            0, cos, -sin,
            0, sin, cos,
        ]);
        return basisMatrix.transpose().mul(basisRotation).mul(basisMatrix);
    }

    mul(m1) {
        const data = [];
        for (let i = 0; i < 3; i++) {
            const row = this.row(i);
            for (let j = 0; j < 3; j++) {
                data.push(row.dot(m1.col(j)));
            }
        }
        return new Mat3(data);
    }

    apply(v) {
        return new Vec3(this.row(0).dot(v), this.row(1).dot(v), this.row(2).dot(v));
    }

    transpose() {
        return new Mat3([
            this.data[0], this.data[3], this.data[6],
            this.data[1], this.data[4], this.data[7],
            this.data[2], this.data[5], this.data[8],
        ]);
    }

    row(idx) {
        const i = idx * 3;
        return new Vec3(this.data[i], this.data[i + 1], this.data[i + 2]);
    }

    col(idx) {
        return new Vec3(this.data[idx], this.data[idx + 3], this.data[idx + 6]);
    }
}
