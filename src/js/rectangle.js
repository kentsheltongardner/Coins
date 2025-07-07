import Floor from './floor.js';
import Wall from './wall.js';
export default class Rectangle {
    x;
    y;
    w;
    h;
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    contains(point) {
        return point.x >= this.x
            && point.y >= this.y
            && point.x <= this.x + this.w
            && point.y <= this.y + this.h;
    }
    overlap(other) {
        return this.x < other.x + other.w
            && this.x + this.w > other.x
            && this.y < other.y + other.h
            && this.y + this.h > other.y;
    }
    get right() { return this.x + this.w; }
    get bottom() { return this.y + this.h; }
    get left() { return this.x; }
    get top() { return this.y; }
    get cornerBottomRight() { return { x: this.right, y: this.bottom }; }
    get cornerBottomLeft() { return { x: this.left, y: this.bottom }; }
    get cornerTopLeft() { return { x: this.left, y: this.top }; }
    get cornerTopRight() { return { x: this.right, y: this.top }; }
    get floorBottom() { return new Floor(this.bottom, this.left, this.right); }
    get floorTop() { return new Floor(this.top, this.left, this.right); }
    get wallRight() { return new Wall(this.right, this.top, this.bottom); }
    get wallLeft() { return new Wall(this.left, this.top, this.bottom); }
}
