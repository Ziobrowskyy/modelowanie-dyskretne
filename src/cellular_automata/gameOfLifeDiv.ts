import GameOfLife from "./gameOfLife.js";
import Tile from "./tile.js";

export default class GameOfLifeDiv extends GameOfLife {
    tileDivs: Tile[][]

    constructor(width: number, height: number, simulationStepDelay: number) {
        super(width, height, simulationStepDelay)

        this.board.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`
        this.board.style.gridTemplateRows = `repeat(${this.height}, 1fr)`

        let wasRunning: boolean
        this.board.addEventListener("mousedown", () => {
            wasRunning = this.isRunning
            if (wasRunning) {
                this.stopSimulation()
            }
        })
        this.board.addEventListener("mouseup", () => {
            if (wasRunning)
                this.runSimulation()
        })

        this.tileDivs = this.tiles.map(row => row.map(isActive => {
            const tile = new Tile(isActive)
            this.board.append(tile.div)
            return tile
        }))
    }

    simulationStep() {
        const oldTiles = this.tiles.map(row => [...row])

        this.tiles = oldTiles.map((row, y) =>
            row.map((wasAlive, x) => {
                const n = this.getNeighbours(x, y, oldTiles)
                const isAlive = (n === 2 && wasAlive) || n === 3
                this.tileDivs[y][x].isActive = isAlive
                return isAlive
            }))
    }

    clearGrid(): void {
        super.clearGrid()
        this.tileDivs.forEach(row => row.forEach(tile => tile.isActive = false))
    }
}
