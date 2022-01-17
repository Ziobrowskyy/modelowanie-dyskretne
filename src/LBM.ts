import Canvas from "./Canvas.js";
import {Color, ColorArray, Vec2} from "./utils.js";
import GameOfLife from "./cellular_automata/gameOfLife";

enum Direction {
    UP,
    LEFT,
    DOWN,
    RIGHT
}

declare global {
    interface Window {
        gowno: any
    }
}

class Cell {
    isWall: boolean
    in: number[]
    out: number[]

    constructor(isWall: boolean, out: number[] = [0, 0, 0, 0]) {
        this.isWall = isWall
        this.in = [0, 0, 0, 0]
        this.out = out
    }

    // static factory methods
    static WALL() {
        return new Cell(true)
    }

    static EMPTY() {
        return new Cell(false)
    }

    static GAS() {
        const out = [0, 0, 0, 0]
        const i = Math.floor(Math.random() * 4)
        out[i] = 1.0
        return new Cell(false, out)
    }
}

export class LBM extends Canvas {
    cells: Cell[][]

    constructor() {
        const w = 100
        const h = 100
        super(w, h, w * 4, h * 4);
        this.cells = Array(this.height)

        this.#setupCells()
        this.#drawCells()
        this.simulationDelay = 1
    }

    #setupCells() {
        // board
        const wallGapSize = Math.floor(this.height / 6)
        const wallGapPosX = Math.floor(this.width / 2)

        for (let y = 0; y < this.height; y++) {
            this.cells[y] = Array(this.width)
            for (let x = 0; x < this.width; x++) {
                if (x < wallGapPosX && Math.random() > 0.2)
                    this.cells[y][x] = Cell.GAS()
                else
                    this.cells[y][x] = Cell.EMPTY()

            }
        }
        // top and bottom wall
        for (let x = 0; x < this.width; x++) {
            this.cells[0][x] = Cell.WALL()
            this.cells[this.height - 1][x] = Cell.WALL()
        }
        // left and right wall
        for (let y = 0; y < this.height; y++) {
            this.cells[y][0] = Cell.WALL()
            this.cells[y][this.width - 1] = Cell.WALL()
        }
        // barrier
        for (let y = 0; y < this.height / 2 - wallGapSize; y++) {
            this.cells[y][wallGapPosX] = Cell.WALL()
            this.cells[this.height - 1 - y][wallGapPosX] = Cell.WALL()
        }
    }

    simulationStep(): void {
        this.#streaming()
        this.#collision()

        this.#drawCells()
    }

    #streaming() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x]
                const tempIn = [0, 0, 0, 0]
                //top
                if (y > 0)
                    tempIn[Direction.DOWN] += this.cells[y - 1][x].out[Direction.DOWN]
                //down
                if (y < this.height - 1)
                    tempIn[Direction.UP] += this.cells[y + 1][x].out[Direction.UP]
                //left
                if (x > 0)
                    tempIn[Direction.LEFT] += this.cells[y][x - 1].out[Direction.LEFT]
                //right
                if (x < this.width - 1)
                    tempIn[Direction.RIGHT] += this.cells[y][x + 1].out[Direction.RIGHT]
                cell.in = tempIn
            }
        }
    }

    #collision() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x]
                if (cell.isWall) {
                    const tmpOut = cell.in
                    tmpOut.push(tmpOut.shift()!)
                    tmpOut.push(tmpOut.shift()!)
                    cell.out = tmpOut
                    continue
                }
                const density = cell.in.reduce((prev, curr) => prev + curr, 0) / 4
                const tau = 2;
                const tmpOut = [0, 0, 0, 0]

                for (let i = 0; i < 4; i++) {
                    const a = cell.in[i] + 1 / tau * (density - cell.in[i])
                    tmpOut[i] = a
                }

                cell.out = tmpOut
            }
        }
    }

    #drawCells() {
        // this.clearWithColor()
        let s = 0
        this.cells.forEach((row, y) => {
            row.forEach((cell, x) => {
                let color: ColorArray
                if (cell.isWall) {
                    color = Color.PURPLE
                } else {
                    const sum = cell.out.reduce((prev, curr) => prev + curr, 0)
                    s += sum
                    if (sum > 1) {
                        color = [(sum - 1) * 255, 255, 0, 255]
                    } else if (sum < 0) {
                        color = [Math.abs(sum) * 255, 0, 255, 255]
                    } else {
                        color = [sum * 255, sum * 255, sum * 255, 255]
                    }
                }
                this.drawPixel(x, y, color)
            })
        })
        console.log(s)
        this.updatePixels()
    }

}