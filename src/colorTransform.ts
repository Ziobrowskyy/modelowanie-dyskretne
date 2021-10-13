export type ColorArray = [r: number, g: number, b: number, a: number]

export default class ColorTransform {
    static changeBrightness(v: number, b: number) {
        const value = v + b
        if (value < 0)
            return 0
        if (value > 255)
            return 255
        return value
    }

    static binarize(v: number, a: number) {
        return v <= a ? 0 : 255;
    }
}