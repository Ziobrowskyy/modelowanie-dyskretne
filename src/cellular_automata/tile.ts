export default class Tile {
    div: HTMLDivElement
    #isActive: boolean = false

    constructor(isActive: boolean = false) {
        this.div = document.createElement("div")
        this.div.classList.add("tile")
        this.div.addEventListener("mouseenter", this.onMouseEnter.bind(this))
        this.div.addEventListener("mousedown", this.onMouseEnter.bind(this))

        this.isActive = isActive
    }

    set isActive(value: boolean) {
        this.#isActive = value
        this.div.classList.toggle("active", value)
    }

    get isActive() {
        return this.#isActive
    }

    onMouseEnter(e: MouseEvent) {
        if (e.buttons === 1) {
            this.isActive = !e.ctrlKey
        }
    }
}

