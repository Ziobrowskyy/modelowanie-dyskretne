import Tile from "./tile.js";

export default class CellularAutomata {
    height: number
    width: number
    wrapper: HTMLDivElement = document.createElement("div")
    board: HTMLDivElement = document.createElement("div")
    tiles: Tile[][]

    constructor(width: number, height: number,) {
        this.width = width
        this.height = height

        this.board.classList.add("board")
        this.board.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`
        this.board.style.gridTemplateRows = `repeat(${this.height}, 1fr)`

        this.wrapper.classList.add("board-wrapper")
        this.wrapper.append(this.board)

        this.tiles = new Array(this.height)
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = new Array(this.width)
            for (let x = 0; x < this.width; x++) {
                const tile = new Tile()
                this.tiles[y][x] = tile
                this.board.append(tile.div)
            }
        }
    }
}