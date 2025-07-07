import Block from './rectangle.js'
import Coin from './coin.js'

export default class Player {
    static readonly FallAcceleration = 3000
    static readonly RunSpeed = 500
    static readonly FloatSpeed = 500
    static readonly JumpImpulse = 45000
    static readonly JumpHangScalar = 2
    static readonly HeadBounce = 0.25
    static readonly CoyoteTime = 0.0625
    static readonly Drag = 1.25
    static readonly AttractionRadius = 160
    static readonly CollectionRadius = 20
    static readonly JumpCushion = 5


    public static readonly Width = 30
    public static readonly Height = 50

    public x: number
    public y: number
    public previousX: number
    public previousY: number

    public vx = 0
    public vy = 0
    public falling = true
    public jumping = false
    public jumpFrame = 0
    public fallTime = 0.0
    public coins = 0

    constructor(x: number, y: number) {
        this.x = this.previousX = x
        this.y = this.previousY = y
    }

    interpolatedX(interpolation: number) {
        return this.previousX + (this.x - this.previousX) * interpolation
    }
    interpolatedY(interpolation: number) {
        return this.previousY + (this.y - this.previousY) * interpolation
    }


    penetrateRight(block:Block) {
        return this.x < block.x && this.x + Player.Width > block.x && this.yOverlap(block)
    }
    penetrateLeft(block:Block) {
        return this.x > block.x && this.x < block.x + block.w && this.yOverlap(block)
    }
    penetrateDown(block:Block) {
        return this.y < block.y && this.y + Player.Height > block.y && this.xOverlap(block)
    }
    penetrateUp(block:Block) {
        return this.y > block.y && this.y < block.y + block.h && this.xOverlap(block)
    }

    xOverlap(block: Block) {
        return this.x + Player.Width > block.x && this.x < block.x + block.w
    }
    yOverlap(block: Block) {
        return this.y + Player.Height > block.y && this.y < block.y + block.h
    }
    overlap(coin: Coin) {
        return this.x + Player.Width > coin.x - Coin.Radius
            && this.y + Player.Height > coin.y - Coin.Radius
            && this.x < coin.x + Coin.Radius
            && this.y < coin.y + Coin.Radius
    }

    contactDown(block: Block) {
        return this.y + Player.Height === block.y && this.xOverlap(block)
    }


    cushionedJump(blocks: Block[]) {
        if (this.vy < 0) return false

        for (const block of blocks) {
            if (this.xOverlap(block) 
                && block.y >= this.y + Player.Height
                && block.y < this.y + Player.Height + Player.JumpCushion) return true
        }
        return false
    }
    beginJump(blocks: Block[]) {
        const cushionedJump = this.cushionedJump(blocks)
        if (this.fallTime > Player.CoyoteTime
            && !cushionedJump
        ) return

        this.vy = 0 // Without resetting to zero we get a weak jump if the jump is cushioned
        this.jumping = true
        this.jumpFrame = 1
    }
    jump(deltaTime: number) {
        if (!this.jumping) return

        const impulse = Player.JumpImpulse * Player.JumpHangScalar / (Player.JumpHangScalar + this.jumpFrame - 1)
        this.vy -= impulse * deltaTime
        this.falling = true
        this.jumpFrame++
    }
    endJump() {
        this.jumping = false
        this.jumpFrame = 0
    }

    fallingOff(blocks: Block[]) {
        for (const block of blocks) {
            if (this.contactDown(block)) return false
        }
        return true
    }

    move(direction: number, deltaTime: number, blocks: Block[]) {
        const speed = this.falling ? Player.FloatSpeed : Player.RunSpeed
        this.vx = direction * speed * deltaTime
        this.previousX = this.x
        this.x += this.vx

        if (!this.falling) {
            this.falling = this.fallingOff(blocks)
            if (this.falling) {
                this.fallTime = 0
            }
        } else {
            this.fallTime += deltaTime
        }

        for (const block of blocks) {
            switch (direction) {
                case 1:
                    if (!this.penetrateRight(block)) break

                    this.x = block.x - Player.Width
                break
                case -1:
                    if (!this.penetrateLeft(block)) break

                    this.x = block.x + block.w
                break
            }
        }
    }

    drag(deltaTime: number) {
        if (this.vy <= 0) return

        this.vy -= this.vy * deltaTime * Player.Drag
    }

    fall(deltaTime: number, blocks: Block[]) {
        if (this.falling) {
            this.vy += Player.FallAcceleration * deltaTime
        }
        this.drag(deltaTime)

        this.previousY = this.y
        this.y += this.vy * deltaTime

        for (const block of blocks) {
            if (this.penetrateDown(block)) {
                this.y = block.y - Player.Height
                this.vy = 0
                this.fallTime = 0
                this.falling = false
            }
            if (this.penetrateUp(block)) {
                this.y = block.y + block.h
                this.vy *= Player.HeadBounce
            }
        }
    }

    collect(coins: Coin[]) {
        for (let i = coins.length - 1; i >= 0; i--) {
            const coin = coins[i]
            const dx = coin.x - (this.x + Player.Width / 2)
            const dy = coin.y - (this.y + Player.Height / 2)
            const distanceSquared = dx * dx + dy * dy
            if (distanceSquared > Player.AttractionRadius * Player.AttractionRadius) continue

            if (distanceSquared > Player.CollectionRadius * Player.CollectionRadius) {
                coin.seeking = true
                continue
            }

            const jingle = new Audio('./res/sounds/coin.mp3')
            jingle.play()

            if (coin.evil) {
                this.coins--
            } else {
                this.coins++
            }
            
            coins.splice(i, 1)
        }
    }
}