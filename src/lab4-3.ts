// import GameOfLifeCanvas from "./cellular_automata/gameOfLifeCanvas.js";
import MetaBalls from "./meta_balls/MetaBalls.js";

document.addEventListener("DOMContentLoaded", () => {
    const simulationRunButton = document.querySelector("#simulation-run-button") as HTMLDivElement
    const metaBalls = new MetaBalls()

    simulationRunButton.addEventListener("mousedown", () => {
        // metaBalls.simulationStep()
        if (!metaBalls.isRunning)
            metaBalls.runSimulation()
        else
            metaBalls.stopSimulation()
    })

    document.body.append(metaBalls.wrapper)
})
