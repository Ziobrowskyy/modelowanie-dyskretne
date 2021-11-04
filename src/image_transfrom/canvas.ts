import {ColorArray} from "../utils";

export default class Canavs {
    wrapper: HTMLDivElement
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    canvasImageData: ImageData
    input?: HTMLInputElement
    inputValueSpan?: HTMLSpanElement
    inputListener?: (value: number) => any
    titleHeading: HTMLHeadingElement

    constructor(public canvasWidth: number = 100, public canvasHeight: number = 100, pixelGetter?: (x: number, y: number) => ColorArray) {
        this.canvas = document.createElement("canvas")
        this.canvas.width = canvasWidth
        this.canvas.height = canvasHeight
        this.ctx = this.canvas.getContext("2d")!
        this.canvasImageData = this.ctx.createImageData(canvasWidth, canvasHeight)

        this.titleHeading = document.createElement("h3")
        this.titleHeading.classList.toggle("hidden")

        this.wrapper = document.createElement("div")
        this.wrapper.classList.add("canvas-wrapper")

        this.wrapper.append(this.titleHeading, this.canvas)

        if (!pixelGetter)
            return
        for (let x = 0; x < canvasWidth; x++) {
            for (let y = 0; y < canvasHeight; y++) {
                const v = pixelGetter(x, y)
                this.setCanvasPixel(x, y, v)
            }
        }
        this.updateImage()
    }

    async setCanvasImage(src: string) {
        const img = new Image()
        img.src = src
        await img.decode()
        this.ctx.drawImage(img, 0, 0)
    }

    get pixels(): number[][] {
        return new Array(this.canvasHeight).fill(
            (y: number) => Array(this.canvasWidth).fill(
                (x: number) => this.getCanvasPixel(x, y)
            ))
    }

    setCanvasPixel(x: number, y: number, color: ColorArray) {
        const idx = (x + y * this.canvasWidth) * 4
        this.canvasImageData.data[idx] = color[0]
        this.canvasImageData.data[idx + 1] = color[1]
        this.canvasImageData.data[idx + 2] = color[2]
        this.canvasImageData.data[idx + 3] = color[3]
    }

    getCanvasPixel(x: number, y: number): ColorArray {
        const idx = (x + y * this.canvasWidth) * 4
        return this.canvasImageData.data.slice(idx, idx + 4) as unknown as ColorArray
    }

    updateImage(imageData = this.canvasImageData, x: number = 0, y: number = 0) {
        this.ctx.putImageData(this.canvasImageData, x, y)
    }

    set title(title: string) {
        this.titleHeading.innerText = title
        this.titleHeading.classList.toggle("hidden")
    }

    createInput(label: string, min: number, max: number, def: number = 0) {
        this.input = document.createElement("input")
        this.input.type = "range"
        this.input.min = String(min)
        this.input.max = String(max)
        this.input.defaultValue = String(def)

        const inputLabel = document.createElement("label")
        inputLabel.textContent = `${label}. Current value: `

        this.inputValueSpan = document.createElement("span")
        this.inputValueSpan.style.width = "40px"
        this.inputValueSpan.style.display = "inline-block"
        this.inputValueSpan.textContent = String(def)
        inputLabel.append(this.inputValueSpan)

        const inputWrapper = document.createElement("div")
        inputWrapper.classList.add("input-wrapper")
        inputWrapper.append(inputLabel)
        inputWrapper.append(this.input)

        this.wrapper.append(inputWrapper)

        this.input.addEventListener("change", this.onInputChange.bind(this))
    }

    private onInputChange(event: Event) {
        if (!this.input || !this.inputValueSpan)
            return
        if (event.target !== this.input)
            throw "Event target does not match valid input element of this object."

        this.inputValueSpan.textContent = this.input.value
        console.log("new value is: " + this.input.value)

        this.inputListener?.(Number(this.input.value))
    }
}