import Utils from "../utils.js";
import CellularAutomata from "./cellularAutomata.js";
import Tile from "./tile.js";

export default class Simulation1d extends CellularAutomata<Tile> {
    #rule: number = 0
    rulePatterns: boolean[] = Array(8).fill(false)
    tiles: Tile[][]

    constructor(rule: number = 60, grid: number = 100) {
        super(grid, grid)
        this.rule = rule
        this.tiles = Array(this.height)
        for(let y = 0; y < this.height; y++) {
            this.tiles[y] = Array(this.width)
            for (let x = 0; x < this.width; x++) {
                const tile = new Tile()
                this.tiles[y][x] = tile
                this.board.append(tile.div)
            }
        }
        this.tiles[0][Math.floor(this.width/2)].isActive = true
        this.board.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`
        this.board.style.gridTemplateRows = `repeat(${this.height}, 1fr)`
        this.runSimulation()
    }

    set rule(value: number) {
        this.#rule = value
        this.rulePatterns = value.toString(2).padStart(8, "0").split("").map(it => Boolean(Number(it))).reverse()
        console.log(this.rulePatterns)
    }

    get rule() {
        return this.#rule
    }

    getRuleIndex(x: number, y: number) {
        let idx = 0
        for (let i = 0; i <= 2; i++) {
            const tile = this.tiles[y][Utils.wrapValue(x + i, 0, this.width)]
            idx = (idx << 1) + (tile.isActive ? 1 : 0)
        }
        return idx
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