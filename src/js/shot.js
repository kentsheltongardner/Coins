export default class Shot {
    static Width = 4;
    static Length = 16;
    static Speed = 2100;
    x;
    y;
    vx;
    vy;
    previousX;
    previousY;
    interpolatedX;
    interpolatedY;
    theta;
    constructor(player) {
        this.x = this.previousX = this.interpolatedX = player.centerX;
        this.y = this.previousY = this.interpolatedY = player.centerY;
        this.vx = Math.cos(player.targetTheta) * Shot.Speed + player.vx;
        this.vy = Math.sin(player.targetTheta) * Shot.Speed + player.vy;
        this.theta = Math.atan2(this.vy, this.vx);
        //this.theta = player.targetTheta
    }
    interpolate(amount) {
        this.interpolatedX = this.previousX + (this.x - this.previousX) * amount;
        this.interpolatedY = this.previousY + (this.y - this.previousY) * amount;
    }
    update(deltaTime) {
        this.previousX = this.x;
        this.previousY = this.y;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }
}
