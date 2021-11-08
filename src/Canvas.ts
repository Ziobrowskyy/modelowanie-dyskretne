import {ColorArray} from "./utils";

export default abstract class Canvas {
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
    simulationDelay: number = 100

    constructor(width: number, height: number, renderWidth: number, renderHeight: number) {
        this.width = width
        this.height = height
        this.renderWidth = renderWidth
        this.renderHeight = renderHeight

        this.wrapper = document.createElement("div")
        this.wrapper.classList.add("canvas-wrapper")

        this.canvas = document.createElement("canvas")
        this.canvas.width = this.renderWidth
        this.canvas.height = this.renderHeight
        this.canvas.style.width = this.width + "px"
        this.canvas.style.height = this.height + "px"
        this.context = this.canvas.getContext("2d")!
        this.canvasImageData = this.context.getImageData(0, 0, this.renderWidth, this.renderHeight)

        this.wrapper.append(this.canvas)
    }

    drawPixel(x: number, y: number, color: ColorArray) {
        this.canvasImageData.data.set(color, (y * this.renderWidth + x) * 4)
    }

    updatePixels() {
        this.context.putImageData(this.canvasImageData, 0, 0)
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
        }, this.simulationDelay)
    }

    stopSimulation() {
        if (!this.isRunning)
            return
        this.isRunning = false
        clearInterval(this.simulationInterval)
    }
}