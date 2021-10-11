import {map} from "./map"

const height = map.length
const width = map[0].length

type ColorArray = [r: number, g: number, b: number, a: number]

document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.querySelector("#canvas") as HTMLCanvasElement

    canvas.style.height = 2 * height + "px"
    canvas.style.width = width + "px"
    canvas.height = 2 * height
    canvas.width = width

    const ctx = canvas.getContext("2d")!

    const originalBitmap = createBitmap(ctx, (index) => {
        const i = Math.floor(index / 4)
        const x = i % width
        const y = Math.floor(i / width)
        const value = map[y][x]
        return [value, value, value, 255]
    })

    ctx.putImageData(originalBitmap, 0, 0)

    const setTransformedBitmap = (brightness: number = 0) => {
        const newBitmap = createBitmap(ctx, (index) => {
            const valuesMapped = originalBitmap.data.slice(index, index + 3).map((it: number) => L(it, brightness))
            return [...valuesMapped, 255] as unknown as ColorArray
        })
        ctx.putImageData(newBitmap, 0, height)
    }

    setTransformedBitmap()

    const brightnessInput = document.querySelector("#brightness-input") as HTMLSpanElement
    const brightnessSpan = document.querySelector("#brightness-span") as HTMLInputElement

    brightnessInput.addEventListener("change", (e) => {
        const value = (e.target as HTMLInputElement).value
        brightnessSpan.innerText = value
        setTransformedBitmap(Number(value))
    })

})

const L = (v: number, b: number) => {
    const value = v + b
    if (value < 0)
        return 0
    if (value > 255)
        return 255
    return value
}

const createBitmap = (ctx: CanvasRenderingContext2D, colorGetter: (index: number) => ColorArray) => {
    const bitmap = ctx.createImageData(width, height)

    for (let i = 0; i < bitmap.data.length; i += 4) {
        const [r, g, b, a] = colorGetter(i)
        bitmap.data[i] = r
        bitmap.data[i + 1] = g
        bitmap.data[i + 2] = b
        bitmap.data[i + 3] = a
    }
    return bitmap
}