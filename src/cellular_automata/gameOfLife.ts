import CellularAutomata from "./cellularAutomata.js";

export default class GameOfLife extends CellularAutomata {
    isRunning: boolean = false
    #simulationInterval?: number
    constructor(width: number = 50, height: number = width) {
        super(width, height)
        this.tiles.forEach(row => row.forEach(tile => {
            tile.isActive = Math.random() > 0.5
        }))
    }

    runSimulation() {
        if(this.isRunning)
            return
        this.isRunning = true
        this.#simulationInterval = setInterval(() => {
            this.simulationStep()
        }, 100)
    }

    stopSimulation() {
        if(!this.isRunning)
            return
        this.isRunning = false
        clearInterval(this.#simulationInterval)
    }

    simulationStep() {
        this.tiles.forEach(row => row.forEach(tile => {
            tile.isActive = Math.random() > 0.5
        }))
    }
}
