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

    static forEachNeighbour<T>(array: T[][], x: number, y: number, f: (value: T, nx: number, ny: number) => void) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0)
                    continue
                const wy = this.wrapValue(y + dy, 0, array.length)
                const wx = this.wrapValue(x + dx, 0, array[wy].length)
                f(array[wy][wx], dx, dy)
            }
        }
    }

}
export type ColorArray = [r: number, g: number, b: number, a: number]

export class Color {
    static RED: ColorArray = [255, 0, 0, 255]
    static WHITE: ColorArray = [255, 255, 255, 255]
    static BLACK: ColorArray = [0, 0, 0, 255]
    static GRAY: ColorArray = [120, 120, 120, 255]
    static DARK_GRAY: ColorArray = [55, 55, 55, 255]
    static PURPLE: ColorArray = [103, 0, 150, 255]
    static GREEN: ColorArray = [0, 255, 0, 255]
    static BLUE: ColorArray = [66, 135, 245, 255]
    static BROWN: ColorArray = [89, 45, 21, 255]
    static LIGHT_PURPLE: ColorArray = [211, 146, 230, 255]
    static DARK_PURPLE: ColorArray = [166, 27, 133, 255]
}

export class Vector2 {
    x: number
    y: number

    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    copy(): Vector2 {
        return new Vector2(this.x, this.y)
    }

    filter(f: (v: Vector2) => boolean): Vector2 {
        return f(this) ? this.copy() : new Vector2
    }

    add(other: Vector2): Vector2 {
        return new Vector2(this.x + other.x, this.y + other.y)
    }

    sub(other: Vector2): Vector2 {
        return new Vector2(this.x - other.x, this.y - other.y)
    }

    dist(other: Vector2): number {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
    }

    length(): number {
        return Math.sqrt(Math.pow(this.x * this.x, 2) + Math.pow(this.y * this.y, 2))
    }

    norm(): Vector2 {
        const len = this.length()
        if (len > 0)
            return new Vector2(this.x / len, this.y / len)
        else return this.copy()
    }
}