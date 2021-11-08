export default class Utils {
    static clampValue(v: number, min: number, max: number) {
        if (v < min)
            return min
        if (v > max)
            return max
        return v
    }

    static wrapValue(v: number, min: number, max: number) {
        return (v + max) % max
    }
}
export type ColorArray = [r: number, g: number, b: number, a: number]

export class Color {
    static RED: ColorArray = [255, 0, 0, 255]
    static WHITE: ColorArray = [255, 255, 255, 255]
    static BLACK: ColorArray = [0, 0, 0, 255]
    static PURPLE: ColorArray = [103, 0, 150, 255]
    static LIGHT_PURPLE: ColorArray = [211, 146, 230, 255]
    static DARK_PURPLE: ColorArray = [166, 27, 133, 255]
}