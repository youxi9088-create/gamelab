// @ts-check
export class Move {
    // The pile from which we're moving.
    #initalPileIndex;
    // The last pile of the move.
    #lastPileIndex;    
    // Number of stones in the initial pile.
    #initialPileStones;
    // Number of stones in the store.
    #initialStoreStones;
    // Whether there is an extra move for the same player.
    #hasExtraMove;
    // Whether it is an eating move.
    #isEatingMove;
    // The pile that we're eating.
    #eatingPileIndex;
    // Number of stones in the eating pile before the move.
    #eatingPileInitialStones;
    
    // Number of stones eaten.
    #eatingPileEatenStones;
    // Whether this is an extra move after eating
    #isExtraMove

    /**
     * 
     * @param {number} initialPile The initial pile where the move is set.
     * @param {number} lastPile The last pile where the move ends.
     * @param {number} initialPileStones Number of stones in the initial pile before the move.
     * @param {number} initialStoreStones Number of stones in the store before the move.
     * @param {boolean} hasExtraMove Whether there is an extra move (if we ended in the store)
     * @param {boolean} isEatingMove Whether its an eating move (if we ended in an empty slot)
     * @param {number} eatingPileIndex The pile that the player "ate"
     * @param {number} eatingPileInitialStones Number of stones in the pile we ate before the move.
     * @param {boolean} isExtraMove whether this move is an extra move after landing in the store.
     * @param {boolean} isExtraMove whether this move is an extra move after landing in the store.
     * @param {number} eatenPileEatanStones the number of stones that were actually eatn
     */
    constructor(initialPile, lastPile, initialPileStones,initialStoreStones, hasExtraMove, isEatingMove, eatingPileIndex,eatingPileInitialStones, isExtraMove, eatenPileEatanStones) {
        this.#initalPileIndex = initialPile;
        this.#lastPileIndex = lastPile;
        this.#initialPileStones = initialPileStones;
        this.#initialStoreStones = initialStoreStones;
        this.#hasExtraMove = hasExtraMove;
        this.#isEatingMove = isEatingMove;
        this.#eatingPileIndex = eatingPileIndex;
        this.#eatingPileInitialStones = eatingPileInitialStones;
        this.#isExtraMove = isExtraMove;
        this.#eatingPileEatenStones = eatenPileEatanStones;
    }

    /**
     * @returns {number}
     */
    get initialPile() {
        return this.#initalPileIndex;
    }

    /**
     * @returns {number}
     */
    get lastPileIndex() {
        return this.#lastPileIndex;
    }
    
    /**
     * @returns {number}
     */
    get initialPileStones() {
        return this.#initialPileStones;
    }

    /**
     * @returns {number}
     */
    get initialStoreStones() {
        return this.#initialStoreStones;
    }

    /**
     * @returns {boolean}
     */
    get hasExtraMove() {
        return this.#hasExtraMove;
    }
    /**
     * @returns {boolean}
     */
    get isEatingMove() {
        return this.#isEatingMove;
    }
    
    /**
     * @returns {number}
     */
    get eatingPileIndex() {
        return this.#eatingPileIndex;
    }
    
    /**
     * @returns {number};
     */
    get eatingPileInitialStones() {
        return this.#eatingPileInitialStones;
    }

    /**
     * @returns {number};
     */
    get eatingPileEatenStones() {
        return this.#eatingPileEatenStones;
    }

    /**
     * @returns {boolean};
     */
    get isExtraMove() {
        return this.#isExtraMove;
    }

    
}