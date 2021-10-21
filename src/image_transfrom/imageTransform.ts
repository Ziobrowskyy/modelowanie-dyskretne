import {Filter} from "./filter.js";
import Utils from "../utils.js";

export type ColorArray = [r: number, g: number, b: number, a: number]

export default class ImageTransform {
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

    static erode(values: number[][], x: number, y: number, threshold: number = 200) {
        const dx = Utils.clampValue(x, 1, values[0].length - 2)
        const dy = Utils.clampValue(y, 1, values.length - 2)
        let value: number
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if(i === 0 && j === 0) {
                    value = this.binarize(values[dy + j][dx + i], threshold)
                    continue
                }

                const v = this.binarize(values[dy + j][dx + i], threshold)
                if (v < threshold)
                    return 0
            }
        }
        return value!
        // return values[y][x]
    }

    static dilatate(values: number[][], x: number, y: number, threshold: number = 127) {
        const dx = Utils.clampValue(x, 1, values[0].length - 2)
        const dy = Utils.clampValue(y, 1, values.length - 2)
        let value: number
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if(i === 0 && j === 0) {
                    value = this.binarize(values[dy + j][dx + i], threshold)
                    continue
                }
                const v = this.binarize(values[dy + j][dx + i], threshold)
                if (v > threshold)
                    return 255
            }
        }
        return value!
        // return values[y][x]
    }

    static lowerFilter = new Filter([
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ])

    static upperFilter = new Filter([
            [-1, -1, -1],
            [-1, 9, -1],
            [-1, -1, -1],
        ])

    static gaussFilter = new Filter([
            [1, 4, 1],
            [4, 32, 4],
            [1, 4, 1],
        ])
    }