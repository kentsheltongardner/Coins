export default class Coin {
    static readonly Radius = 7
    static readonly Diameter = Coin.Radius * 2
    static readonly SeekSpeed = 10
    static readonly Drag = 3

    public x: number
    public y: number
    public previousX: number
    public previousY: number
    public interpolatedX: number
    public interpolatedY: number
    public vx = 0
    public vy = 0
    public seeking = false
    public evil: boolean


    constructor(x: number, y: number, evil: boolean) {
        this.x = this.previousX = this.interpolatedX = x
        this.y = this.previousY = this.interpolatedY = y
        this.evil = evil
    }

    interpolate(amount: number) {
        this.interpolatedX = this.previousX + (this.x - this.previousX) * amount
        this.interpolatedY = this.previousY + (this.y - this.previousY) * amount
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