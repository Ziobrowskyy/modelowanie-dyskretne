import GameOfLife from "./cellular_automata/gameOfLife.js";
import GameOfLifeDiv from "./cellular_automata/gameOfLifeDiv.js";

declare global {
    interface Window {
        gameDiv: GameOfLife
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

    window.gameDiv = new GameOfLifeDiv(getGrid(), getGrid(), getSimulationStepDelay())
    document.body.append(window.gameDiv.wrapper)

    const setSimulation = (value: boolean) => {
        if (value)
            window.gameDiv.runSimulation()
        else
            window.gameDiv.stopSimulation()
        simulationRunButton.innerText = value ? "Stop simulation" : "Run simulation"
    }

    applyGridButton.addEventListener("mousedown", () => {
        console.log(`New grid is: ${getGrid()}`)
        setSimulation(false)
        window.gameDiv.wrapper.remove()
        window.gameDiv = new GameOfLifeDiv(getGrid(), getGrid(), getSimulationStepDelay())
        document.body.append(window.gameDiv.wrapper)
    })

    clearGridButton.addEventListener("mousedown", () => {
        console.log(`Clear grid`)
        setSimulation(false)
        window.gameDiv.clearGrid()
    })

    simulationStepDelayInput.addEventListener("input", () => {
        const newDelay = getSimulationStepDelay()
        console.log(`Simulation step delay ${newDelay}`)
        window.gameDiv.simulationStepDelay = newDelay
    })

    simulationStepButton.addEventListener("mousedown", () => {
        console.log(`Simulation step`)
        setSimulation(false)
        window.gameDiv.simulationStep()
    })

    simulationRunButton.addEventListener("mousedown", () => {
        setSimulation(!window.gameDiv.isRunning)
    })

})
