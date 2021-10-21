import {Simulation} from "./cellular_automata/simulation.js";

declare global {
    interface Window {
        sim: Simulation
    }
}

const sim = new Simulation()
window.sim = sim

document.addEventListener("DOMContentLoaded", () => {

    const ruleInput = document.body.querySelector("#rule-input") as HTMLInputElement
    const applyRuleButton = document.body.querySelector("#apply-rule-button") as HTMLButtonElement

    applyRuleButton.addEventListener("mousedown", () => {
        const rule = Number(ruleInput.value) || 26
        console.log(`New rule is: ${rule}`)

        sim.rule = rule
        sim.runSimulation()
    })

    document.body.append(sim.wrapper)
})