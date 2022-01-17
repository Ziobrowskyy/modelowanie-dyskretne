import {LBM_FluidFlow} from "./LBM_FluidFLow.js";
import {Vec2} from "./utils.js";

enum Direction {
    C,
    N,
    NE,
    E,
    SE,
    S,
    SW,
    W,
    NW
}

function print(array: Vec2[] | number[]) {
    if (array.length !== 9) {
        console.warn("bad array length")
        return
    }
    const tab = Array(3)
    for (let y = 0; y < 3; y++) {
        tab[y] = Array(3)
    }
    const x = (v: Vec2 | number) => {
        if (v instanceof Vec2)
            return `${v.x.toPrecision(3)}, ${v.y.toPrecision(3)}`
        else
            return `${v.toPrecision(3)}`
    }
    tab[0][0] = x(array[Direction.NW])
    tab[0][1] = x(array[Direction.N])
    tab[0][2] = x(array[Direction.NE])
    tab[1][0] = x(array[Direction.W])
    tab[1][1] = x(array[Direction.C])
    tab[1][2] = x(array[Direction.E])
    tab[2][0] = x(array[Direction.SW])
    tab[2][1] = x(array[Direction.S])
    tab[2][2] = x(array[Direction.SE])
    console.table(tab)
}

document.addEventListener("DOMContentLoaded", () => {
    const rho0 = 100
    const tau = 0.6

    const NL = 9
    const Nx = 400
    const Ny = 100
    const idxs = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const cxs = [0, 0, 1, 1, 1, 0, -1, -1, -1]
    const cys = [0, 1, 1, 0, -1, -1, -1, 0, 1]
    const weights = [4 / 9, 1 / 9, 1 / 36, 1 / 9, 1 / 36, 1 / 9, 1 / 36, 1 / 9, 1 / 36]

    // let F = [...Array(NL).keys()].map(_ => 1 + Math.random() * 0.01)
    let F = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    let rho = F.reduce((p, c) => p + c)
    F = F.map((v) => v * rho0 / rho)


    // fluid vars
    rho = F.reduce((p, c) => p + c)
    let uxF = F.map((v, i) => v * cxs[i])
    let uyF = F.map((v, i) => v * cys[i])
    let ux = uxF.reduce((p, c) => p + c) / rho
    let uy = uyF.reduce((p, c) => p + c) / rho

    // collision
    console.log(F)
    let Feq = [...Array(NL).keys()].map(_ => 0)
    for (let i = 0; i < NL; i++) {
        const cx = cxs[i]
        const cy = cys[i]
        const w = weights[i]
        const a = 3 * (cx * ux + cy * uy)
        const b = 4.5 * Math.pow((cx * ux + cy * uy), 2)
        const c = 1.5 * (Math.pow(ux, 2) + Math.pow(uy, 2))
        Feq[i] = rho * w * (1 + a + b - c)
    }
    const rhoFeq = Feq.reduce((p, c) => p + c)
    console.log(Feq)

    F = F.map((v, i) => v - (1.0 / tau) * (v - Feq[i]))
    const rhoOut = F.reduce((p, c) => p + c)
    console.log(F)
    console.log(rho)
    console.log(rhoFeq)
    console.log(rhoOut)

    // return
    const canvas = new LBM_FluidFlow()
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
