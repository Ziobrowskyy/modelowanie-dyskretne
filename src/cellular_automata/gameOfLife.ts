import CellularAutomata from "./cellularAutomata.js";
import Utils from "../utils.js";

export default abstract class GameOfLife extends CellularAutomata<boolean> {
    tiles: boolean[][]
    #simulationStepDelay: number
    #simulationInterval?: number
    isRunning: boolean = false

    protected constructor(width: number, height: number, simulationStepDelay: number) {
        super(width, height)
        this.#simulationStepDelay = simulationStepDelay

        this.tiles = Array(this.height)
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = Array(this.width)
            for (let x = 0; x < this.width; x++)
                this.tiles[y][x] = Math.random() > 0.5
        }
    }

    set simulationStepDelay(value: number) {
        this.#simulationStepDelay = value
        if (!this.isRunning)
            return
        this.stopSimulation()
        this.runSimulation()
    }

    clearGrid() {
        this.tiles = this.tiles.map(_ => Array(this.width).fill(false))
    }

    getNeighbours(x: number, y: number, tiles: boolean[][]) {
        let sum = 0
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dy === 0 && dx === 0)
                    continue
                const wy = Utils.wrapValue(y + dy, 0, this.height)
                const wx = Utils.wrapValue(x + dx, 0, this.width)
                sum += tiles[wy][wx] ? 1 : 0
            }
        }
        return sum
    }

    abstract simulationStep(): void

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
}
