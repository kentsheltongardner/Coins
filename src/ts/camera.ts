import Rectangle from './rectangle.js'

const ZoomMin = 3
const ZoomMax = 7

export default class Camera {
    static readonly TrackingSpeed = 10.0

    public zoom = 4
    public zoomScalar: number

    public x: number
    public y: number
    public previousX: number
    public previousY: number
    public interpolatedX: number
    public interpolatedY: number


    constructor(x: number, y: number) {
        this.x = this.previousX = this.interpolatedX = x
        this.y = this.previousY = this.interpolatedY = y
        this.zoomScalar = this.calculatedZoom()
    }

    track(x: number, y: number, deltaTime: number) {
        const dx = x - this.x
        const dy = y - this.y

        this.previousX = this.x
        this.previousY = this.y

        this.x += dx * Camera.TrackingSpeed * deltaTime
        this.y += dy * Camera.TrackingSpeed * deltaTime
    }

    interpolate(amount: number) {
        this.interpolatedX = this.previousX + (this.x - this.previousX) * amount
        this.interpolatedY = this.previousY + (this.y - this.previousY) * amount
    }

    displayRectangle() {
        const w = this.gameScale(window.innerWidth)
        const h = this.gameScale(window.innerHeight)
        const x = this.interpolatedX - w / 2
        const y = this.interpolatedY - h / 2

        return new Rectangle(x, y, w, h)
    }

    zoomIn() {
        if (this.zoom === ZoomMax) return

        this.zoom++
        this.zoomScalar = this.calculatedZoom()
    }
    zoomOut() {
        if (this.zoom === ZoomMin) return

        this.zoom--
        this.zoomScalar = this.calculatedZoom()
    }
    calculatedZoom() {
        return this.zoom * this.zoom / 16
    }

    displayScale(n: number) {
        return n * this.zoomScalar
    }
    displayX(gameX: number) {
        return window.innerWidth / 2 + (gameX - this.x) * this.zoomScalar
    }
    displayY(gameY: number) {
        return window.innerHeight / 2 + (gameY - this.y) * this.zoomScalar
    }
    interpolatedDisplayX(gameX: number) {
        return window.innerWidth / 2 + (gameX - this.interpolatedX) * this.zoomScalar
    }
    interpolatedDisplayY(gameY: number) {
        return window.innerHeight / 2 + (gameY - this.interpolatedY) * this.zoomScalar
    }


    gameScale(n: number) {
        return n / this.zoomScalar
    }
    gameX(displayX: number) {
        return this.x + (displayX - window.innerWidth / 2) / this.zoomScalar
    }
    gameY(displayY: number) {
        return this.y + (displayY - window.innerHeight / 2) / this.zoomScalar
    }
}