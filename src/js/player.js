import Coin from './coin.js';
export default class Player {
    static FallAcceleration = 3000;
    static RunSpeed = 500;
    static FloatSpeed = 500;
    static JumpImpulse = 45000;
    static JumpHangScalar = 2;
    static HeadBounce = 0.25;
    static CoyoteTime = 0.0625;
    static Drag = 1.25;
    static AttractionRadius = 160;
    static CollectionRadius = 20;
    static JumpCushion = 5;
    static Width = 30;
    static Height = 50;
    x;
    y;
    previousX;
    previousY;
    interpolatedX;
    interpolatedY;
    vx = 0;
    vy = 0;
    falling = true;
    jumping = false;
    jumpFrame = 0;
    fallTime = 0.0;
    coins = 0;
    targetX = 0;
    targetY = 0;
    targetTheta = 0;
    constructor(x, y) {
        this.x = this.previousX = this.interpolatedX = x;
        this.y = this.previousY = this.interpolatedY = y;
    }
    get centerX() {
        return this.x + Player.Width / 2;
    }
    get centerY() {
        return this.y + Player.Height / 2;
    }
    target(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.targetTheta = Math.atan2(y - this.centerY, x - this.centerX);
    }
    interpolate(amount) {
        this.interpolatedX = this.previousX + (this.x - this.previousX) * amount;
        this.interpolatedY = this.previousY + (this.y - this.previousY) * amount;
    }
    penetrateRight(block) {
        return this.x < block.x && this.x + Player.Width > block.x && this.yOverlap(block);
    }
    penetrateLeft(block) {
        return this.x > block.x && this.x < block.x + block.w && this.yOverlap(block);
    }
    penetrateDown(block) {
        return this.y < block.y && this.y + Player.Height > block.y && this.xOverlap(block);
    }
    penetrateUp(block) {
        return this.y > block.y && this.y < block.y + block.h && this.xOverlap(block);
    }
    xOverlap(block) {
        return this.x + Player.Width > block.x && this.x < block.x + block.w;
    }
    yOverlap(block) {
        return this.y + Player.Height > block.y && this.y < block.y + block.h;
    }
    overlap(coin) {
        return this.x + Player.Width > coin.x - Coin.Radius
            && this.y + Player.Height > coin.y - Coin.Radius
            && this.x < coin.x + Coin.Radius
            && this.y < coin.y + Coin.Radius;
    }
    contactDown(block) {
        return this.y + Player.Height === block.y && this.xOverlap(block);
    }
    cushionedJump(blocks) {
        if (this.vy < 0)
            return false;
        for (const block of blocks) {
            if (this.xOverlap(block)
                && block.y >= this.y + Player.Height
                && block.y < this.y + Player.Height + Player.JumpCushion)
                return true;
        }
        return false;
    }
    beginJump(blocks) {
        const cushionedJump = this.cushionedJump(blocks);
        if (this.fallTime > Player.CoyoteTime
            && !cushionedJump)
            return;
        this.vy = 0; // Without resetting to zero we get a weak jump if the jump is cushioned
        this.jumping = true;
        this.jumpFrame = 1;
    }
    jump(deltaTime) {
        if (!this.jumping)
            return;
        const impulse = Player.JumpImpulse * Player.JumpHangScalar / (Player.JumpHangScalar + this.jumpFrame - 1);
        this.vy -= impulse * deltaTime;
        this.falling = true;
        this.jumpFrame++;
    }
    endJump() {
        this.jumping = false;
        this.jumpFrame = 0;
    }
    fallingOff(blocks) {
        for (const block of blocks) {
            if (this.contactDown(block))
                return false;
        }
        return true;
    }
    move(direction, deltaTime, blocks) {
        const speed = this.falling ? Player.FloatSpeed : Player.RunSpeed;
        this.vx = direction * speed;
        this.previousX = this.x;
        this.x += this.vx * deltaTime;
        if (!this.falling) {
            this.falling = this.fallingOff(blocks);
            if (this.falling) {
                this.fallTime = 0;
            }
        }
        else {
            this.fallTime += deltaTime;
        }
        for (const block of blocks) {
            switch (direction) {
                case 1:
                    if (!this.penetrateRight(block))
                        break;
                    this.x = block.x - Player.Width;
                    break;
                case -1:
                    if (!this.penetrateLeft(block))
                        break;
                    this.x = block.x + block.w;
                    break;
            }
        }
    }
    drag(deltaTime) {
        if (this.vy <= 0)
            return;
        this.vy -= this.vy * deltaTime * Player.Drag;
    }
    fall(deltaTime, blocks) {
        if (this.falling) {
            this.vy += Player.FallAcceleration * deltaTime;
        }
        this.drag(deltaTime);
        this.previousY = this.y;
        this.y += this.vy * deltaTime;
        for (const block of blocks) {
            if (this.penetrateDown(block)) {
                this.y = block.y - Player.Height;
                this.vy = 0;
                this.fallTime = 0;
                this.falling = false;
            }
            if (this.penetrateUp(block)) {
                this.y = block.y + block.h;
                this.vy *= Player.HeadBounce;
            }
        }
    }
    collect(coins) {
        for (let i = coins.length - 1; i >= 0; i--) {
            const coin = coins[i];
            const dx = coin.x - (this.x + Player.Width / 2);
            const dy = coin.y - (this.y + Player.Height / 2);
            const distanceSquared = dx * dx + dy * dy;
            if (distanceSquared > Player.AttractionRadius * Player.AttractionRadius)
                continue;
            if (distanceSquared > Player.CollectionRadius * Player.CollectionRadius) {
                coin.seeking = true;
                continue;
            }
            const jingle = new Audio('./res/sounds/coin.mp3');
            jingle.play();
            if (coin.evil) {
                this.coins--;
            }
            else {
                this.coins++;
            }
            coins.splice(i, 1);
        }
    }
}
