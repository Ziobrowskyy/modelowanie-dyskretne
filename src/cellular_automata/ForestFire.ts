import Canvas from "../Canvas.js";
import Utils, {Color, ColorArray, Vector2} from "../utils.js";
import ImageTransform from "../image_transfrom/imageTransform.js";

enum CellState {
    WATER,
    DEAD,
    LIVE,
    BURN,
    BURNT,
    BURNT_MAX = 14
}

export default class ForestFire extends Canvas {
    cells: CellState[][]
    cellsTerrain: number[][]
    cellsHumidity: number[][]

    igniteChance: number = 0.0001
    growChange: number = 0.001
    humidity: number = 0.5

    img: HTMLImageElement
    #windDirection: Vector2 = new Vector2()
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

        this.windDirection = new Vector2(1, 0)

        console.table(this.wind)

        this.getPixelsFromImage()
        this.#setPixelsHumidity()
        this.drawCells()
    }

    set windDirection(value: Vector2) {
        this.#windDirection = value
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                let v1 = new Vector2(x, y).norm()
                let x1 = v1.sub(this.#windDirection).length()
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
                    Utils.forEachNeighbour(this.cellsHumidity, x, y, (value) => {
                        max = Math.max(max, value * 0.90)
                    })
                    return max
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
                        // if (ImageTransform.binarize(pixelValue, 220) == 255 && Math.random() < 0.3)
                        this.cells[y][x] = CellState.LIVE
                    else
                        this.cells[y][x] = CellState.DEAD
                }
                // this.cells[y][x] = ImageTransform.binarize(imgData[(y * this.width + x) * 4], 60)
                // this.cells[y][x] = cellState
            }
        }
    }

    simulationStep(): void {
        this.cells = this.cells.map((row, y) =>
            row.map((cellState, x) => {
                // lake tiles pog
                switch (cellState) {
                    case CellState.WATER:
                        return CellState.WATER
                    case CellState.BURN:
                        return CellState.BURNT
                    // case CellState.BURNT:
                    //     return CellState.DEAD
                    case CellState.LIVE:
                        let burnCount = 0
                        Utils.forEachNeighbour(this.cells, x, y, (state, nx, ny) => {
                            burnCount += state === CellState.BURN ? this.wind[ny][nx] : 0
                        })
                        const cellIgnitePenalty = (1 - this.cellsHumidity[y][x]) * (1 - this.cellsTerrain[y][x])
                        const burnProp = burnCount * 4 * cellIgnitePenalty
                        if (Math.random() < burnProp || Math.random() < this.igniteChance * cellIgnitePenalty)
                            return CellState.BURN
                        else
                            return CellState.LIVE
                    case CellState.BURNT:
                    case CellState.DEAD:
                        if (Math.random() < this.growChange * (1 + this.humidity))
                            return CellState.LIVE
                        if (cellState === CellState.DEAD)
                            return CellState.DEAD
                        return cellState + 1
                    default:
                        if (Math.random() < this.growChange * (1 + this.humidity))
                            return CellState.LIVE
                        if (cellState === CellState.BURNT_MAX)
                            return CellState.DEAD
                        return cellState + 1
                }
            })
        )
        this.drawCells()
    }

    drawCells() {
        this.cells.forEach((row, y) => {
            row.forEach((cellState, x) => {
                // is this faster???
                // const color = cellState === CellState.WATER ? Color.BLUE : cellState === CellState.DEAD ? Color.BLACK : cellState === CellState.LIVE ? Color.GREEN : Color.RED
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
                    case CellState.BURNT:
                        color = Color.BROWN
                        break
                    default: // state between BURNT and MAX_BURNT
                        // const burntFactor = (CellState.MAX_BURNT - cellState) / CellState.MAX_BURNT
                        color = Color.BROWN
                    // color[0] *= burntFactor
                    // color[1] *= burntFactor
                    // color[2] *= burntFactor
                }
                this.drawPixel(x, y, color)
                // log initial cell state, terrain and humidity with colors
                // const h = this.cellsHumidity[y][x]
                // const t = this.cellsTerrain[y][x]
                // const s = cellState === CellState.LIVE ? 255 : 0
                // this.drawPixel(x, y, [s, t * 255, h * 255, 255])
            })
        })
        this.updatePixels()
    }

}