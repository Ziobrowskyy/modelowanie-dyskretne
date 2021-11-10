import {map} from "./map.js"
import ImageTransform from "./image_transfrom/imageTransform.js";
import Canvas from "./image_transfrom/canvas.js";

const height = map.length
const width = map[0].length

document.addEventListener("DOMContentLoaded", () => {

    const originalImageCanvas = new Canvas(width, height, ((x, y) => {
        const v = map[y][x]
        return [v, v, v, 255]
    }))

    const brightnessCanvas = new Canvas(width, height, ((x, y) => {
        const v = map[y][x]
        return [v, v, v, 255]
    }))

    brightnessCanvas.createInput("Select brightness", -255, 255, 0)
    brightnessCanvas.inputListener = function (value) {
        for (let x = 0; x < this.canvasWidth; x++) {
            for (let y = 0; y < this.canvasHeight; y++) {
                const v = ImageTransform.changeBrightness(map[y][x], value)
                this.setCanvasPixel(x, y, [v, v, v, 255])
            }
        }
        this.updateImage()
    }

    const binarizationCanvas = new Canvas(width, height, ((x, y) => {
        const v = ImageTransform.binarize(map[y][x], 180)
        return [v, v, v, 255]
    }))

    binarizationCanvas.createInput("Select binarization threshold", 0, 255, 180)
    binarizationCanvas.inputListener = function (value) {
        for (let x = 0; x < this.canvasWidth; x++) {
            for (let y = 0; y < this.canvasHeight; y++) {
                const v = ImageTransform.binarize(map[y][x], value)
                this.setCanvasPixel(x, y, [v, v, v, 255])
            }
        }
        this.updateImage()
    }

    const histogramCanvas = document.createElement("canvas")
    histogramCanvas.height = 100
    histogramCanvas.width = 255
    histogramCanvas.style.height = 100 + "px"
    histogramCanvas.style.width = 255 + "px"

    generateHistogram(brightnessCanvas.canvasImageData, histogramCanvas.getContext("2d")!)

    document.body.append(brightnessCanvas.wrapper, binarizationCanvas.wrapper, histogramCanvas)
})

const generateHistogram = (imageData: ImageData, histogramCtx: CanvasRenderingContext2D) => {
    const colorMap = Array(255).fill(0)
    for (let i = 0; i < imageData.data.length; i += 4) {
        const avColor = imageData.data[i]
        // const avColor = image.data.slice(i, i + 3).reduce((prev, curr) => prev + curr, 0) / 4
        colorMap[Math.round(avColor)] += 1
    }
    const h = histogramCtx.canvas.height
    const w = histogramCtx.canvas.width
    const maxHeight = colorMap.reduce((prev, curr) => curr > prev ? curr : prev, 0)
    const barWidth = w / colorMap.length
    histogramCtx.fillStyle = "gray"
    histogramCtx.fillRect(0, 0, w, h)
    histogramCtx.fillStyle = "blue"
    colorMap.forEach((value, i) => {
        histogramCtx.fillRect(i * barWidth, h, barWidth, -(value / maxHeight) * h)
    })
}