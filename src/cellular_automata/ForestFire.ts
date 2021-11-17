import Canvas from "../Canvas.js";
import Utils, {Color} from "../utils.js";
import ImageTransform from "../image_transfrom/imageTransform.js";

enum CellState {
    DEAD,
    LIVE,
    BURN,
    WATER
}

const img = new Image()
img.src = "map.bmp"
await img.decode()

export default class ForestFire extends Canvas {
    cells: CellState[][]

    igniteChance: number = 0.00001
    growChange: number = 0.001

    constructor() {
        super(img.width, img.height, img.width, img.height)
        // this.cells = Array(map.length)
        // for (let y = 0; y < this.renderHeight; y++) {
        //     this.cells[y] = Array(map[0].length)
        //     for (let x = 0; x < this.renderWidth; x++) {
        //         this.cells[y][x] = this.getCellState()
        //     }
        // }
        this.simulationDelay = 16

        this.cells = Array(this.height)
        for(let y = 0; y < this.height; y++)
            this.cells[y] = Array(this.width)

        this.getPixelsFromImage().then(() => {
            this.drawCells()
        })
    }

    async getPixelsFromImage() {
        const img = new Image()
        img.src = "map.bmp"
        await img.decode()
        this.context.drawImage(img, 0, 0)
        const imgData = this.context.getImageData(0, 0, this.renderWidth, this.renderHeight).data
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const pixelValue = imgData[(y * this.width + x) * 4]
                let cellState
                if (pixelValue === 55)
                    cellState = CellState.WATER
                else if (ImageTransform.binarize(pixelValue, 220) === 255 && Math.random() < 0.3)
                    cellState = CellState.LIVE
                else
                    cellState = CellState.DEAD
                // this.cells[y][x] = ImageTransform.binarize(imgData[(y * this.width + x) * 4], 60)
                this.cells[y][x] = cellState
            }
        }
    }

    getCellState() {
        const r = Math.random()
        if (r < 0.2)
            return CellState.DEAD
        if (r < 0.6)
            return CellState.LIVE
        return CellState.BURN
    }

    getBurningNeighbours(x: number, y: number, cells: CellState[][]) {
        // const nState = [0, 0, 0]
        let burnCount = 0
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0)
                    continue
                const wx = Utils.wrapValue(x + dx, 0, this.renderWidth)
                const wy = Utils.wrapValue(y + dy, 0, this.renderHeight)
                burnCount += cells[wy][wx] === CellState.BURN ? 1 : 0
                // nState[cells[wy][wx]]++
            }
        }
        return burnCount
        // return nState
    }

    simulationStep(): void {
        const oldCells = this.cells.map(row => [...row])

        this.cells = this.cells.map((row, y) =>
            row.map((cellState, x) => {
                // lake tiles pog
                if (cellState === CellState.WATER)
                    return CellState.WATER
                if (cellState === CellState.BURN)
                    return CellState.DEAD
                const burnCount = this.getBurningNeighbours(x, y, oldCells)
                // const [dead, live, burnCount] = this.getBurningNeighbours(x, y, oldCells)
                if (cellState === CellState.LIVE) {
                    if (burnCount > 0 || Math.random() < this.igniteChance)
                        return CellState.BURN
                    else
                        return CellState.LIVE
                }
                if (cellState === CellState.DEAD) {
                    if (Math.random() < this.growChange)
                        return CellState.LIVE
                    else
                        return CellState.DEAD
                }
                console.assert(true, "Not reached")
                return cellState
                // if (cellState === CellState.DEAD)
                //     if (Math.random() < 0.01)
                //         return CellState.LIVE
                //     else
                //         return CellState.DEAD
                // return cellState
                // const [dead, live, burn] = this.getNeighbours(x, y, oldCells)
                // if (cellState === CellState.LIVE)
                //     return Math.random() < this.igniteChance * (burn + 1) ? CellState.BURN : CellState.LIVE
                // return Math.random() < this.growChange ? CellState.LIVE : CellState.DEAD
            })
        )
        this.drawCells()
        // for (let y = 0; y < this.renderHeight; y++) {
        //     for (let x = 0; x < this.renderWidth; x++) {
        //         //TODO: Change state of cell
        //         const state = oldCells[y][x]
        //         const [dead, live, burn] = this.getNeighbours(x,y, oldCells)
        //
        //     }
        // }
    }

    drawCells() {
        this.cells.forEach((row, y) => {
            row.forEach((cellState, x) => {
                // let color = Color.BLACK
                // if(cellState === CellState.LIVE)
                //     color = Color.GREEN
                // if(cellState === CellState.BURN)
                //     color = Color.RED
                const color = cellState === CellState.WATER ? Color.BLUE : cellState === CellState.DEAD ? Color.BLACK : cellState === CellState.LIVE ? Color.GREEN : Color.RED
                this.drawPixel(x, y, color)
            })
        })
        this.updatePixels()
    }

}