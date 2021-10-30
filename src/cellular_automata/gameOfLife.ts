import CellularAutomata from "./cellularAutomata.js";
import Utils from "../utils.js";

export default class GameOfLife extends CellularAutomata {
    isRunning: boolean = false
    #simulationInterval?: number
    #simulationStepDelay: number

    constructor(width: number = 50, height: number = width, simulationStepDelay: number = 100) {
        super(width, height)
        this.#simulationStepDelay = simulationStepDelay
        this.tiles.forEach(row => row.forEach(tile => {
            tile.isActive = Math.random() > 0.5
        }))
    }

    set simulationStepDelay(value: number) {
        this.#simulationStepDelay = value
        if (!this.isRunning)
            return
        this.stopSimulation()
        this.runSimulation()
    }


    runSimulation() {
        if (this.isRunning)
            return
        this.isRunning = true
        this.#simulationInterval = setInterval(() => {
            this.simulationStep()
        }, this.#simulationStepDelay)
    }

    stopSimulation() {
        if (!this.isRunning)
            return
        this.isRunning = false
        clearInterval(this.#simulationInterval)
    }

    getNeighbours(x: number, y: number, tiles: boolean[][]) {
        let sum = 0
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dy === 0 && dx === 0)
                    continue
                const wy = Utils.wrapValue(y + dy, 0, this.height)
                const wx = Utils.wrapValue(x + dx, 0, this.width)
                sum += Number(tiles[wy][wx])
            }
        }
        return sum
    }

    simulationStep() {
        const oldTiles = this.tiles.map(row => row.map(tile => tile.isActive))
        oldTiles.forEach((row, y) =>
            row.forEach((wasAlive, x) => {
                const n = this.getNeighbours(x, y, oldTiles)
                this.tiles[y][x].isActive = n === 2 && wasAlive || n === 3
            }))
    }
}
