import Canvas from "../Canvas.js";
import Utils, {Color, ColorArray, Vec2} from "../utils.js";

enum CellState {
    WATER,
    DEAD,
    LIVE,
    BURN,
}

export default class ForestFire extends Canvas {
    cells: CellState[][]
    cellsTerrain: number[][]
    cellsHumidity: number[][]

    igniteChance: number = 0.00001
    growChange: number = 0.001
    humidity: number = 0.5

    img: HTMLImageElement
    windAngle: number
    newAngle: number = 0
    #windDirection: Vec2 = new Vec2()
    wind: number[][]

    constructor(img: HTMLImageElement) {
        super(img.width, img.height, img.width, img.height)
        this.img = img
        this.simulationDelay = 16

        this.cells = Array(this.height)
        this.cellsTerrain = Array(this.height)
        this.cellsHumidity = Array(this.height)
        for (let y = 0; y < this.height; y++) {
            this.cells[y] = Array(this.width)
            this.cellsTerrain[y] = Array(this.width)
            this.cellsHumidity[y] = Array(this.width)
        }

        this.wind = Array(3)
        for (let y = -1; y <= 1; y++)
            this.wind[y] = Array(3)

        this.windAngle = Math.random() * Math.PI * 2
        // this.windDirection = new Vec2(1,0)
        this.windDirection = new Vec2(Math.cos(this.windAngle), Math.sin(this.windAngle))

        console.log(this.#windDirection)
        for (let y = -1; y <= 1; y++) {
            let a = ""
            for (let x = -1; x <= 1; x++)
                a += this.wind[y][x].toPrecision(3) + "\t"
            console.log(a)
        }

        this.getPixelsFromImage()
        this.#setPixelsHumidity()
        this.drawCells()
    }

    set windDirection(value: Vec2) {
        this.#windDirection = value.norm()
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                let v1 = new Vec2(x, y).norm()
                let x1 = v1.subVec(this.#windDirection).length()
                x1 = x1 > 1 ? x1 / 4 : 0
                this.wind[y][x] = x1
            }
        }
    }

    #setPixelsHumidity() {
        const humidityPasses = 20
        for (let i = 0; i < humidityPasses; i++) {
            console.log("humidity pass", i)
            this.cellsHumidity = this.cellsHumidity.map((row, y) =>
                row.map((cell, x) => {
                    let max = this.cellsHumidity[y][x]
                    if (max === 1.0)
                        return max
                    Utils.forEachNeighbour(this.cellsHumidity, x, y, (value) => {
                        max = Math.max(max, value * 0.95)
                    })
                    return max > 0.8 ? 0.8 : max
                })
            )
        }
    }

    getPixelsFromImage() {
        this.context.drawImage(this.img, 0, 0)
        const imgData = this.context.getImageData(0, 0, this.renderWidth, this.renderHeight).data
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const pixelValue = imgData[(y * this.width + x) * 4]
                if (pixelValue === 55) {
                    this.cells[y][x] = CellState.WATER
                    this.cellsHumidity[y][x] = 1
                    this.cellsTerrain[y][x] = 0
                } else {
                    this.cellsHumidity[y][x] = 0
                    this.cellsTerrain[y][x] = pixelValue / 255
                    if (Math.random() < this.cellsTerrain[y][x])
                        this.cells[y][x] = CellState.LIVE
                    else
                        this.cells[y][x] = CellState.DEAD
                }
            }
        }
    }

    simulationStep(): void {
        // update wind
        if (Math.random() < 0.01) {
            this.newAngle = Math.random() * Math.PI * 2
            console.log("new wind angle: " + this.newAngle)
        }
        this.windAngle += (this.windAngle - this.newAngle) * 0.1
        this.windDirection = new Vec2(Math.cos(this.windAngle), Math.sin(this.windAngle))

        // update cell state
        this.cells = this.cells.map((row, y) =>
            row.map((cellState, x) => {
                // lake tiles pog
                switch (cellState) {
                    case CellState.WATER:
                        return CellState.WATER
                    case CellState.BURN:
                        return CellState.DEAD
                    case CellState.LIVE:
                        let burnCount = 0
                        Utils.forEachNeighbour(this.cells, x, y, (state, nx, ny) => {
                            burnCount += state === CellState.BURN ? this.wind[ny][nx] : 0
                        })
                        const cellIgnitePenalty = (1 - this.cellsHumidity[y][x]) * (1 - this.cellsTerrain[y][x])
                        const burnProp = burnCount * (1 - this.cellsHumidity[y][x])//* cellIgnitePenalty
                        if (Math.random() < burnProp || Math.random() < this.igniteChance * cellIgnitePenalty)
                            return CellState.BURN
                        return cellState
                    case CellState.DEAD:
                        if (Math.random() < this.growChange * (1 + this.humidity))
                            return CellState.LIVE
                        return cellState
                }
            })
        )
        this.drawCells()
    }

    drawCells() {
        this.cells.forEach((row, y) => {
            row.forEach((cellState, x) => {
                // is this faster???
                let color: ColorArray
                switch (cellState) {
                    case CellState.WATER:
                        color = Color.BLUE
                        break
                    case CellState.DEAD:
                        color = Color.BLACK
                        break
                    case CellState.LIVE:
                        color = Color.GREEN
                        break
                    case CellState.BURN:
                        color = Color.RED
                        break
                }
                this.drawPixel(x, y, color)
                // log initial cell state, terrain and humidity with colors
                // const h = this.cellsHumidity[y][x]
                // const t = this.cellsTerrain[y][x]
                // const s = cellState === CellState.LIVE ? 255 : 0
                // this.drawPixel(x, y, [0, 0, h * 255, 255])
                // this.drawPixel(x, y, [0, t * 255, 0, 255])
                // this.drawPixel(x, y, [s, t * 255, h * 255, 255])
            })
        })
        this.updatePixels()
    }

}