import {Simulation} from "./cellular_automata/simulation.js";

declare global {
    interface Window {
        sim: Simulation
    }
}

const sim = new Simulation()
window.sim = sim

document.addEventListener("DOMContentLoaded", () => {
    document.body.append(sim.wrapper)
})