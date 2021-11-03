import GameOfLifeCanvas from "./cellular_automata/gameOfLifeCanvas.js";

declare global {
    interface Window {
        gameCanvas: GameOfLifeCanvas
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
    const setSimulation = (value: boolean) => {
        if (value)
            window.gameCanvas.runSimulation()
        else
            window.gameCanvas.stopSimulation()
        simulationRunButton.innerText = value ? "Stop simulation" : "Run simulation"
    }
    applyGridButton.addEventListener("mousedown", () => {
        console.log(`New grid is: ${getGrid()}`)
        setSimulation(false)
        window.gameCanvas.wrapper.remove()
        window.gameCanvas = new GameOfLifeCanvas(getGrid(), getGrid(), getSimulationStepDelay())
        document.body.append(window.gameCanvas.wrapper)
    })

    clearGridButton.addEventListener("mousedown", () => {
        console.log(`Clear grid`)
        setSimulation(false)
        window.gameCanvas.clearGrid()
    })

    simulationStepDelayInput.addEventListener("input", () => {
        const newDelay = getSimulationStepDelay()
        console.log(`Simulation step delay ${newDelay}`)
        window.gameCanvas.simulationStepDelay = newDelay
    })
    simulationStepButton.addEventListener("mousedown", () => {
        console.log(`Simulation step`)
        setSimulation(false)
        window.gameCanvas.simulationStep()
    })

    simulationRunButton.addEventListener("mousedown", () => {
        setSimulation(!window.gameCanvas.isRunning)
    })
    window.gameCanvas = new GameOfLifeCanvas(50,50, 100)
    document.body.append(window.gameCanvas.wrapper)
})
