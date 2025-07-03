export default class Coin {
    static readonly Radius = 10
    static readonly Diameter = Coin.Radius * 2
    static readonly SeekSpeed = 10
    static readonly Drag = 3

    public x: number
    public y: number
    public previousX: number
    public previousY: number
    public vx = 0
    public vy = 0
    public seeking = false
    public evil: boolean


    constructor(x: number, y: number, evil: boolean) {
        this.x = this.previousX = x
        this.y = this.previousY = y
        this.evil = evil
    }

    interpolatedX(interpolation: number) {
        return this.previousX + (this.x - this.previousX) * interpolation
    }
    interpolatedY(interpolation: number) {
        return this.previousY + (this.y - this.previousY) * interpolation
    }

    drag(deltaTime: number) {
        this.vx -= this.vx * deltaTime * Coin.Drag
        this.vy -= this.vy * deltaTime * Coin.Drag
    }

    seek(x: number, y: number, deltaTime: number) {
        if (!this.seeking) return

        const theta = Math.atan2(y - this.y, x - this.x)
        this.vx += Math.cos(theta) * deltaTime * Coin.SeekSpeed
        this.vy += Math.sin(theta) * deltaTime * Coin.SeekSpeed

        this.drag(deltaTime)

        this.previousX = this.x
        this.previousY = this.y

        this.x += this.vx
        this.y += this.vy
    }
}