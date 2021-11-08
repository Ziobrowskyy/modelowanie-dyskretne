import Canvas from "../Canvas.js";
import {ColorArray} from "../utils.js";

class Ball {
    x: number
    y: number
    xV: number
    yV: number

    constructor(x: number, y: number, xV: number, yV: number) {
        this.x = x
        this.y = y
        this.xV = xV
        this.yV = yV
    }

    update(mX: number, mY: number) {
        // this.x = (this.x + this.xV + mX) % mX
        // this.y = (this.y + this.yV + mY) % mY
        this.x += this.xV
        this.y += this.yV
        if(this.x < 0 || this.x > mX) {
            // this.x = (this.x + mX) % mX

            this.xV *= -1
        }
        if(this.y < 0 || this.y > mY) {
            // this.y = (this.y + mY) % mY
            this.yV *= -1
        }
    }
}

export default class MetaBalls extends Canvas {
    balls: Ball[] = []

    constructor() {
        super(400, 400, 400, 400)
        this.setupBalls()
        this.simulationStep()
    }

    setupBalls() {
        for (let i = 0; i < 20; i++) {
            const ball = new Ball(
                Math.random() * this.renderWidth,
                Math.random() * this.renderHeight,
                4 * (Math.random() - 0.5),
                4 * (Math.random() - 0.5),
            )
            this.balls.push(ball)
        }
    }

    simulationStep() {
        const getDist = (x1: number, y1: number, x2: number, y2: number) => {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
        }
        for (let y = 0; y < this.renderHeight; y++) {
            for (let x = 0; x < this.renderWidth; x++) {
                let distSum = 0
                for (let ball of this.balls) {
                    const dist = 255 / getDist(x, y, ball.x, ball.y)
                    distSum += dist
                }
                distSum *= 5
                // if (distSum > 255)
                //     distSum = 255
                if (distSum < 255)
                    distSum = 0
                const c: ColorArray = [distSum, distSum, distSum, 255]
                // if(distSum != 0)
                // console.log(c)
                this.drawPixel(x, y, c)
            }
        }
        this.balls.forEach((ball) => ball.update(this.renderWidth, this.renderHeight))
        this.updatePixels()

    }
}