import Block from './block.js'
import Camera from './camera.js'
import Coin from './coin.js'
import Player from './player.js'
import Point from './point.js'

const Tau = Math.PI * 2
const BorderThickness = 4
const BorderRadius = 6

export default class Game {

    static readonly UpdateStep = 1 / 240

    public player = new Player(50, -2000)
    public blocks = new Array<Block>()
    public coins = new Array<Coin>()
    public canvas = <HTMLCanvasElement>document.getElementById('game-canvas')!
    public context = this.canvas.getContext('2d')!
    public mousePosition = new Point(0, 0)
    public camera = new Camera(this.player.x, this.player.y)

    public leftMousePressed = false
    public rightMousePressed = false
    public leftPressed = false
    public rightPressed = false
    public upPressed = false
    public downPressed = false
    public jumpPressed = false
    public lookPressed = false

    public lastTime = 0
    public accumulator = 0
    public sounds = false

    constructor() {
        this.blocks.push(new Block(0, 300, 200, 200))
        this.blocks.push(new Block(200, 200, 200, 200))
        this.blocks.push(new Block(-300, 550, 400, 100))
        this.blocks.push(new Block(-10000, 10500, 20000, 100))
        this.generateBlocks()
        this.generateCoins()

        window.addEventListener('mousedown', e => this.mouseDown(e))
        window.addEventListener('mousemove', e => this.mouseMove(e))
        window.addEventListener('mouseup', e => this.mouseUp(e))
        window.addEventListener('mouseleave', () => this.mouseLeave())
        window.addEventListener('keydown', e => this.keyDown(e))
        window.addEventListener('keyup', e => this.keyUp(e))
        window.addEventListener('wheel', e => this.mouseWheel(e))
        window.addEventListener('resize', () => this.resize())

        this.resize()
        requestAnimationFrame(time => this.loop(time)) 
    }

    generateBlocks() {
        for (let i = 0; i < 1000; i++) {
            const x = Math.floor(Math.random() * 10000) - 5000
            const y = Math.floor(Math.random() * 10000)
            const w = Math.floor(Math.random() * 600) + 50
            const h = Math.floor(Math.random() * 200) + 50
            this.blocks.push(new Block(x, y, w, h))
        }

        const count = 10500 / 250
        for (let i = 0; i < count; i++) {
            const x = 5500 + (i & 1) * 50
            const y = i * 250
            const w = 200
            const h = 20
            this.blocks.push(new Block(x, y, w, h))
            this.blocks.push(new Block(-x, y, w, h))
        }
    }
    generateCoins() {
        for (let i = 0; i < 500; i++) {
            const x = Math.floor(Math.random() * 10000) - 5000
            const y = Math.floor(Math.random() * 10000)
            this.coins.push(new Coin(x, y, Math.random() < 0.5))
        }
    }

    startSounds() {
        const ambience = new Audio('./res/sounds/ambience.mp3')
        ambience.loop = true
        ambience.play()
        this.sounds = true
    }

    mouseDown(e: MouseEvent) {
        if (!this.sounds) {
            this.startSounds()
        }

        switch (e.button) {
            case 0:
                this.leftMousePressed = true
            break
            case 2:
                this.rightMousePressed = true
            break
        }
    }
    mouseMove(e: MouseEvent) {
        this.mousePosition.x = e.offsetX
        this.mousePosition.y = e.offsetY
    }
    mouseUp(e: MouseEvent) {
        switch (e.button) {
            case 0:
                this.leftMousePressed = false
            break
            case 2:
                this.rightMousePressed = false
            break
        }
    }
    mouseWheel(e: WheelEvent) {

    }
    mouseLeave() {

    }
    keyDown(e: KeyboardEvent) {
        if (!this.sounds) {
            this.startSounds()
        }

        switch (e.code) {
            case 'ArrowLeft':
                this.leftPressed = true
                break
            case 'ArrowRight':
                this.rightPressed = true
                break
            case 'ArrowUp':
                this.upPressed = true
                break
            case 'ArrowDown':
                this.downPressed = true
                break
            case 'KeyC':
                this.jumpPressed = true
                break
            case 'KeyX':
                this.lookPressed = true
                break
        }
    }
    keyUp(e: KeyboardEvent) {
        switch (e.code) {
            case 'ArrowLeft':
                this.leftPressed = false
                break
            case 'ArrowRight':
                this.rightPressed = false
                break
            case 'ArrowUp':
                this.upPressed = false
                break
            case 'ArrowDown':
                this.downPressed = false
                break
            case 'KeyC':
                this.jumpPressed = false
                break
            case 'KeyX':
                this.lookPressed = false
                break
        }
    }




    loop(time: number) {
        const deltaTime = (time - this.lastTime) / 1000
        this.lastTime = time

        this.update(deltaTime)
        const interpolation = this.accumulator / Game.UpdateStep

        this.render(interpolation)

        requestAnimationFrame(time => { this.loop(time) })
    }


