import {map} from "./image_transfrom/map.js";
import Canvas from "./image_transfrom/canvas.js";
import ImageTransform from "./image_transfrom/imageTransform.js";

const height = map.length
const width = map[0].length

const defThreshold = 200
let binarizedMap = map.map((row) => row.map(v => ImageTransform.binarize(v, defThreshold)))

document.addEventListener("DOMContentLoaded", () => {

    const originalImageCanvas = new Canvas(width, height, ((x, y) => {
        const v = map[y][x]
        return [v, v, v, 255]
    }))
    originalImageCanvas.title = "Original image"

    const highPassFilterCanvas = new Canvas(width, height, ((x, y) => {
        const v = ImageTransform.upperFilter.apply(map, x, y)
        return [v, v, v, 255]
    }))
    highPassFilterCanvas.title = "High pass filter"

    const lowPassFilterCanvas = new Canvas(width, height, ((x, y) => {
        const v = ImageTransform.lowerFilter.apply(map, x, y)
        return [v, v, v, 255]
    }))
    lowPassFilterCanvas.title = "Low pass filter"

    const gaussFilterCanvas = new Canvas(width, height, ((x, y) => {
        const v = ImageTransform.gaussFilter.apply(map, x, y)
        return [v, v, v, 255]
    }))
    gaussFilterCanvas.title = "Gaussian filter"

    document.body.append(originalImageCanvas.wrapper, highPassFilterCanvas.wrapper, lowPassFilterCanvas.wrapper, gaussFilterCanvas.wrapper)

    const binarizedImageCanvas = new Canvas(width, height, ((x, y) => {
        const v = binarizedMap[y][x]
        return [v, v, v, 255]
    }))

    const erodeImageCanvas = new Canvas(width, height, ((x, y) => {
        const v = ImageTransform.erode(binarizedMap, x, y, defThreshold)
        return [v, v, v, 255]
    }))
    erodeImageCanvas.title = "Eroded"

    const dilateImageCanvas = new Canvas(width, height, ((x, y) => {
        const v = ImageTransform.dilate(binarizedMap, x, y, defThreshold)
        return [v, v, v, 255]
    }))
    dilateImageCanvas.title = "Dilated"

    document.body.append(binarizedImageCanvas.wrapper, erodeImageCanvas.wrapper, dilateImageCanvas.wrapper)

    binarizedImageCanvas.createInput("Select threshold", 0, 255, defThreshold)
    binarizedImageCanvas.inputListener = function (threshold) {
        binarizedMap = map.map(row => row.map(v => ImageTransform.binarize(v, threshold)))
        for (let x = 0; x < this.canvasWidth; x++) {
            for (let y = 0; y < this.canvasHeight; y++) {
                const v = binarizedMap[y][x]
                this.setCanvasPixel(x, y, [v, v, v, 255])

                const dv = ImageTransform.dilate(binarizedMap, x, y, threshold)
                dilateImageCanvas.setCanvasPixel(x, y, [dv, dv, dv, 255])

                const ev = ImageTransform.erode(binarizedMap, x, y, threshold)
                erodeImageCanvas.setCanvasPixel(x, y, [ev, ev, ev, 255])
            }
        }

        this.updateImage()
        dilateImageCanvas.updateImage()
        erodeImageCanvas.updateImage()
    }
})
