export default class Coin {
    static Radius = 10;
    static Diameter = Coin.Radius * 2;
    static SeekSpeed = 10;
    static Drag = 3;
    x;
    y;
    previousX;
    previousY;
    vx = 0;
    vy = 0;
    seeking = false;
    evil;
    constructor(x, y, evil) {
        this.x = this.previousX = x;
        this.y = this.previousY = y;
        this.evil = evil;
    }
    interpolatedX(interpolation) {
        return this.previousX + (this.x - this.previousX) * interpolation;
    }
    interpolatedY(interpolation) {
        return this.previousY + (this.y - this.previousY) * interpolation;
    }
    drag(deltaTime) {
        this.vx -= this.vx * deltaTime * Coin.Drag;
        this.vy -= this.vy * deltaTime * Coin.Drag;
    }
    seek(x, y, deltaTime) {
        if (!this.seeking)
            return;
        const theta = Math.atan2(y - this.y, x - this.x);
        this.vx += Math.cos(theta) * deltaTime * Coin.SeekSpeed;
        this.vy += Math.sin(theta) * deltaTime * Coin.SeekSpeed;
        this.drag(deltaTime);
        this.previousX = this.x;
        this.previousY = this.y;
        this.x += this.vx;
        this.y += this.vy;
    }
}
