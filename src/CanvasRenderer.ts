import {ColorArray} from "./utils.js";

export default abstract class CanvasRenderer {
    width: number
    height: number
    renderWidth: number
    renderHeight: number

    wrapper: HTMLDivElement
    canvas: HTMLCanvasElement
    canvasImageData: ImageData
    context: CanvasRenderingContext2D

    simulationInterval?: number
    isRunning: boolean = false
    #simulationDelay: number = 100

    protected constructor(width: number, height: number, renderWidth: number, renderHeight: number) {
        this.width = width
        this.height = height
        this.renderWidth = renderWidth
        this.renderHeight = renderHeight

        this.wrapper = document.createElement("div")
        this.wrapper.classList.add("canvas-wrapper")

        this.canvas = document.createElement("canvas")
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.canvas.style.width = this.renderWidth + "px"
        this.canvas.style.height = this.renderHeight + "px"
        this.context = this.canvas.getContext("2d")!
        this.canvasImageData = this.context.getImageData(0, 0, this.width, this.height)

        this.wrapper.append(this.canvas)
    }

    set simulationDelay(value: number) {
        this.#simulationDelay = value
        if (!this.isRunning)
            return
        this.stopSimulation()
        this.runSimulation()
    }

    drawPixel(x: number, y: number, color: ColorArray) {
        this.canvasImageData.data.set(color, (y * this.width + x) * 4)
    }

    updatePixels() {
        this.context.putImageData(this.canvasImageData, 0, 0)
    }

    clearWithColor(color: ColorArray) {
        for (let i = 0; i < this.width * this.height * 4; i += 4) {
            this.canvasImageData.data.set(color, i)
        }
    }

    updateImage(imageData = this.canvasImageData, x: number = 0, y: number = 0) {
        this.context.putImageData(this.canvasImageData, x, y)
    }

    abstract simulationStep(): void;

    runSimulation() {
        if (this.isRunning)
            return
        this.isRunning = true
        this.simulationInterval = setInterval(() => {
            this.simulationStep()
        }, this.#simulationDelay)
    }

    stopSimulation() {
        if (!this.isRunning)
            return
        this.isRunning = false
        clearInterval(this.simulationInterval)
    }
}