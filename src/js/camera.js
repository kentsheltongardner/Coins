export default class Camera {
    static TrackingSpeed = 10.0;
    //public zoom: number
    x;
    y;
    previousX;
    previousY;
    constructor(x, y) {
        //this.zoom = 1
        this.x = this.previousX = x;
        this.y = this.previousY = y;
    }
    track(x, y, deltaTime) {
        const dx = x - this.x;
        const dy = y - this.y;
        this.previousX = this.x;
        this.previousY = this.y;
        this.x += dx * Camera.TrackingSpeed * deltaTime;
        this.y += dy * Camera.TrackingSpeed * deltaTime;
    }
    interpolatedX(interpolation) {
        return this.previousX + (this.x - this.previousX) * interpolation;
    }
    interpolatedY(interpolation) {
        return this.previousY + (this.y - this.previousY) * interpolation;
    }
}
