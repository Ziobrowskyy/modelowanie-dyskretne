import Canvas from "./Canvas.js"
import Utils, {ColorArray} from "./utils.js"

enum Dir {
    C,
    S,
    SE,
    E,
    NE,
    N,
    NW,
    W,
    SW
}

class Cell {
    in: number[]
    eq: number[]
    out: number[]
    rho: number = 1.0
    vx: number
    vy: number

    static dirs: number = 9.0

    constructor(vx: number = 0.0, vy: number = 0.0) {
        this.vx = vx
        this.vy = vy

        this.eq = Cell.emptyArray()
        this.out = Cell.emptyArray()

        const vx2 = Math.pow(this.vx, 2)
        const vy2 = Math.pow(this.vy, 2)
        const eu2 = 1.0 - 1.5 * (vx2 + vy2)
        const Rho36 = this.rho / 36.0

        this.eq[Dir.C] = 16.0 * Rho36 * eu2
        this.eq[Dir.N] = 4.0 * Rho36 * (eu2 + 3.0 * this.vy + 4.5 * vy2)
        this.eq[Dir.E] = 4.0 * Rho36 * (eu2 + 3.0 * this.vx + 4.5 * vx2)
        this.eq[Dir.S] = 4.0 * Rho36 * (eu2 - 3.0 * this.vy + 4.5 * vy2)
        this.eq[Dir.W] = 4.0 * Rho36 * (eu2 - 3.0 * this.vx + 4.5 * vx2)
        this.eq[Dir.NE] = Rho36 * (eu2 + 3.0 * (this.vx + this.vy) + 4.5 * (this.vx + this.vy) * (this.vx + this.vy))
        this.eq[Dir.SE] = Rho36 * (eu2 + 3.0 * (this.vx - this.vy) + 4.5 * (this.vx - this.vy) * (this.vx - this.vy))
        this.eq[Dir.SW] = Rho36 * (eu2 + 3.0 * (-this.vx - this.vy) + 4.5 * (this.vx + this.vy) * (this.vx + this.vy))
        this.eq[Dir.NW] = Rho36 * (eu2 + 3.0 * (-this.vx + this.vy) + 4.5 * (-this.vx + this.vy) * (-this.vx + this.vy))

        this.in = [...this.eq]
    }

