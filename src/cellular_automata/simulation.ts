import Utils from "../utils.js";
import Tile from "./tile.js";

export class Simulation {
    height: number = 100
    width: number = 100
    wrapper: HTMLDivElement = document.createElement("div")
    board: HTMLDivElement = document.createElement("div")
    tiles: Tile[][]

    rule: number
    rulePatterns: boolean[]

    constructor(rule: number = 60) {
        this.rule = rule
        this.rulePatterns = rule.toString(2).padStart(7, "0").split("").map(it => Boolean(Number(it))).reverse()

        console.log(this.rule)
        console.log(this.rule.toString(2))
        console.log(this.rulePatterns)

        this.board.classList.add("board")
        this.board.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`
        this.board.style.gridTemplateRows = `repeat(${this.height}, 1fr)`

        this.wrapper.classList.add("board-wrapper")
        this.wrapper.append(this.board)


        this.tiles = new Array(this.height)
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = new Array(this.width)
            for (let x = 0; x < this.width; x++) {
                const tile = new Tile()
                this.tiles[y][x] = tile
                this.board.append(tile.div)
            }
        }

        this.tiles[0][this.width / 2].isActive = true
        this.runSimulation()
    }

    getRuleIndex(x: number, y: number) {
        const tiles: Tile[] = []
        for (let i = x; i <= x + 2; i++) {
            tiles.push(this.tiles[y][Utils.wrapValue(i, 0, this.width)])
        }
        const tilesBinarized = tiles.map(tile => tile.isActive ? "1" : "0").join("")
        return parseInt(tilesBinarized, 2)
    }

    simulationStep(step: number) {
        for (let i = 0; i < this.width; i++) {
            const ruleIdx = this.getRuleIndex(i - 1, step)
            this.tiles[step + 1][i].isActive = this.rulePatterns[ruleIdx]
        }
    }

    runSimulation() {
        for (let step = 0; step < this.height - 1; step++) {
            this.simulationStep(step)
        }
    }
}