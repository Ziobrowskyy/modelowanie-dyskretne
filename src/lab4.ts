import GameOfLife from "./cellular_automata/gameOfLife.js";

declare global {
    interface Window {
        game: GameOfLife
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const gridInput = document.body.querySelector("#grid-input") as HTMLButtonElement
    const applyGridButton = document.body.querySelector("#apply-grid-button") as HTMLButtonElement
    const simulationRunButton = document.body.querySelector("#simulation-run-button") as HTMLButtonElement

    const getGrid = () => Number(gridInput.value)

    window.game = new GameOfLife(5)
    document.body.append(window.game.wrapper)


    applyGridButton.addEventListener("mousedown", () => {
        console.log(`New grid is: ${getGrid()}`)

        window.game.wrapper.remove()
        window.game = new GameOfLife(getGrid(), getGrid())
        document.body.append(window.sim.wrapper)
    })

    simulationRunButton.addEventListener("mousedown", () => {
        if(window.game.isRunning)
        window.game.runSimulation()
    })


})