    update(deltaTime: number) {
        this.accumulator += deltaTime

        while (this.accumulator >= Game.UpdateStep) {
            

            if (this.jumpPressed && !this.lookPressed) {
                if (this.player.jumpFrame === 0) {
                    this.player.beginJump(this.blocks)
                }
                this.player.jump(Game.UpdateStep)
            } else {
                this.player.endJump()
            }


            let focusY = 0
            let focusX = 0
            if (!this.lookPressed) {
                const direction = (this.leftPressed ? -1 : 0) + (this.rightPressed ? 1 : 0)
                this.player.move(direction, Game.UpdateStep, this.blocks)
            } else {
                if (this.rightPressed) {
                    focusX++
                }
                if (this.leftPressed) {
                    focusX--
                }
                if (this.downPressed) {
                    focusY++
                }
                if (this.upPressed) {
                    focusY--
                }
                focusX *= 400
                focusY *= 400
            }
            
            this.player.fall(Game.UpdateStep, this.blocks)
            this.player.collect(this.coins)

            for (const coin of this.coins) {
                coin.seek(this.player.x + Player.Width / 2, this.player.y + Player.Height / 2, Game.UpdateStep)
            }



            this.camera.track(this.player.x + focusX, this.player.y + focusY, Game.UpdateStep)
            this.accumulator -= Game.UpdateStep
        }
    }

    resize() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }
    render(interpolation: number) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        const offsetX = this.camera.interpolatedX(interpolation) - window.innerWidth / 2
        const offsetY = this.camera.interpolatedY(interpolation) - window.innerHeight / 2

        this.renderBlocks(offsetX, offsetY)
        this.renderCoins(interpolation, offsetX, offsetY)
        this.renderPlayer(interpolation, offsetX, offsetY)
        this.renderOverlay(interpolation, offsetX, offsetY)
        this.renderCoinCounter()
        this.renderInstructions()
    }
    renderPlayer(interpolation: number, offsetX: number, offsetY: number) {
        this.context.fillStyle = '#ccc'
        const x = this.player.interpolatedX(interpolation) - offsetX
        const y = this.player.interpolatedY(interpolation) - offsetY
        this.context.beginPath()
        this.context.roundRect(x, y, Player.Width, Player.Height, 3)
        this.context.fill()

        this.context.strokeStyle = '#fff2'
        this.context.beginPath()
        this.context.arc(x + Player.Width / 2, y + Player.Height / 2, Player.AttractionRadius, 0, Tau)
        this.context.stroke()
    }
    renderOverlay(interpolation: number, offsetX: number, offsetY: number) {
        const x = this.player.interpolatedX(interpolation) - offsetX + Player.Width / 2
        const y = this.player.interpolatedY(interpolation) - offsetY + Player.Height / 2
        const gradient = this.context.createRadialGradient(x, y, 0, x, y, 400)
        gradient.addColorStop(0, '#0000')
        gradient.addColorStop(0.6, '#0000')
        gradient.addColorStop(1, '#000a')
        this.context.globalCompositeOperation = 'color-burn'
        this.context.fillStyle = gradient
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.globalCompositeOperation = 'source-over'
    }
    renderBlocks(offsetX: number, offsetY: number) {
        this.context.beginPath()
        for (const block of this.blocks) {
            const x = block.x - offsetX
            const y = block.y - offsetY
            this.context.roundRect(x, y, block.w, block.h, BorderRadius)
        }
        this.context.fillStyle = '#321'
        this.context.fill()

        this.context.beginPath()
        for (const block of this.blocks) {
            const x = block.x - offsetX + BorderThickness
            const y = block.y - offsetY + BorderThickness
            this.context.roundRect(x, y, block.w - BorderThickness * 2, block.h - BorderThickness * 2, BorderRadius - BorderThickness)
        }
        this.context.fillStyle = '#100c08'
        this.context.fill()
    }
    renderCoins(interpolation: number, offsetX: number, offsetY: number) {
        this.context.fillStyle = '#fc0'
        this.context.beginPath()
        for (const coin of this.coins) {
            if (coin.evil) continue

            const x = coin.interpolatedX(interpolation) - offsetX
            const y = coin.interpolatedY(interpolation) - offsetY
            this.context.moveTo(x, y)
            this.context.arc(x, y, Coin.Radius, 0, Tau)
        }
        this.context.fill()

        this.context.fillStyle = '#0cf'
        this.context.beginPath()
        for (const coin of this.coins) {
            if (!coin.evil) continue

            const x = coin.interpolatedX(interpolation) - offsetX
            const y = coin.interpolatedY(interpolation) - offsetY
            this.context.moveTo(x, y)
            this.context.arc(x, y, Coin.Radius, 0, Tau)
        }
        this.context.fill()
    }
    renderCoinCounter() {
        this.context.fillStyle = '#aaa'
        this.context.font = '50px sans-serif'
        this.context.fillText(this.player.coins + '', 10, 60)
    }
    renderInstructions() {
        this.context.fillStyle = '#aaa'
        this.context.font = '16px sans-serif'
        this.context.fillText('Use arrow keys to move', 10, window.innerHeight - 80)
        this.context.fillText('Press \'c\' to jump', 10, window.innerHeight - 50)
        this.context.fillText('Press \'x\' plus arrow keys to look', 10, window.innerHeight - 20)
    }
}