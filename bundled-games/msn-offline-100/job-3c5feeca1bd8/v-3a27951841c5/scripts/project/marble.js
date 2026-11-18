// @ts-check
export class Marble {
    static NUMBER_OF_COLORS = 5;
    // The index of the marble.
    #index;
    // The color of the marble.
    #color;

    constructor(index, color) {
        this.#color = color;
        this.#index = index
    }

        /**
     * @returns {number}
     */
    get color() {
        return this.#color;
    }

        /**
     * @returns {number}
     */
    get index() {
        return this.#index;
    }
}