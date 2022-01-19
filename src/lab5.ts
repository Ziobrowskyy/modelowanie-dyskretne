import ForestFire from "./cellular_automata/ForestFire.js";


document.addEventListener("DOMContentLoaded", async () => {
    const simulationStepDelayInput = document.body.querySelector("#simulation-step-delay-input") as HTMLInputElement
    const simulationStepButton = document.body.querySelector("#simulation-step-button") as HTMLButtonElement
    const simulationRunButton = document.body.querySelector("#simulation-run-button") as HTMLButtonElement

    const getSimulationStepDelay = () => Number(simulationStepDelayInput.value)

    // preload image
    const img = new Image()
    img.src = "map.bmp"
    await img.decode()

    const forestFire = new ForestFire(img)
    document.body.append(forestFire.wrapper)

    const setSimulation = (value: boolean) => {
        if (value)
            forestFire.runSimulation()
        else
            forestFire.stopSimulation()
        simulationRunButton.innerText = value ? "Stop simulation" : "Run simulation"
    }

    simulationStepDelayInput.addEventListener("input", () => {
        const newDelay = getSimulationStepDelay()
        console.log(`Simulation step delay ${newDelay}`)
        forestFire.simulationDelay = newDelay
    })

    simulationStepButton.addEventListener("mousedown", () => {
        console.log(`Simulation step`)
        setSimulation(false)
        forestFire.simulationStep()
    })

    simulationRunButton.addEventListener("mousedown", () => {
        setSimulation(!forestFire.isRunning)
    })

})
