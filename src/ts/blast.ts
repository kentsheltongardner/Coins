export default class Blast {

    static readonly Radius = 40
    static readonly Lifetime = 0.1

    public x: number
    public y: number
    public age: number
    public previousAge: number
    public interpolatedAge: number

    constructor(x: number, y: number) {
        this.age = this.previousAge = this.interpolatedAge = 0
        this.x = x
        this.y = y
    }

    interpolate(amount: number) {
        this.interpolatedAge = this.previousAge + (this.age - this.previousAge) * amount
    }

    update(deltaTime: number) {
        this.age += deltaTime
    }

    expired() {
        return this.age > Blast.Lifetime
    }
}