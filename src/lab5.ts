import ForestFire from "./cellular_automata/ForestFire.js";
import Canvas from "./Canvas.js";
import {Vector2} from "./utils.js";

let forestFire: ForestFire
let windCanvas: Canvas

class WindCanvas extends Canvas {
    wind: Vector2
    center: Vector2

    constructor() {
        super(100, 100, 100, 100)
        this.wind = new Vector2(1, 0).norm()
        this.center = new Vector2(this.width / 2, this.height / 2)
        console.log(this.wind)
        this.context.beginPath()
        this.context.moveTo(this.center.x, this.center.y)
        this.context.lineTo(this.center.x + this.center.x * this.wind.x, this.center.y + this.center.y * this.wind.y)
        this.context.closePath()
        this.context.stroke()
        this.runSimulation()
    }

    simulationStep(): void {
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const simulationStepDelayInput = document.body.querySelector("#simulation-step-delay-input") as HTMLInputElement
    const simulationStepButton = document.body.querySelector("#simulation-step-button") as HTMLButtonElement
    const simulationRunButton = document.body.querySelector("#simulation-run-button") as HTMLButtonElement

    const getSimulationStepDelay = () => Number(simulationStepDelayInput.value)

    // preload image
    const img = new Image()
    img.src = "map.bmp"
    await img.decode()

    forestFire = new ForestFire(img)
    document.body.append(forestFire.wrapper)

    windCanvas = new WindCanvas()
    document.body.append(windCanvas.wrapper)

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
