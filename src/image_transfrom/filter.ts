import Utils from "../utils.js";

export class Filter {
    filter: number[][]
    filterSum: number

    constructor(filter: number[][]) {
        if(filter.length !== 3 || filter[0].length !== 3)
            throw "Invalid array length"
        this.filter = filter
        this.filterSum = filter.reduce((prev, curr) => {
            return prev + curr.reduce((p,c) => p + c, 0)
        },0)
    }

    apply(values: number[][], x: number, y: number) {
        let sum = 0
        for (let i = 0; i <= 2; i++) {
            for (let j = 0; j <= 2; j++) {
                const dx = Utils.clampValue(x + i - 1, 0, values[0].length-1)
                const dy = Utils.clampValue(y + j - 1, 0, values.length-1)
                sum += values[dy][dx] * this.filter[j][i]
            }
        }
        return sum / this.filterSum
    }

}