import Rectangle from './rectangle.js';
import Camera from './camera.js';
import Coin from './coin.js';
import Player from './player.js';
import Vision from './vision.js';
import Shot from './shot.js';
import Blast from './blast.js';
const Tau = Math.PI * 2;
const BorderThickness = 4;
const BorderRadius = 6;
export default class Game {
    static UpdateStep = 1 / 240;
    player = new Player(50, -2000);
    blocks = new Array();
    coins = new Array();
    shots = new Array();
    blasts = new Array();
    canvas = document.getElementById('game-canvas');
    context = this.canvas.getContext('2d');
    overlayCanvas = document.getElementById('overlay-canvas');
    overlayContext = this.overlayCanvas.getContext('2d');
    mousePosition = { x: 0, y: 0 };
    camera = new Camera(this.player.x, this.player.y);
    leftMousePressed = false;
    rightMousePressed = false;
    leftPressed = false;
    rightPressed = false;
    upPressed = false;
    downPressed = false;
    jumpPressed = false;
    lookPressed = false;
    fire = false;
    lastTime = 0;
    accumulator = 0;
    sounds = false;
    constructor() {
        this.generateBlocks();
        this.generateCoins();
        window.addEventListener('mousedown', e => this.mouseDown(e));
        window.addEventListener('mousemove', e => this.mouseMove(e));
        window.addEventListener('mouseup', e => this.mouseUp(e));
        window.addEventListener('mouseleave', () => this.mouseLeave());
        window.addEventListener('keydown', e => this.keyDown(e));
        window.addEventListener('keyup', e => this.keyUp(e));
        window.addEventListener('wheel', e => this.mouseWheel(e));
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('contextmenu', e => e.preventDefault());
        this.resize();
        requestAnimationFrame(time => this.loop(time));
    }
    generateBlocks() {
        this.blocks.push(new Rectangle(0, -300, 200, 200));
        this.blocks.push(new Rectangle(200, -200, 200, 200));
        this.blocks.push(new Rectangle(-300, -550, 400, 100));
        this.blocks.push(new Rectangle(-1200, -550 - Player.Height / 2, 800, 100));
        this.blocks.push(new Rectangle(200, -550 - Player.Height / 2, 800, 100));
        this.blocks.push(new Rectangle(-10000, 10500, 20000, 100));
        for (let i = 0; i < 1000; i++) {
            const x = Math.floor(Math.random() * 10000) - 5000;
            const y = Math.floor(Math.random() * 10000);
            const w = Math.floor(Math.random() * 600) + 50;
            const h = Math.floor(Math.random() * 200) + 50;
            this.blocks.push(new Rectangle(x, y, w, h));
        }
        const count = 10500 / 250;
        for (let i = 0; i < count; i++) {
            const x = 5500 + (i & 1) * 50;
            const y = i * 250;
            const w = 200;
            const h = 20;
            this.blocks.push(new Rectangle(x, y, w, h));
            this.blocks.push(new Rectangle(-x, y, w, h));
        }
    }
    generateCoins() {
        for (let i = 0; i < 500; i++) {
            const x = Math.floor(Math.random() * 10000) - 5000;
            const y = Math.floor(Math.random() * 10000);
            this.coins.push(new Coin(x, y, Math.random() < 0.5));
        }
    }
    startSounds() {
        const ambience = new Audio('./res/sounds/ambience.mp3');
        ambience.loop = true;
        ambience.play();
        this.sounds = true;
    }
    mouseDown(e) {
        if (!this.sounds) {
            this.startSounds();
        }
        switch (e.button) {
            case 0:
                this.leftMousePressed = true;
                this.fire = true;
                break;
            case 2:
                this.rightMousePressed = true;
                break;
        }
    }
    mouseMove(e) {
        this.mousePosition.x = e.offsetX;
        this.mousePosition.y = e.offsetY;
        const targetX = this.camera.gameX(this.mousePosition.x);
        const targetY = this.camera.gameY(this.mousePosition.y);
        this.player.target(targetX, targetY);
    }
    mouseUp(e) {
        switch (e.button) {
            case 0:
                this.leftMousePressed = false;
                break;
            case 2:
                this.rightMousePressed = false;
                break;
        }
    }
    mouseWheel(e) {
        if (e.deltaY > 0) {
            this.camera.zoomOut();
        }
        else if (e.deltaY < 0) {
            this.camera.zoomIn();
        }
    }
    mouseLeave() {
    }
    keyDown(e) {
        if (!this.sounds) {
            this.startSounds();
        }
        switch (e.code) {
            case 'KeyA':
                this.leftPressed = true;
                break;
            case 'KeyD':
                this.rightPressed = true;
                break;
            case 'KeyW':
                this.upPressed = true;
                break;
            case 'KeyS':
                this.downPressed = true;
                break;
            case 'Space':
                this.jumpPressed = true;
                break;
            case 'ShiftLeft':
                this.lookPressed = true;
                break;
        }
    }
    keyUp(e) {
        switch (e.code) {
            case 'KeyA':
                this.leftPressed = false;
                break;
            case 'KeyD':
                this.rightPressed = false;
                break;
            case 'KeyW':
                this.upPressed = false;
                break;
            case 'KeyS':
                this.downPressed = false;
                break;
            case 'Space':
                this.jumpPressed = false;
                break;
            case 'ShiftLeft':
                this.lookPressed = false;
                break;
        }
    }
    loop(time) {
        const deltaTime = Math.min((time - this.lastTime) / 1000, 0.25); // min to prevent catch up on resume
        this.lastTime = time;
        this.update(deltaTime, time);
        const interpolation = this.accumulator / Game.UpdateStep;
        this.render(interpolation);
        requestAnimationFrame(time => { this.loop(time); });
    }
    update(deltaTime, time) {
        this.accumulator += deltaTime;
        if (this.fire) {
            const shot = new Shot(this.player);
            this.shots.push(shot);
            this.fire = false;
        }
        const targetX = this.camera.gameX(this.mousePosition.x);
        const targetY = this.camera.gameY(this.mousePosition.y);
        this.player.target(targetX, targetY);
        while (this.accumulator >= Game.UpdateStep) {
            if (this.jumpPressed && !this.lookPressed) {
                if (this.player.jumpFrame === 0) {
                    this.player.beginJump(this.blocks);
                }
                this.player.jump(Game.UpdateStep);
            }
            else {
                this.player.endJump();
            }
            let focusY = 0;
            let focusX = 0;
            if (!this.lookPressed) {
                const direction = (this.leftPressed ? -1 : 0) + (this.rightPressed ? 1 : 0);
                this.player.move(direction, Game.UpdateStep, this.blocks);
            }
            else {
                if (this.rightPressed) {
                    focusX++;
                }
                if (this.leftPressed) {
                    focusX--;
                }
                if (this.downPressed) {
                    focusY++;
                }
                if (this.upPressed) {
                    focusY--;
                }
                const focusDistance = 400 / this.camera.zoomScalar;
                focusX *= focusDistance;
                focusY *= focusDistance;
            }
            this.player.fall(Game.UpdateStep, this.blocks);
            this.player.collect(this.coins);
            for (const coin of this.coins) {
                coin.seek(this.player.x + Player.Width / 2, this.player.y + Player.Height / 2, Game.UpdateStep);
            }
            for (let i = this.shots.length - 1; i >= 0; i--) {
                const shot = this.shots[i];
                shot.update(Game.UpdateStep);
                for (const block of this.blocks) {
                    if (block.contains({ x: shot.x, y: shot.y })) {
                        this.shots.splice(i, 1);
                        this.blasts.push(new Blast(shot.x, shot.y));
                        break;
                    }
                }
            }
            for (let i = this.blasts.length - 1; i >= 0; i--) {
                const blast = this.blasts[i];
                blast.update(Game.UpdateStep);
                if (blast.expired()) {
                    this.blasts.splice(i, 1);
                }
            }
            this.camera.track(this.player.x + Player.Width / 2 + focusX, this.player.y + Player.Height / 2 + focusY, Game.UpdateStep);
            this.accumulator -= Game.UpdateStep;
            time += Game.UpdateStep;
        }
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.overlayCanvas.width = window.innerWidth;
        this.overlayCanvas.height = window.innerHeight;
    }
    render(interpolation) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.overlayContext.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        this.camera.interpolate(interpolation);
        this.player.interpolate(interpolation);
        for (const coin of this.coins) {
            coin.interpolate(interpolation);
        }
        for (const shot of this.shots) {
            shot.interpolate(interpolation);
        }
        for (const blast of this.blasts) {
            blast.interpolate(interpolation);
        }
        this.renderBlasts();
        this.renderBlocks();
        this.renderCoins();
        this.renderShots();
        this.renderVision();
        this.renderPlayer();
        this.renderOverlay();
        this.renderCoinCounter();
        this.renderInstructions();
    }
    renderVision() {
        this.overlayContext.fillStyle = '#000f';
        //this.overlayContext.fillRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height)
        const centerX = this.player.interpolatedX + Player.Width / 2;
        const centerY = this.player.interpolatedY + Player.Height / 2;
        const vision = new Vision({ x: centerX, y: centerY }, this.blocks, this.camera.displayRectangle());
        this.overlayContext.strokeStyle = '#f80';
        this.overlayContext.fillStyle = '#f80';
        //this.overlayContext.lineWidth = 12
        this.overlayContext.lineJoin = 'round';
        this.overlayContext.beginPath();
        const start = vision.perimeter[0];
        this.overlayContext.moveTo(this.camera.interpolatedDisplayX(start.x), this.camera.interpolatedDisplayY(start.y));
        for (let i = 1; i < vision.perimeter.length; i++) {
            const point = vision.perimeter[i];
            const x = this.camera.interpolatedDisplayX(point.x);
            const y = this.camera.interpolatedDisplayY(point.y);
            this.overlayContext.lineTo(x, y);
        }
        this.overlayContext.closePath();
        this.overlayContext.fill();
        this.context.globalAlpha = 0.0625;
        this.context.drawImage(this.overlayCanvas, 0, 0);
        this.context.globalAlpha = 1;
        // this.context.fillStyle = '#fff'
        // this.context.beginPath()
        // for (let i = 0; i < vision.perimeter.length; i++) {
        //     const point = vision.perimeter[i]
        //     const x = this.camera.displayX(point.x)
        //     const y = this.camera.displayY(point.y)
        //     this.context.moveTo(x, y)
        //     this.context.arc(x, y, 5, 0, Tau)
        // }
        // this.context.fill()
    }
    renderPlayer() {
        this.context.fillStyle = '#ccc';
        const x = this.camera.interpolatedDisplayX(this.player.interpolatedX);
        const y = this.camera.interpolatedDisplayY(this.player.interpolatedY);
        const w = this.camera.displayScale(Player.Width);
        const h = this.camera.displayScale(Player.Height);
        this.context.beginPath();
        this.context.fillRect(x, y, w, h);
        this.context.fill();
        this.context.lineWidth = 1;
        const centerX = this.camera.interpolatedDisplayX(this.player.interpolatedX + Player.Width / 2);
        const centerY = this.camera.interpolatedDisplayY(this.player.interpolatedY + Player.Height / 2);
        this.context.strokeStyle = '#fff2';
        this.context.beginPath();
        this.context.arc(centerX, centerY, this.camera.displayScale(Player.AttractionRadius), 0, Tau);
        this.context.stroke();
        this.context.fillStyle = '#ccc';
        this.context.beginPath();
        const targetX = this.camera.displayX(this.player.targetX);
        const targetY = this.camera.displayY(this.player.targetY);
        this.context.arc(targetX, targetY, this.camera.displayScale(6), 0, Tau);
        this.context.fill();
        this.context.fillStyle = '#ccc';
        this.context.beginPath();
        this.context.moveTo(centerX, centerY);
        this.context.lineTo(targetX, targetY);
        this.context.stroke();
    }
    renderOverlay() {
        const x = this.camera.interpolatedDisplayX(this.player.interpolatedX + Player.Width / 2);
        const y = this.camera.interpolatedDisplayY(this.player.interpolatedY + Player.Height / 2);
        const r = this.camera.displayScale(500);
        const gradient = this.context.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, '#0000');
        gradient.addColorStop(0.6, '#0018');
        gradient.addColorStop(1, '#012f');
        this.context.globalCompositeOperation = 'overlay';
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.globalCompositeOperation = 'source-over';
    }
    renderBlocks() {
        this.context.beginPath();
        for (const block of this.blocks) {
            const x = this.camera.interpolatedDisplayX(block.x);
            const y = this.camera.interpolatedDisplayY(block.y);
            const w = this.camera.displayScale(block.w);
            const h = this.camera.displayScale(block.h);
            this.context.roundRect(x, y, w, h, 0);
        }
        this.context.fillStyle = '#421';
        this.context.fill();
        this.context.beginPath();
        for (const block of this.blocks) {
            const x = this.camera.interpolatedDisplayX(block.x + BorderThickness);
            const y = this.camera.interpolatedDisplayY(block.y + BorderThickness);
            const w = this.camera.displayScale(block.w - BorderThickness * 2);
            const h = this.camera.displayScale(block.h - BorderThickness * 2);
            this.context.roundRect(x, y, w, h, 0);
        }
        this.context.fillStyle = '#201208';
        this.context.fill();
    }
    renderCoins() {
        this.context.fillStyle = '#fc0';
        this.context.beginPath();
        const r = this.camera.displayScale(Coin.Radius);
        for (const coin of this.coins) {
            if (coin.evil)
                continue;
            const x = this.camera.interpolatedDisplayX(coin.interpolatedX);
            const y = this.camera.interpolatedDisplayY(coin.interpolatedY);
            this.context.moveTo(x, y);
            this.context.arc(x, y, r, 0, Tau);
        }
        this.context.fill();
        this.context.fillStyle = '#0cf';
        this.context.beginPath();
        for (const coin of this.coins) {
            if (!coin.evil)
                continue;
            const x = this.camera.interpolatedDisplayX(coin.interpolatedX);
            const y = this.camera.interpolatedDisplayY(coin.interpolatedY);
            this.context.moveTo(x, y);
            this.context.arc(x, y, r, 0, Tau);
        }
        this.context.fill();
    }
    renderBlasts() {
        this.context.strokeStyle = '#ccc8';
        this.context.beginPath();
        for (const blast of this.blasts) {
            const x = this.camera.interpolatedDisplayX(blast.x);
            const y = this.camera.interpolatedDisplayY(blast.y);
            const scalar = blast.age / Blast.Lifetime;
            const r = this.camera.displayScale(Blast.Radius) * scalar;
            this.context.lineWidth = this.camera.displayScale(1 / scalar);
            this.context.moveTo(x + r, y);
            this.context.arc(x, y, r, 0, Tau);
        }
        this.context.stroke();
    }
    renderShots() {
        this.context.strokeStyle = '#ccc';
        this.context.lineCap = 'round';
        this.context.lineWidth = this.camera.displayScale(Shot.Width);
        this.context.beginPath();
        const length = this.camera.displayScale(Shot.Length);
        for (const shot of this.shots) {
            const x1 = this.camera.interpolatedDisplayX(shot.interpolatedX);
            const y1 = this.camera.interpolatedDisplayY(shot.interpolatedY);
            const x2 = x1 - Math.cos(shot.theta) * length;
            const y2 = y1 - Math.sin(shot.theta) * length;
            this.context.moveTo(x1, y1);
            this.context.lineTo(x2, y2);
        }
        this.context.stroke();
    }
    renderCoinCounter() {
        this.context.fillStyle = '#aaa';
        this.context.font = '50px sans-serif';
        this.context.fillText(this.player.coins + '', 10, 60);
    }
    renderInstructions() {
        this.context.fillStyle = '#aaa';
        this.context.font = '16px sans-serif';
        this.context.fillText('Use WASD keys to move', 10, window.innerHeight - 140);
        this.context.fillText('Press SPACE to jump', 10, window.innerHeight - 110);
        this.context.fillText('Use MOUSE to aim and fire', 10, window.innerHeight - 80);
        this.context.fillText('Press LEFT SHIFT plus arrow keys to look', 10, window.innerHeight - 50);
        this.context.fillText('Use MOUSE WHEEL to zoom', 10, window.innerHeight - 20);
    }
}
