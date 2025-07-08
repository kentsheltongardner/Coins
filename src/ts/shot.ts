import Player from './player.js'

export default class Shot {
    public static readonly Width = 4
    public static readonly Length = 16
    public static readonly Speed = 2100

    public x: number
    public y: number
    public vx: number
    public vy: number
    public previousX: number
    public previousY: number
    public interpolatedX: number
    public interpolatedY: number
    public theta: number

    constructor(player: Player) {
        this.x = this.previousX = this.interpolatedX = player.centerX
        this.y = this.previousY = this.interpolatedY = player.centerY
        this.vx = Math.cos(player.targetTheta) * Shot.Speed + player.vx
        this.vy = Math.sin(player.targetTheta) * Shot.Speed + player.vy
        this.theta = Math.atan2(this.vy, this.vx)
        //this.theta = player.targetTheta
    }

    interpolate(amount: number) {
        this.interpolatedX = this.previousX + (this.x - this.previousX) * amount
        this.interpolatedY = this.previousY + (this.y - this.previousY) * amount
    }

    update(deltaTime: number) {
        this.previousX = this.x
        this.previousY = this.y

        this.x += this.vx * deltaTime
        this.y += this.vy * deltaTime
    }
}