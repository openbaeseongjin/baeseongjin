export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    scale(value) {
        this.x *= value;
        this.y *= value;
        return this;
    }
    length() {
        return Math.hypot(this.x, this.y);
    }
    isFinite() {
        return Number.isFinite(this.x) && Number.isFinite(this.y);
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
}
