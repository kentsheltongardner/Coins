import Rectangle from './rectangle.js'

export default class Camera {
    static readonly TrackingSpeed = 10.0

    //public zoom: number
    public x: number
    public y: number
    public previousX: number
    public previousY: number


    constructor(x: number, y: number) {
        //this.zoom = 1
        this.x = this.previousX = x
        this.y = this.previousY = y
    }

    track(x: number, y: number, deltaTime: number) {
        const dx = x - this.x
        const dy = y - this.y

        this.previousX = this.x
        this.previousY = this.y

        this.x += dx * Camera.TrackingSpeed * deltaTime
        this.y += dy * Camera.TrackingSpeed * deltaTime
    }

    interpolatedX(interpolation: number) {
        return this.previousX + (this.x - this.previousX) * interpolation
    }
    interpolatedY(interpolation: number) {
        return this.previousY + (this.y - this.previousY) * interpolation
    }

    displayRectangle(interpolation: number) {
        const w = window.innerWidth
        const h = window.innerHeight
        const x = this.interpolatedX(interpolation) - w / 2
        const y = this.interpolatedY(interpolation) - h / 2

        return new Rectangle(x, y, w, h)
    }
}