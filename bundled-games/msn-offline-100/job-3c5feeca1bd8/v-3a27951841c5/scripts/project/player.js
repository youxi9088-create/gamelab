import { Marble } from "./marble.js";

// @ts-check
export class Player {
    static NUMBER_OF_PILES = 6;
    static INITAL_PIECES_PER_PILE = 4;
    static TOTAL_PILES_WITH_STORES = 14;
    static MARBLES_PER_PLAYER = 24;
    // The index of the player.
    #index;
    // The namer of the player.
    #name;
    // The index of the first pile.
    #firstPile;
    
    // First Marble index
    #firstMarbleIndex;

    // The array of piles.
    #piles;

    // Array of marbles in each pile.
    #marbles;
 
    // Whether the player is a computer player
    #isComputerPlayer;

    /**
     * 
     * @param {number} playerIndex The index of the player.
     * @param {String} playerName The name of the player.
     * @param {boolean} isComputerPlayer Whether its a computer player.
     * @param {number} firstPile Whether its the first pile.
     * @param {number} firstMarbleIndex the index of the marble
     */
    constructor(playerIndex, playerName, isComputerPlayer, firstPile, firstMarbleIndex) {
        this.#index = playerIndex;
        this.#name = playerName;
        this.#isComputerPlayer = isComputerPlayer;
        this.#firstPile = firstPile;
        this.#firstMarbleIndex = firstMarbleIndex;
        this.initPiecesToInitialPosition();
    }
    initPiecesToInitialPosition() {
        this.#piles = new Array(Player.NUMBER_OF_PILES + 1);
        this.#marbles = new Array(Player.NUMBER_OF_PILES + 1);
        for ( let i = 0; i < Player.NUMBER_OF_PILES; i++) {
            this.#piles[i] = Player.INITAL_PIECES_PER_PILE;
            this.#marbles[i] = [];
            for (let j = 0; j < Player.INITAL_PIECES_PER_PILE; j++) {
                let marble = new Marble(this.#firstMarbleIndex + i*Player.INITAL_PIECES_PER_PILE + j, Math.floor(Math.random() *  Marble.NUMBER_OF_COLORS) );
                this.#marbles[i].push(marble);
            }            
        }
        this.#piles[this.storePileIndex - this.#firstPile] = 0;
        this.#marbles[this.storePileIndex - this.#firstPile] = [];
    }

    /**
     * 
     * @param {number} index pile index.
     * @returns {Boolean} returns the pile index belongs to this player.
     */
    pileIndexBelogsToPlayer(index) {
        if (index < this.#firstPile) {
            return false;
        }
        if (index > (this.#firstPile + Player.NUMBER_OF_PILES)) {
            return false;
        }
        return true;
    }

    /**
     * 
     * @returns {number} The total numbers of stone the player has (piles+Store)
     */
    getTotalStones() {
        let result = 0;
        for (let i = 0; i < this.#piles.length; i++) {
            result += this.#piles[i];
        }
        return result;
    }

    /**
     * Adjusts the number of marbles in a given pile.
     * @param {number} pileIndex index of the pile to adjust.
     * @param {number} adjustBy The number to adjust by (can be negative or positive).     
     */
    adjustNumberInPile(pileIndex, adjustBy) {
        // Verify its the right pile.s
        if (!this.pileIndexBelogsToPlayer(pileIndex)) {
            return;
        }

        const pileArrayIndex = this.getIndexInPileArray(pileIndex);
        this.#piles[pileArrayIndex] += adjustBy;
    }

    /**
     * 
     * @param {number} pileIndex the index of the pile.
     * @param {Marble} marble the marble we add to the pile.
     * @returns 
     */
    addMarbleToPile(pileIndex, marble) {
        // Verify its the right pile.s
        if (!this.pileIndexBelogsToPlayer(pileIndex)) {
            return;
        }

        const pileArrayIndex = this.getIndexInPileArray(pileIndex);
        this.#marbles[pileArrayIndex].push(marble);
    }

    /**
     * Removes all the marbles from a pile.
     * @param {number} pileIndex      
     */
    removeAllMarblesFromPile(pileIndex) {
         // Verify its the right pile.s
         if (!this.pileIndexBelogsToPlayer(pileIndex)) {
            return;
        }

        const pileArrayIndex = this.getIndexInPileArray(pileIndex);
        this.#marbles[pileArrayIndex] = [];
    }

    /**
     * Adjusts the number in the store pile.
     * @param {number} adjustBy The number to adjust the store pile.
     */
    adjustNumberInStore(adjustBy) {
        this.adjustNumberInPile(this.storePileIndex, adjustBy);
    }

    /**
     * Returns whether a specifc pile is empty
     * @param {number} pileIndex 
     * @returns {boolean} Whether the pile is empty.
     */
    isPileEmpty(pileIndex) {
        return (this.#piles[this.getIndexInPileArray(pileIndex)] === 0);
    }
    
    /**
     * Returns true if all the piles are empty.
     * @returns {boolean} Whether all piles are empty (besides store pile)
     */
    areAllPilesEmpty() {
        for (let i = 0; i < Player.NUMBER_OF_PILES; i++) {
            if (!this.isPileEmpty(i + this.#firstPile)) {
                return false;
            }
        }
        
        return true;
    }
    /**
     * @returns {number} returns the index of the player.
     */
    get index() {
        return this.#index;
    }


    /**
     * Give a pile index, returns its index in the player pile array.
     * @param {number} index Index of a pile.
     * @returns The index of the pile in the piles array.
     */
    getIndexInPileArray(index) {
        return index - this.#firstPile;
    }

    /**
     * 
     * @param {number} pile The pile for which we want to get the numbers of stone.
     * @returns {number} Returns the number of stones in the pile.
     */
    getStonesInPile(pile) {
        return this.#piles[this.getIndexInPileArray(pile)];        
    }

    /**
     * 
     * @param {number} pile The pile for which we want to marble.
     * @returns {Array<Marble>} the marbles at a specific pile.
     */
    getMarblesInPile(pile) {
        return this.#marbles[this.getIndexInPileArray(pile)];        
    }

    /**
     * 
     * @param {number} pile Pile to update the stones.
     * @param {number} stones How many stones to place.
     */
    setStonesInPile(pile, stones) {
        this.#piles[this.getIndexInPileArray(pile)] = stones;        
    }

    /**
     * @returns {String} returns the name of the player.
     */
    get name() {
        return this.#name;
    }

    /**
     * 
     * @returns {Array<number>} returns an array of all non-empty piles.
     */
    getPotentialMovePiles() {
        let result = [];
        for (let i = 0; i < Player.NUMBER_OF_PILES; i++) {
            const pile = i + this.#firstPile;
            if (!this.isPileEmpty(pile)) {
                result.push(pile);
            }
        }
        return result;
    }

    /**
     * @returns {number} returns the index of the first bar.
     */
    get firstPile() {
        return this.#firstPile;
    }

    /**
     * @returns {number} returns the index of the store pile.
     */
    get storePileIndex() {
        return this.#firstPile + Player.NUMBER_OF_PILES;
    }

    /**
     * @returns {boolean} returns whether its a computer player.
     */
    get isComputerPlayer() {
        return this.#isComputerPlayer;
    }

    /**
     * @returns {number} The number of points the player has.
     */
    get points() {        
        return this.#piles[this.getIndexInPileArray(this.storePileIndex)];
    }    
}