export default class Blast {
    static Radius = 40;
    static Lifetime = 0.1;
    x;
    y;
    age;
    previousAge;
    interpolatedAge;
    constructor(x, y) {
        this.age = this.previousAge = this.interpolatedAge = 0;
        this.x = x;
        this.y = y;
    }
    interpolate(amount) {
        this.interpolatedAge = this.previousAge + (this.age - this.previousAge) * amount;
    }
    update(deltaTime) {
        this.age += deltaTime;
    }
    expired() {
        return this.age > Blast.Lifetime;
    }
}
