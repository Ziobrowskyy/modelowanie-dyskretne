import GameOfLife from "./cellular_automata/gameOfLife.js";

declare global {
    interface Window {
        game: GameOfLife
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const gridInput = document.body.querySelector("#grid-input") as HTMLInputElement
    const applyGridButton = document.body.querySelector("#apply-grid-button") as HTMLButtonElement
    const clearGridButton = document.body.querySelector("#clear-grid-button") as HTMLButtonElement
    const simulationStepDelayInput = document.body.querySelector("#simulation-step-delay-input") as HTMLInputElement
    const simulationStepButton = document.body.querySelector("#simulation-step-button") as HTMLButtonElement
    const simulationRunButton = document.body.querySelector("#simulation-run-button") as HTMLButtonElement

    const getGrid = () => Number(gridInput.value)
    const getSimulationStepDelay = () => Number(simulationStepDelayInput.value)

    window.game = new GameOfLife(getGrid(), getGrid(), getSimulationStepDelay())
    document.body.append(window.game.wrapper)

    const setSimulation = (value: boolean) => {
        if (value)
            window.game.runSimulation()
        else
            window.game.stopSimulation()
        simulationRunButton.innerText = value ? "Stop simulation" : "Run simulation"
    }

    applyGridButton.addEventListener("mousedown", () => {
        console.log(`New grid is: ${getGrid()}`)
        setSimulation(false)
        window.game.wrapper.remove()
        window.game = new GameOfLife(getGrid(), getGrid())
        document.body.append(window.game.wrapper)
    })

    clearGridButton.addEventListener("mousedown", () => {
        console.log(`Clear grid`)
        setSimulation(false)
        window.game.tiles.forEach(row => row.forEach(tile => tile.isActive = false))
    })

    simulationStepDelayInput.addEventListener("input", () => {
        const newDelay = getSimulationStepDelay()
        console.log(`Simulation step delay ${newDelay}`)
        window.game.simulationStepDelay = newDelay
    })

    simulationStepButton.addEventListener("mousedown", () => {
        console.log(`Simulation step`)
        setSimulation(false)
        window.game.simulationStep()
    })

    simulationRunButton.addEventListener("mousedown", () => {
        setSimulation(!window.game.isRunning)
    })

})
