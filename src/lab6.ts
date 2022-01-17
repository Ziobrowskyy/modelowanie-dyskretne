import {LGA} from "./LGA.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = new LGA()
    const simulationStepDelayInput = document.body.querySelector("#simulation-step-delay-input") as HTMLInputElement
    const simulationStepButton = document.body.querySelector("#simulation-step-button") as HTMLButtonElement
    const simulationRunButton = document.body.querySelector("#simulation-run-button") as HTMLButtonElement

    document.body.append(canvas.wrapper)

    const getSimulationStepDelay = () => Number(simulationStepDelayInput.value)

    const setSimulation = (value: boolean) => {
        if (value)
            canvas.runSimulation()
        else
            canvas.stopSimulation()
        simulationRunButton.innerText = value ? "Stop simulation" : "Run simulation"
    }

    simulationStepDelayInput.addEventListener("input", () => {
        const newDelay = getSimulationStepDelay()
        console.log(`Simulation step delay ${newDelay}`)
        canvas.simulationDelay = newDelay
    })

    simulationStepButton.addEventListener("mousedown", () => {
        console.log(`Simulation step`)
        setSimulation(false)
        canvas.simulationStep()
    })

    simulationRunButton.addEventListener("mousedown", () => {
        setSimulation(!canvas.isRunning)
    })

})
