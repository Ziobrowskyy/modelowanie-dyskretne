import {Color, ColorArray} from "../utils.js";
import GameOfLife from "./gameOfLife.js";

export default class GameOfLifeCanvas extends GameOfLife {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    canvasImageData: ImageData
    canvasHeight: number = 800
    canvasWidth: number = 800

    isMousePressed: boolean = false
    wasRunning: boolean = false
    buttonPressed: 0 | 2 = 0

    constructor(width: number, height: number, simulationStepDelay: number) {
        super(width, height, simulationStepDelay)

        this.canvas = document.createElement("canvas")
        this.canvas.width = width
        this.canvas.height = height
        this.canvas.id = "game-of-life-canvas"
        this.canvas.style.width = `${this.canvasWidth}px`
        this.canvas.style.height = `${this.canvasHeight}px`
        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this))
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this))
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this))
        this.canvas.addEventListener("contextmenu", e => e.preventDefault())

        this.board.append(this.canvas)

        this.ctx = this.canvas.getContext("2d")!
        this.canvasImageData = this.ctx.createImageData(width, height)
        this.drawTiles()
    }

    #getGridPosition(mouseX: number, mouseY: number) {
        return {
            x: Math.floor(mouseX / this.canvasWidth * this.width),
            y: Math.floor(mouseY / this.canvasHeight * this.height)
        }
    }

    onMouseDown(e: MouseEvent) {
        if (e.button === 1)
            return
        this.isMousePressed = true
        this.wasRunning = this.isRunning
        this.buttonPressed = e.button === 0 ? 0 : 2
        const {x, y} = this.#getGridPosition(e.offsetX, e.offsetY)
        this.setTile(x, y, !e.ctrlKey && e.button !== 2)
        this.updatePixels()
        if (this.wasRunning)
            this.stopSimulation()
    }

    onMouseUp(e: MouseEvent) {
        this.isMousePressed = false
        if (this.wasRunning)
            this.runSimulation()
    }

    onMouseMove(e: MouseEvent) {
        if (!this.isMousePressed)
            return
        const {x, y} = this.#getGridPosition(e.offsetX, e.offsetY)
        this.setTile(x, y, !e.ctrlKey && this.buttonPressed !== 2)
        this.updatePixels()
    }

    setTile(x: number, y: number, value: boolean = true) {
        this.tiles[y][x] = value
        this.drawPixel(x, y, value ? Color.RED : Color.WHITE)
    }

    drawTiles() {
        this.tiles.forEach((row, y) => row.forEach((isAlive, x) => {
                const c = isAlive ? Color.RED : Color.WHITE
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
        super.clearGrid()
        this.drawTiles()
    }

    simulationStep(): void {
        const oldTiles = this.tiles.map(row => [...row])
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const n = this.getNeighbours(x, y, oldTiles)
                this.tiles[y][x] = (n === 2 && oldTiles[y][x]) || n === 3
            }
        }
        this.drawTiles()
    }

}