    static emptyArray() {
        // 9 * [0]
        return [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}

export class LBM_FluidFlow extends Canvas {
    cells: Cell[][]

    constructor() {
        const w = 128 * 2
        const h = 128 * 2
        super(w, h, 800, 800)
        this.cells = Array(this.height)

        this.#setupCells()
        this.#drawCells()
        this.simulationDelay = 1

        this.wrapper.style.transform = "scaleY(-1)"
        // this.context.scale(1, -1)
        // this.context.translate(0, -this.height)
    }

    #setupCells() {
        for (let y = 0; y < this.height; y++) {
            this.cells[y] = Array(this.width)
            for (let x = 0; x < this.width; x++) {
                if (x == 0 || x == this.width - 1 || y == 0 || y == this.height - 1) {
                    this.cells[y][x] = new Cell((y / this.height) * 0.05, 0.0)
                } else {
                    this.cells[y][x] = new Cell()
                }
            }
        }
    }

    simulationStep(): void {
        this.#collision()
        this.#streaming()
        this.#drawCells()
        this.#drawLines()
    }

    #collision() {
        const tau = 1.0
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // macroscopic density and velocity for the current cell
                const cell = this.cells[y][x]
                cell.rho = cell.in.reduce((p, c) => p + c)
                cell.vx = (cell.in[Dir.E] + cell.in[Dir.SE] + cell.in[Dir.NE] - cell.in[Dir.W] - cell.in[Dir.SW] - cell.in[Dir.NW]) / cell.rho
                cell.vy = (cell.in[Dir.N] + cell.in[Dir.NW] + cell.in[Dir.NE] - cell.in[Dir.S] - cell.in[Dir.SW] - cell.in[Dir.SE]) / cell.rho

                // equilibrium function
                const vx2 = cell.vx * cell.vx
                const vy2 = cell.vy * cell.vy
                const eu2 = 1.0 - 1.5 * (vx2 + vy2)
                const Rho36 = cell.rho / 36.0
                cell.eq[Dir.C] = 16.0 * Rho36 * eu2
                cell.eq[Dir.N] = 4.0 * Rho36 * (eu2 + 3.0 * cell.vy + 4.5 * vy2)
                cell.eq[Dir.E] = 4.0 * Rho36 * (eu2 + 3.0 * cell.vx + 4.5 * vx2)
                cell.eq[Dir.S] = 4.0 * Rho36 * (eu2 - 3.0 * cell.vy + 4.5 * vy2)
                cell.eq[Dir.W] = 4.0 * Rho36 * (eu2 - 3.0 * cell.vx + 4.5 * vx2)
                cell.eq[Dir.NE] = Rho36 * (eu2 + 3.0 * (cell.vx + cell.vy) + 4.5 * (cell.vx + cell.vy) * (cell.vx + cell.vy))
                cell.eq[Dir.SE] = Rho36 * (eu2 + 3.0 * (cell.vx - cell.vy) + 4.5 * (cell.vx - cell.vy) * (cell.vx - cell.vy))
                cell.eq[Dir.SW] = Rho36 * (eu2 + 3.0 * (-cell.vx - cell.vy) + 4.5 * (cell.vx + cell.vy) * (cell.vx + cell.vy))
                cell.eq[Dir.NW] = Rho36 * (eu2 + 3.0 * (-cell.vx + cell.vy) + 4.5 * (-cell.vx + cell.vy) * (-cell.vx + cell.vy))

                // relaxation - output function
                for (let i = 0; i < Cell.dirs; i++) {
                    cell.out[i] = cell.in[i] + 1.0 / tau * (cell.eq[i] - cell.in[i])
                }
            }
        }
    }

    #streaming() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // streaming
                this.cells[y][x].in[Dir.C] = this.cells[y][x].out[Dir.C]
                if (x < this.width - 1) {
                    this.cells[y][x].in[Dir.W] = this.cells[y][x + 1].out[Dir.W]
                    this.cells[y][x + 1].in[Dir.E] = this.cells[y][x].out[Dir.E]
                }
                if (y < this.height - 1) {
                    this.cells[y][x].in[Dir.S] = this.cells[y + 1][x].out[Dir.S]
                    this.cells[y + 1][x].in[Dir.N] = this.cells[y][x].out[Dir.N]
                }
                if (x < this.width - 1 && y < this.height - 1) {
                    this.cells[y][x].in[Dir.SW] = this.cells[y + 1][x + 1].out[Dir.SW]
                    this.cells[y + 1][x + 1].in[Dir.NE] = this.cells[y][x].out[Dir.NE]
                }
                if (x > 0 && y < this.height - 1) {
                    this.cells[y][x].in[Dir.SE] = this.cells[y + 1][x - 1].out[Dir.SE]
                    this.cells[y + 1][x - 1].in[Dir.NW] = this.cells[y][x].out[Dir.NW]
                }
                // boundary conditions
                if (x == 0 || x == this.width - 1 || y == 0 || y == this.height - 1) {
                    this.cells[y][x].in = [...this.cells[y][x].out]
                }
            }
        }
    }

    #drawCells() {
        this.cells.forEach((row, y) => {
            row.forEach((cell, x) => {
                let color: ColorArray = [255, 255, 255, 255]
                // color = [255 * cell.vy, 0, 0 ,0]
                const sum = cell.vx * 20
                if (cell.vx < -0.0005) {
                    color[0] = (1.0 + sum) * 255
                    color[1] = color[0]
                }
                if (cell.vx > 0.0005) {
                    color[2] = (1.0 - sum) * 255
                    color[1] = color[2]
                }
                this.drawPixel(x, y, color)
            })
        })
        this.updatePixels()
    }

    #drawLines() {
        this.context.lineWidth = 0
        this.context.strokeStyle = "black"
        const arrowLength = 300.0
        for (let x = 0; x < this.width; x += 10) {
            for (let y = 0; y < this.height; y += 10) {
                const cell = this.cells[y][x]
                this.context.beginPath()
                this.context.moveTo(x, y)
                this.context.lineTo(x + cell.vx * arrowLength, y + cell.vy * arrowLength)
                this.context.stroke()
            }
        }

        this.#drawParticle(0.9, 0.005, "blue")
        this.#drawParticle(0.4, 0.002, "yellow")
        this.#drawParticle(0.0, 0.000, "green")
    }

    #drawParticle(mu: number, grav: number, color: string = "black") {
        this.context.lineWidth = 1
        this.context.strokeStyle = color
        let xpart0, xpart1, ypart0, ypart1
        let vxpart0, vxpart1, vypart0, vypart1
        const epsilon = 1e-4
        for (let iterp = 1; iterp <= 5; iterp++) {
            xpart0 = xpart1 = 0.0
            ypart0 = ypart1 = iterp * this.width / 5 - 1.0
            vxpart0 = this.cells[Math.floor(ypart0)][Math.floor(xpart0)].vx
            vypart0 = this.cells[Math.floor(ypart0)][Math.floor(xpart0)].vy

            this.context.beginPath()
            this.context.moveTo(xpart0, ypart0)

            while (xpart1 < this.width - 1 && ypart1 > 0.0 && ypart1 <= this.height - 1 && xpart1 >= 0.0) {
                vxpart1 = mu * vxpart0 + (1.0 - mu) * this.cells[Math.floor(ypart0)][Math.floor(xpart0)].vx
                vypart1 = mu * vypart0 + (1.0 - mu) * this.cells[Math.floor(ypart0)][Math.floor(xpart0)].vy - grav
                xpart1 = xpart0 + 100. * (vxpart0 + vxpart1) / 2.0
                ypart1 = ypart0 + 100. * (vypart0 + vypart1) / 2.0
                vxpart0 = vxpart1
                vypart0 = vypart1
                this.context.lineTo(xpart1, ypart1)

                if (Math.abs(xpart1 - xpart0) <= epsilon && Math.abs(ypart1 - ypart0) < epsilon) {
                    break
                }

                xpart0 = xpart1
                ypart0 = ypart1
            }
            this.context.stroke()
        }
    }

}