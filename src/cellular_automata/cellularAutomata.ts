import Tile from "./tile.js";

export default abstract class CellularAutomata<T> {
    height: number
    width: number
    wrapper: HTMLDivElement = document.createElement("div")
    board: HTMLDivElement = document.createElement("div")
    abstract tiles: T[][]

    protected constructor(width: number, height: number,) {
        this.width = width
        this.height = height

        this.board.classList.add("board")
        // this.board.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`
        // this.board.style.gridTemplateRows = `repeat(${this.height}, 1fr)`

        this.wrapper.classList.add("board-wrapper")
        this.wrapper.append(this.board)
    }
}