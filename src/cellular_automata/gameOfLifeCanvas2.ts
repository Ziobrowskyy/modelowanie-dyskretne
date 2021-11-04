import Utils, {Color, ColorArray} from "../utils.js";
import CellularAutomata from "./cellularAutomata.js";

const TileActive = 8
type TileActive = 8
const TileInactive = 0
type TileInactive = 0
type TileState = TileActive | TileInactive | number

export default class GameOfLifeCanvas2 extends CellularAutomata<TileState> {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    canvasImageData: ImageData
    canvasHeight: number = 800
    canvasWidth: number = 800
    tiles: TileState[][]
    #simulationStepDelay: number
    #simulationInterval?: number
    isRunning: boolean = false
    colors: ColorArray[]

    constructor(width: number, height: number, simulationStepDelay: number) {
        super(width, height)
        console.log(TileActive)
        this.colors = Array(TileActive + 1)
        const colorDiff = [
            Color.LIGHT_PURPLE[0] - Color.DARK_PURPLE[0],
            Color.LIGHT_PURPLE[1] - Color.DARK_PURPLE[1],
            Color.LIGHT_PURPLE[2] - Color.DARK_PURPLE[2],
        ]
        for (let i = 0; i <= TileActive; i++) {
            const c = i / TileActive
            const r = Color.DARK_PURPLE[0] + colorDiff[0] * c
            const g = Color.DARK_PURPLE[1] + colorDiff[1] * c
            const b = Color.DARK_PURPLE[2] + colorDiff[2] * c
            this.colors[i] = [r, g, b, Math.floor(255 * c)]
        }

        this.#simulationStepDelay = simulationStepDelay
        this.canvas = document.createElement("canvas")
        this.canvas.width = width
        this.canvas.height = height
        this.canvas.id = "game-of-life-canvas"
        this.canvas.style.width = `${this.canvasWidth}px`
        this.canvas.style.height = `${this.canvasHeight}px`
        this.canvas.style.backgroundColor = `#000`
        this.board.append(this.canvas)

        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this))

        this.tiles = Array(this.height)
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = Array(this.width)
            for (let x = 0; x < this.width; x++)
                this.tiles[y][x] = Math.random() > 0.5 ? TileActive : TileInactive
        }

        this.ctx = this.canvas.getContext("2d")!
        this.canvasImageData = this.ctx.createImageData(width, height)
        this.drawTiles()
    }

    onMouseDown(e: MouseEvent) {
        const x = Math.floor(e.offsetX / this.canvasWidth * this.width)
        const y = Math.floor(e.offsetY / this.canvasHeight * this.height)
        for(let i = 0; i < this.height; i++) {
            this.tiles[y][i] = Math.random() > 0.5 ? TileActive : this.tiles[y][i]
            this.tiles[i][x] = Math.random() > 0.5 ? TileActive : this.tiles[i][x]
        }
    }

    drawTiles() {
        this.tiles.forEach((row, y) => row.forEach((tileState, x) => {
                const c = tileState === TileActive ? Color.WHITE : this.colors[tileState]
                this.drawPixel(x, y, c)
            }
        ))
        this.updatePixels()
    }

    drawPixel(x: number, y: number, color: ColorArray) {
        this.canvasImageData.data.set(color, (y * this.width + x) * 4)
    }

    updatePixels() {
        this.ctx.putImageData(this.canvasImageData, 0, 0)
    }

    clearGrid(): void {
        this.tiles = this.tiles.map(_ => Array(this.width).fill(TileInactive))
        this.drawTiles()
    }

    getNeighbours(x: number, y: number, tiles: TileState[][]) {
        let sum = 0
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dy === 0 && dx === 0)
                    continue
                const wy = Utils.wrapValue(y + dy, 0, this.height)
                const wx = Utils.wrapValue(x + dx, 0, this.width)
                sum += tiles[wy][wx] === TileActive ? 1 : 0
            }
        }
        return sum
    }

    simulationStep(): void {
        const oldTiles = this.tiles.map(row => [...row])
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const n = this.getNeighbours(x, y, oldTiles)
                const oldState = this.tiles[y][x]
                const isAlive = (n === 2 && oldState === TileActive) || n === 3
                const newState = isAlive ? TileActive : oldState - 1
                this.tiles[y][x] = newState >= 0 ? newState : TileInactive
            }
        }
        this.drawTiles()
    }

    set simulationStepDelay(value: number) {
        this.#simulationStepDelay = value
        if (!this.isRunning)
            return
        this.stopSimulation()
        this.runSimulation()
    }

    runSimulation() {
        if (this.isRunning)
            return
        this.isRunning = true
        this.#simulationInterval = setInterval(() => {
            this.simulationStep()
        }, this.#simulationStepDelay)
    }

    stopSimulation() {
        if (!this.isRunning)
            return
        this.isRunning = false
        clearInterval(this.#simulationInterval)
    }
}
