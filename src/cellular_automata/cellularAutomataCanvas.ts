import Canvas from "../image_transfrom/canvas.js"

export default class CellularAutomataCanvas extends Canvas {
    tiles: boolean[][]
    width: number
    height: number
    tileSize: number

    constructor(width: number = 50, height: number = 50, tileSize: number = 10) {
        super(width * tileSize, height * tileSize)
        this.width = width
        this.height = height
        this.tileSize = tileSize
        this.tiles = Array(height).fill(Array(width).fill(false))
    }

    drawTiles() {
        const tileSize = this.tileSize
        this.tiles.forEach((row, y) =>
            row.forEach((isAlive, x) => {
                this.ctx.fillStyle = isAlive ? "red" : "white"
                this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
            })
        )
    }
}