import Canvas from "./Canvas.js";
import {Color, ColorArray, Vec2} from "./utils.js";

enum Direction {
    UP,
    LEFT,
    DOWN,
    RIGHT
}

class Cell {
    isWall: boolean
    in: boolean[]
    out: boolean[]

    constructor(isWall: boolean, out = [false, false, false, false]) {
        this.isWall = isWall
        this.in = [false, false, false, false]
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
        const out = Array(4)
        for (let i = 0; i < out.length; i++) {
            out[i] = Math.random() > 0.5
        }
        return new Cell(false, out)
    }
}

export class LGA extends Canvas {
    cells: Cell[][]

    constructor() {
        super(200,200, 4 * 100, 4 * 100);
        this.cells = Array(this.height)

        this.#setupCells()
        this.#drawCells()
    }

    #setupCells() {
        // board
        const wallGapSize = Math.floor(this.height / 12)
        const wallGapPosX = Math.floor(this.width / 3)

        for (let y = 0; y < this.height; y++) {
            this.cells[y] = Array(this.width)
            for (let x = 0; x < this.width; x++) {
                if (x < wallGapPosX && Math.random() > 0.4)
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
                const tempIn = [false, false, false, false]
                //top
                if (y > 0 && this.cells[y - 1][x].out[Direction.DOWN])
                    tempIn[Direction.DOWN] = true
                //down
                if (y < this.height - 1 && this.cells[y + 1][x].out[Direction.UP])
                    tempIn[Direction.UP] = true
                //left
                if (x > 0 && this.cells[y][x - 1].out[Direction.LEFT])
                    tempIn[Direction.LEFT] = true
                //right
                if (x < this.width - 1 && this.cells[y][x + 1].out[Direction.RIGHT])
                    tempIn[Direction.RIGHT] = true

                if (cell.isWall) {
                    tempIn.push(tempIn.shift()!)
                    tempIn.push(tempIn.shift()!)
                }
                cell.in = tempIn
            }
        }
    }

    #collision() {
        const arrayCompare = (o1: any[], o2: any[]): boolean => {
            if (o1.length != o2.length)
                return false
            for (let i = 0; i < o1.length; i++) {
                if (o1[i] != o2[i])
                    return false
            }
            return true
        }
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x]
                let tempOut = cell.in

                if (arrayCompare(tempOut, [true, false, true, false])) {
                    tempOut = [false, true, false, true]
                } else if (arrayCompare(tempOut, [false, true, false, true])) {
                    tempOut = [true, false, true, false]
                }

                cell.out = tempOut
            }
        }
    }

    #drawCells() {
        // this.clearWithColor()
        this.cells.forEach((row, y) => {
            row.forEach((cell, x) => {
                let color: ColorArray
                if (cell.isWall) {
                    color = Color.BLACK
                } else if (cell.out.includes(true)) {
                    color = Color.RED
                } else {
                    color = Color.WHITE
                }
                this.drawPixel(x, y, color)
            })
        })
        this.updatePixels()
    }

}