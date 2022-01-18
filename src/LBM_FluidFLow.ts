import Canvas from "./Canvas.js";
import {ColorArray} from "./utils.js";

enum Direction {
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
    rho: number = 0.0
    vx: number = 0.0
    vy: number = 0.0

    constructor(out = Cell.emptyArray()) {
        this.in = Cell.emptyArray()
        this.eq = Cell.emptyArray()
        this.out = out
    }

    static emptyArray() {
        // 9 * [0]
        return [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}

export class LBM_FluidFlow extends Canvas {
    cells: Cell[][]

    constructor() {
        const w = 128 * 3
        const h = 128 * 3
        super(w, h, w * 4, h * 4);
        this.cells = Array(this.height)

        this.#setupCells()
        this.#drawCells()
        this.simulationDelay = 1

        this.context.scale(1,-1)
        this.context.translate(0,-this.height)
    }

    #setupCells() {
        for (let y = 0; y < this.height; y++) {
            this.cells[y] = Array(this.width)
            for (let x = 0; x < this.width; x++) {
                const cell = new Cell()
                cell.vy = 0.0
                cell.rho = 1.0
                if (x == 0 || x == this.width - 1 || y == 0 || y == this.height - 1) {
                    cell.vx = (y / this.height) * 0.05
                }
                const vx2 = Math.pow(cell.vx, 2)
                const vy2 = Math.pow(cell.vy, 2)
                const eu2 = 1.0 - 1.5 * (vx2 + vy2)
                const Rho36 = cell.rho / 36.0

                cell.eq[Direction.C] = 16.0 * Rho36 * eu2
                cell.eq[Direction.N] = 4.0 * Rho36 * (eu2 + 3.0 * cell.vy + 4.5 * vy2)
                cell.eq[Direction.E] = 4.0 * Rho36 * (eu2 + 3.0 * cell.vx + 4.5 * vx2)
                cell.eq[Direction.S] = 4.0 * Rho36 * (eu2 - 3.0 * cell.vy + 4.5 * vy2)
                cell.eq[Direction.W] = 4.0 * Rho36 * (eu2 - 3.0 * cell.vx + 4.5 * vx2)
                cell.eq[Direction.NE] = Rho36 * (eu2 + 3.0 * (cell.vx + cell.vy) + 4.5 * (cell.vx + cell.vy) * (cell.vx + cell.vy));
                cell.eq[Direction.SE] = Rho36 * (eu2 + 3.0 * (cell.vx - cell.vy) + 4.5 * (cell.vx - cell.vy) * (cell.vx - cell.vy));
                cell.eq[Direction.SW] = Rho36 * (eu2 + 3.0 * (-cell.vx - cell.vy) + 4.5 * (cell.vx + cell.vy) * (cell.vx + cell.vy));
                cell.eq[Direction.NW] = Rho36 * (eu2 + 3.0 * (-cell.vx + cell.vy) + 4.5 * (-cell.vx + cell.vy) * (-cell.vx + cell.vy));

                // cell.in = [...cell.eq]
                cell.in[Direction.E] = cell.eq[Direction.E]
                cell.in[Direction.NE] = cell.eq[Direction.NE]
                cell.in[Direction.SE] = cell.eq[Direction.SE]
                cell.in[Direction.W] = cell.eq[Direction.W]
                cell.in[Direction.SW] = cell.eq[Direction.SW]
                cell.in[Direction.NW] = cell.eq[Direction.NW]
                cell.in[Direction.N] = cell.eq[Direction.N]
                cell.in[Direction.S] = cell.eq[Direction.S]

                this.cells[y][x] = cell
            }
        }
    }

    simulationStep(): void {
        this.#collision()
        this.#streaming()
        this.#drawCells()
        this.#drawLines()
    }

    #streaming() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // streaming
                this.cells[y][x].in[Direction.C] = this.cells[y][x].out[Direction.C];
                if (x < this.width - 1) // EW
                {
                    this.cells[y][x].in[Direction.W] = this.cells[y][x + 1].out[Direction.W];
                    this.cells[y][x + 1].in[Direction.E] = this.cells[y][x].out[Direction.E];
                }
                if (y < this.height - 1) // NS
                {
                    this.cells[y][x].in[Direction.S] = this.cells[y + 1][x].out[Direction.S];
                    this.cells[y + 1][x].in[Direction.N] = this.cells[y][x].out[Direction.N];
                }
                if (x < this.width - 1 && y < this.height - 1) //D1
                {
                    this.cells[y][x].in[Direction.SW] = this.cells[y + 1][x + 1].out[Direction.SW];
                    this.cells[y + 1][x + 1].in[Direction.NE] = this.cells[y][x].out[Direction.NE];
                }
                if (x > 0 && y < this.height - 1) // D2
                {
                    this.cells[y][x].in[Direction.SE] = this.cells[y + 1][x - 1].out[Direction.SE];
                    this.cells[y + 1][x - 1].in[Direction.NW] = this.cells[y][x].out[Direction.NW];
                }
                // boundary conditions
                if (x == 0 || x == this.width - 1 || y == 0 || y == this.height - 1) {
                    this.cells[y][x].in[Direction.E] = this.cells[y][x].out[Direction.E];
                    this.cells[y][x].in[Direction.NE] = this.cells[y][x].out[Direction.NE];
                    this.cells[y][x].in[Direction.SE] = this.cells[y][x].out[Direction.SE];
                    this.cells[y][x].in[Direction.W] = this.cells[y][x].out[Direction.W];
                    this.cells[y][x].in[Direction.SW] = this.cells[y][x].out[Direction.SW];
                    this.cells[y][x].in[Direction.NW] = this.cells[y][x].out[Direction.NW];
                    this.cells[y][x].in[Direction.N] = this.cells[y][x].out[Direction.N];
                    this.cells[y][x].in[Direction.S] = this.cells[y][x].out[Direction.S];
                }
            }
        }
    }

    #collision() {
        const tau = 1.0
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // macroscopic density and velosity for the current cell
                const cell = this.cells[y][x]
                cell.rho = cell.in[Direction.C] + cell.in[Direction.E] + cell.in[Direction.W] + cell.in[Direction.S] + cell.in[Direction.N] +
                    cell.in[Direction.NE] + cell.in[Direction.NW] + cell.in[Direction.SE] + cell.in[Direction.SW]
                cell.vx = (cell.in[Direction.E] + cell.in[Direction.SE] + cell.in[Direction.NE] - cell.in[Direction.W] - cell.in[Direction.SW] -
                    cell.in[Direction.NW]) / cell.rho
                cell.vy = (cell.in[Direction.N] + cell.in[Direction.NW] + cell.in[Direction.NE] - cell.in[Direction.S] - cell.in[Direction.SW] -
                    cell.in[Direction.SE]) / cell.rho
                // equillibrum function
                const vx2 = cell.vx * cell.vx;
                const vy2 = cell.vy * cell.vy;
                const eu2 = 1.0 - 1.5 * (vx2 + vy2)
                const Rho36 = cell.rho / 36.0;
                cell.eq[Direction.C] = 16.0 * Rho36 * eu2;
                cell.eq[Direction.N] = 4.0 * Rho36 * (eu2 + 3.0 * cell.vy + 4.5 * vy2)
                cell.eq[Direction.E] = 4.0 * Rho36 * (eu2 + 3.0 * cell.vx + 4.5 * vx2)
                cell.eq[Direction.S] = 4.0 * Rho36 * (eu2 - 3.0 * cell.vy + 4.5 * vy2)
                cell.eq[Direction.W] = 4.0 * Rho36 * (eu2 - 3.0 * cell.vx + 4.5 * vx2)
                cell.eq[Direction.NE] = Rho36 * (eu2 + 3.0 * (cell.vx + cell.vy) + 4.5 * (cell.vx + cell.vy) * (cell.vx + cell.vy))
                cell.eq[Direction.SE] = Rho36 * (eu2 + 3.0 * (cell.vx - cell.vy) + 4.5 * (cell.vx - cell.vy) * (cell.vx - cell.vy))
                cell.eq[Direction.SW] = Rho36 * (eu2 + 3.0 * (-cell.vx - cell.vy) + 4.5 * (cell.vx + cell.vy) * (cell.vx + cell.vy))
                cell.eq[Direction.NW] = Rho36 * (eu2 + 3.0 * (-cell.vx + cell.vy) + 4.5 * (-cell.vx + cell.vy) * (-cell.vx + cell.vy))
                // relaxation - output function
                cell.out[Direction.C] = cell.in[Direction.C] + (cell.eq[Direction.C] - cell.in[Direction.C]) / tau
                cell.out[Direction.E] = cell.in[Direction.E] + (cell.eq[Direction.E] - cell.in[Direction.E]) / tau
                cell.out[Direction.W] = cell.in[Direction.W] + (cell.eq[Direction.W] - cell.in[Direction.W]) / tau
                cell.out[Direction.S] = cell.in[Direction.S] + (cell.eq[Direction.S] - cell.in[Direction.S]) / tau
                cell.out[Direction.N] = cell.in[Direction.N] + (cell.eq[Direction.N] - cell.in[Direction.N]) / tau
                cell.out[Direction.SE] = cell.in[Direction.SE] + (cell.eq[Direction.SE] - cell.in[Direction.SE]) / tau
                cell.out[Direction.NE] = cell.in[Direction.NE] + (cell.eq[Direction.NE] - cell.in[Direction.NE]) / tau
                cell.out[Direction.SW] = cell.in[Direction.SW] + (cell.eq[Direction.SW] - cell.in[Direction.SW]) / tau
                cell.out[Direction.NW] = cell.in[Direction.NW] + (cell.eq[Direction.NW] - cell.in[Direction.NW]) / tau
            }
        }
    }

    #drawCells() {
        // this.clearWithColor()
        let s = 0
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
                    color[2] = (1.0 - sum) * 255;
                    color[1] = color[2];
                }
                this.drawPixel(x, y, color)
            })
        })
        console.log(s)
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
                this.context.moveTo(x, y);
                this.context.lineTo(x + cell.vx * arrowLength, y + cell.vy * arrowLength);
                this.context.stroke();
            }
        }

        this.#drawParticle(0.9, 0.005, "blue")
        this.#drawParticle(0.4, 0.002, "yellow")
        this.#drawParticle(0.0, 0.000, "green")
    }

    #drawParticle(mu: number, grav: number, color: string = "black") {
        this.context.lineWidth = 1
        this.context.strokeStyle = color
        let xpart0, xpart1, ypart0, ypart1;
        let vxpart0, vxpart1, vypart0, vypart1;
        const epsilon = 1e-4
        for (let iterp = 1; iterp <= 5; iterp++) {
            xpart0 = xpart1 = 0.0
            ypart0 = ypart1 = iterp * this.width / 5 - 1.0;
            vxpart0 = this.cells[Math.floor(ypart0)][Math.floor(xpart0)].vx
            vypart0 = this.cells[Math.floor(ypart0)][Math.floor(xpart0)].vy;

            this.context.beginPath()
            this.context.moveTo(xpart0, ypart0)

            while (xpart1 < this.width - 1 && ypart1 > 0.0 && ypart1 <= this.height - 1 && xpart1 >= 0.0) {
                vxpart1 = mu * vxpart0 + (1.0 - mu) * this.cells[Math.floor(ypart0)][Math.floor(xpart0)].vx;
                vypart1 = mu * vypart0 + (1.0 - mu) * this.cells[Math.floor(ypart0)][Math.floor(xpart0)].vy - grav;
                xpart1 = xpart0 + 100. * (vxpart0 + vxpart1) / 2.0;
                ypart1 = ypart0 + 100. * (vypart0 + vypart1) / 2.0;
                vxpart0 = vxpart1;
                vypart0 = vypart1;
                this.context.lineTo(xpart1, ypart1)

                if (Math.abs(xpart1 - xpart0) <= epsilon && Math.abs(ypart1 - ypart0) < epsilon) {
                    break
                }

                xpart0 = xpart1;
                ypart0 = ypart1;
            }
            this.context.stroke()
        }
    }

}