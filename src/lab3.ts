import {Simulation} from "./cellular_automata/simulation.js";

declare global {
    interface Window {
        sim: Simulation
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ruleInput = document.body.querySelector("#rule-input") as HTMLInputElement
    const applyRuleButton = document.body.querySelector("#apply-rule-button") as HTMLButtonElement
    const gridInput = document.body.querySelector("#grid-input") as HTMLButtonElement
    const applyGridButton = document.body.querySelector("#apply-grid-button") as HTMLButtonElement

    const getRule = () => Number(ruleInput.value)
    const getGrid = () => Number(gridInput.value)

    window.sim = new Simulation(getRule(), 10)
    document.body.append(window.sim.wrapper)

    applyRuleButton.addEventListener("mousedown", () => {
        console.log(`New rule is: ${getRule()}`)

        window.sim.rule = getRule()
        window.sim.runSimulation()
    })

    applyGridButton.addEventListener("mousedown", () => {
        console.log(`New grid is: ${getGrid()}`)

        window.sim.wrapper.remove()
        window.sim = new Simulation(getRule(), getGrid())
        document.body.append(window.sim.wrapper)
        window.sim.runSimulation()
    })
})
