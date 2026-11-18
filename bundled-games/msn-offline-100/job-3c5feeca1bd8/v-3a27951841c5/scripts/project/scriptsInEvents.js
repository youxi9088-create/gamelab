// @ts-check
import { Move } from "./move.js";
import { Player } from "./player.js";
import { Marble } from "./marble.js";
export class Board {
    
    // Used for Min Max algorithm
    static MAX_VALUE = 1000000;
	static MIN_VALUE = -1000000;
    static DEPTH = 6;
    // Initial pile of the first player.
    static PLAYER0_FIRST_PILE = 0;
    // Initial pile of the second level.
    static PLAYER1_FIRST_PILE = 7;
    // how many points are enough to win
    static ENOUGH_POINTS_TO_WIN = 25
    // Easy - random move
    // Medium - heuristics
    // Hard - Min Max to DEPTH
    // TODO: Add more levels by adjusting the depth parameter.
    static COMPUTER_LEVELS = 
	{
		EASY : 1,
		MEDIUM : 2,
		HARD : 3
	}

    // Access to Construct runtime variables.
    #runtime;
    
    // Beginning players
    #player0;
    // Second players
    #player1;
    // The player whose turn it is now.
    #currentPlayer;
    // Next player to play.
    #nextPlayer;
    // The level the computer plays at.
    #computerLevel;
    // An array of all moves taken so far (for the undo function)
    #movesTaken;   
    // Whether we're currently in an extra move taken.
    #isInExtraMove; 
    
    constructor(runtime) {
        this.#runtime = runtime;        
    }

    /**
     * Sets up the requirement for the next game.
     * @param {boolean} isVsComputer Whether its a game against the computer.
     * @param {number} firstPlayerIndex the index of the player who plays first (0 or 1)
     * @param {number} computerLevel the level in which a computer plays, if its a game against the computer.
     */
    startNextGame(isVsComputer, firstPlayerIndex, computerLevel) {
        this.#movesTaken = [];
        this.#isInExtraMove = false;
        this.#computerLevel = computerLevel;        
        this.#player0 = new Player(0, "Player 0", false, Board.PLAYER0_FIRST_PILE, 0);
        this.#player1 = new Player(1, "Player 1", isVsComputer, Board.PLAYER1_FIRST_PILE, Player.MARBLES_PER_PLAYER);
        
        if (firstPlayerIndex === 0) {
            this.#currentPlayer = this.#player0;
            this.#nextPlayer = this.#player1;
        } else {
            this.#currentPlayer = this.#player1;
            this.#nextPlayer = this.#player0;
        }
        this.initBoardFromPlayers();
        this.setTurnIndicator();
        this.startNextTurn();
    }
    
    /**
     * Lit the potential moves.
     */
    startNextTurn() {        
        // For tracking/debuging purposes - count the point and the stones.
        this.#runtime.callFunction("setTotalStonesText",this.#player0.getTotalStones() + this.#player1.getTotalStones());
        this.#runtime.callFunction("setPointsText",this.#player0.name + ":" + this.#player0.points + "," + this.#player1.name + ":" + this.#player1.points);
        
        // Lit all the potential moves.
        let potentialPiles = this.#currentPlayer.getPotentialMovePiles();        
        for (let i = 0; i < potentialPiles.length; i++) {            
            this.litPile(potentialPiles[i]);
        }
        
        if (this.#currentPlayer.isComputerPlayer) {            
            // Handle computer turn.
            const movePile = this.getComputerMove();
            this.#runtime.callFunction("computerChoseMove",movePile);

        } else {
            // Start the player turn.
            this.#runtime.callFunction("enableNextTurn");
        }        
    }
	
	setDepth() {
	this.DEPTH = 4; 
	console.log(this.DEPTH)
	}
    
    
    /**
     * 
     * @returns {number} returns the computer choice.
     */
    getComputerMove() {        
        let potentialPiles = this.#currentPlayer.getPotentialMovePiles();
        // Handle levels.
        // Medium level
        if (this.#computerLevel === Board.COMPUTER_LEVELS.MEDIUM) {
           // console.log("In medium level");
            let moves = this.buildMovesFromPlayerPiles(potentialPiles);
            return this.mediumLevelMoveChoice(moves).initialPile;
        }
        // Hard level.
        
        if (this.#computerLevel === Board.COMPUTER_LEVELS.HARD) {            
            const resultMove = this.returnMoveMinMax(Board.DEPTH, Board.MIN_VALUE - 1, Board.MIN_VALUE +1);            
            return resultMove.initialPile;
        }
        // Default to return a random move.
        let randomMovePile = potentialPiles[Math.floor(Math.random()*potentialPiles.length)];
        return randomMovePile;
    }
    
    /**
     * Returns the medium level strategy.
     * @param {Array<Move} potentialMoves The potential moves that can be made.
     * @returns {Move} the move to make
     */
    mediumLevelMoveChoice(potentialMoves) {
        let eatingMoves = this.returnEatingMoves(potentialMoves);
        
        // Make the eating move that eats the most.
        if (eatingMoves.length > 0) {
            let maxEatingMove = this.maxEatingMoves(eatingMoves);
            if (maxEatingMove.eatingPileInitialStones > 0) {
                return maxEatingMove;
            }
        }

        // Returns all moves that give the computer an extra move.
        let extraMoves = this.returnExtraMoves(potentialMoves);
        
        // Return a random extra move.
        if (extraMoves.length > 0) {
            return extraMoves[Math.floor(Math.random()*extraMoves.length)];
        }

        // Random move.
        return potentialMoves[Math.floor(Math.random()*potentialMoves.length)];
    }
    // Runs the minMax algorithm.
    // See explanation about minmax with alpha beta purning -
	// https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-4-alpha-beta-pruning/
	
	// The initial min max call to save time on checking if to return move rather than a score.	
	/**
     * 
     * @param {number} depth depth to run min max.
     * @param {number} alpha value of alpha at the beginning.
     * @param {number} beta value of beta at the beginning.
     * @returns {Move} the move to make
     */    
    returnMoveMinMax(depth, alpha, beta) {		
       // console.log("***************************Start Min Max Move*****************");
		// Assumes its a maximizing node (computer turn) -
		let result = Board.MIN_VALUE;			
        let selectedMoves = [];
        const potentialPiles = this.#currentPlayer.getPotentialMovePiles();
        const moves = this.buildMovesFromPlayerPiles(potentialPiles);

        // No need to check if there's only one optional move.        

        if ((moves.length === 1)) {
            return moves[0];
        }
        for (let i = 0; i < moves.length; i++) {
            const curMove = moves[i];            
            // Applies the move on the board (later we undo it)
            this.applyMove(curMove);
            
            let tempResult = 0;
            // If there is another move, call with the same turn and depth.
            if (curMove.hasExtraMove) {                  
                tempResult = this.minMax(depth, true, alpha, beta);                                
            } else {
                // Swap the turn and reduce the depth.
                this.swapTurns();                
                
                tempResult = this.minMax(depth -1, false, alpha, beta);                                    
            }
            
            if (tempResult > result) {                                
                result = tempResult;
                selectedMoves = [];
                selectedMoves.push(curMove);
            }
            else if (tempResult === result) {
                
                selectedMoves.push(curMove);
            }
            // If there was no extra move, swap turns before undo.
            if (!curMove.hasExtraMove) {
                this.swapTurns();
            }
            
            this.unApplyMove(curMove);
            
            if (result >= alpha) {
                alpha = result;
            }				                
        }
        
        // If a few moves have the same value, call the tie breaker.
        return this.selectBetweenEqualMoves(selectedMoves);
	}
    /**
     * 
     * @param {number} depth The depth that's left to run.
     * @param {boolean} maximizingPlayer Whether its the maximizing player turn.
     * @param {number} alpha current algorithm alpha value.
     * @param {number} beta the current algorithm beta value.
     * @returns {number} the value of the board based on the min max algorith.
     */
    minMax(depth, maximizingPlayer,alpha, beta) {		        
		// Checking if its a leaf node.		        
		if ((depth === 0) || (this.checkGameOver())) {			
            return this.getBoardValue();            
		}		        
        if (maximizingPlayer) {			
            let result = Board.MIN_VALUE;			            
            const potentialPiles = this.#currentPlayer.getPotentialMovePiles();
            const moves = this.buildMovesFromPlayerPiles(potentialPiles);
            
            for (let i = 0; i < moves.length; i++) {
                const curMove = moves[i];
                this.applyMove(curMove);
                let tempResult = 0;
                // If there is an extra move
                if (curMove.hasExtraMove) {
                    tempResult = this.minMax(depth , true, alpha, beta);
                    
                } else {
                    this.swapTurns();
                    tempResult = this.minMax(depth -1, false, alpha, beta);                    
                }				
                
				
                if (tempResult > result) {
                    result = tempResult;
                    
                }                
				if (!curMove.hasExtraMove) {
                    this.swapTurns();
                }
                
                this.unApplyMove(curMove);
                  // If there was no extra move, swap turns.
                
				if (result >= alpha) {
					alpha = result;
				}
				if (beta <= alpha) {
					// break;
				}                
            }

            return result;
        }

        
		else {
			
            let result = Board.MAX_VALUE;
            
            const potentialPiles = this.#currentPlayer.getPotentialMovePiles();
            const moves = this.buildMovesFromPlayerPiles(potentialPiles);
            
            for (let i = 0; i < moves.length; i++) {
                const curMove = moves[i];
				this.applyMove(curMove);				
                let tempResult = 0;
                // If there is an extra move
                if (curMove.hasExtraMove) {
                    tempResult = this.minMax(depth , false, alpha, beta);
                    
                } else {
                    this.swapTurns();
                    tempResult = this.minMax(depth -1, true, alpha, beta);                    
                }				
                
                if (tempResult < result) {
                    result = tempResult;
				}
                // If there was no extra move, swap turns.
                if (!curMove.hasExtraMove) {
                    this.swapTurns();
                }
                this.unApplyMove(curMove);
               
				// Max will never choose this way.
				if (result < beta) {
					beta = result;
				}
				if (beta <= alpha) {
					// break;
				}
            }
            
            return result;
        }
    }

    /**
     * Calculates the board value. The value is the difference in point.
     * @returns {number} the current value of the board.
     */
    getBoardValue() {
		// Current player has no moves.
		let maxPlayer = this.#currentPlayer;
        let minPlayer = this.#nextPlayer;
        if (!this.#currentPlayer.isComputerPlayer) {
            maxPlayer = this.#nextPlayer;
            minPlayer = this.#currentPlayer;
        }
        // If its game over.
        if (this.checkGameOver()) {
            if (maxPlayer.getTotalStones() > minPlayer.getTotalStones()) {
                return Board.MAX_VALUE;
            }
            if (maxPlayer.getTotalStones() < minPlayer.getTotalStones()) {
                return Board.MIN_VALUE;
            }
            return 0;
        }
        
        // If either players have enough to win.
        if (maxPlayer.points >= Board.ENOUGH_POINTS_TO_WIN) {
            // We prefer to win of its an option, but this is almost a win.
            return Board.MAX_VALUE - 1;
        }

        if (minPlayer.points >= Board.ENOUGH_POINTS_TO_WIN) {
            return Board.MIN_VALUE + 1;
        }

        return maxPlayer.points - minPlayer.points;
	}
	/**
     * Returns a tie breaker move. %20 random, %80 based on medium.
     * @param {Array<Move>} moves 
     * @returns {Move} the selected move
     */
	selectBetweenEqualMoves(moves) {		
		if (moves.length === 1) {
            return moves[0];
        }
        const chance = Math.random();
		// Random
		if (chance < 0.2) {
			return moves[Math.floor(Math.random()*moves.length)];
		}

        return this.mediumLevelMoveChoice(moves);
	}


    /**
     * Returns the array of all possible moves.     
    * @param {Array<number>} potentialPiles All the potential moves the player can make.
     * @returns {Array<Move>} The array of possible moves.
     */
    buildMovesFromPlayerPiles(potentialPiles) {
        const result = [];
        for (let i = 0; i < potentialPiles.length; i++) {
            result.push(this.buildMoveFromPlayerChoice(potentialPiles[i]));
        }
        return result;
    }

    /**
     * Returns all the moves where the player is eating the other player.
     * @param {Array<Move>} potentialMoves The potential moves the player can make.
     * @returns {Array<Move>} all the moves that are eating moves.
     */
    returnEatingMoves(potentialMoves) {
        const result = [];
        for (let i = 0; i < potentialMoves.length; i++) {
            if (potentialMoves[i].isEatingMove) {
                result.push(potentialMoves[i]);
            }
        }
        return result;
    }

    /**
     * Returns the eating move that eats the most pieces.
     * @param {Array<Move>} potentialEatingMoves The potential eating moves the player can make.
     * @returns {Move} the eating moves which eats the most pieces.
     */
    maxEatingMoves(potentialEatingMoves) {
        let result = potentialEatingMoves[0];
        for (let i = 1; i < potentialEatingMoves.length; i++) {
            const curMove = potentialEatingMoves[i];
            if (curMove.eatingPileInitialStones > curMove.eatingPileInitialStones) {
                result = curMove;
            }
        }
        return result;
    }

    /**
     * Returns all the moves where the player has an extra move.
     * @param {Array<Move>} potentialMoves The potential moves the player can make.
     * @returns {Array<Move>} all the moves that are eating moves.
     */
    returnExtraMoves(potentialMoves) {
        const result = [];        
        for (let i = 0; i < potentialMoves.length; i++) {
            
            if (potentialMoves[i].hasExtraMove) {                
                result.push(potentialMoves[i]);
            }
        }
        return result;
    }

    

    /**
     * The player clicked a certain pile, initiate the turn.
     * @param {number} pileIndex The pile the player chose to move.
     */
    playerChoseMove(pileIndex) {
		let move = this.buildMoveFromPlayerChoice(pileIndex);
		

        this.applyMove(move);
        this.applyMarblesForMove(move);
        this.showPileBullets(move);
        this.#movesTaken.push(move);        
        this.initBoardFromPlayers();
        
        if (move.hasExtraMove) {
            this.#isInExtraMove = true;
        } else {
            this.#isInExtraMove = false;
        }
        this.#runtime.callFunction("prepareNextPlayerTurn",2);
	}

    /**
     * Turn finished
     */
    turnFinished() {
        if (this.checkGameOver()) {
            this.gameOverSequence();
            return;
        }
        
        if (!this.#isInExtraMove) {
            this.swapTurns();
        }
        this.setTurnIndicator();        
        this.startNextTurn();            
        
    }

    gameOverSequence() {
        this.#runtime.callFunction("setGameOver");
        // Unlit all backgrounds.
        this.#runtime.callFunction("unlitAllPiles");
        // unlit all bullets.
        this.#runtime.callFunction("unlitAllPileBullets");
        let playerWithPiles = null;
        if (!this.#currentPlayer.areAllPilesEmpty()) {
            playerWithPiles = this.#currentPlayer;
        }
        if (!this.#nextPlayer.areAllPilesEmpty()) {
            playerWithPiles = this.#nextPlayer;
        }
        if (playerWithPiles != null) {
            this.moveFinalStonesAndMarblesToStore(playerWithPiles);
            
        }
        this.initBoardFromPlayers();
        let winText = this.#currentPlayer.name + " Won";
        if (this.#nextPlayer.points > this.#currentPlayer.points) {
            winText = this.#nextPlayer.name + " Won";
        }
        if (this.#nextPlayer.points === this.#currentPlayer.points) {
            winText  = "It is a darw";
        }

        this.#runtime.callFunction("setWinText",winText);
    }

    /**
     * Moves all the player piles to store.
     * @param {Player} player the player that still has stones in piles.
     */
    moveFinalStonesAndMarblesToStore(player) {
        // Flash the piles
        if (player === null) {
            return;
        }
        for (let i = 0; i < Player.NUMBER_OF_PILES; i++) {
            let curPile = i + player.firstPile;
            if (player.getStonesInPile(curPile) > 0) {
                this.#runtime.callFunction("flashBullet", curPile);
                let stones = player.getStonesInPile(curPile);
                player.adjustNumberInStore(stones);
                player.setStonesInPile(curPile, 0);
                let marbles = player.getMarblesInPile(curPile);
                while (marbles.length > 0) {
                    const marble = marbles.pop();
                    if (marble) {
                        player.addMarbleToPile(player.storePileIndex, marble);
                    }
                }
            }
        }
                
    }
    /**
     * 
     * @returns {boolean} Whether it is game over.
     */
    checkGameOver() {
        if (this.#currentPlayer.areAllPilesEmpty() || (this.#nextPlayer.areAllPilesEmpty()) ) {
            return true;
        }
        return false;
    }
    /**
     * lit the bullets of a move to show where items were added.
     * @param {Move} move The move for which we lit bullets.
     */
    showPileBullets(move) {
        let waitTime = 0.1;
        let curPile = move.initialPile;
        let stonesCounter = move.initialPileStones;
        while (stonesCounter > 0) {
            curPile++;
            if (curPile === Player.TOTAL_PILES_WITH_STORES) {
                curPile = 0;
            }
            if (curPile === this.#nextPlayer.storePileIndex) {
                continue;
            }
            stonesCounter--;
            // Move the stone.
            this.#runtime.callFunction("showPileBullet", curPile, waitTime);
            waitTime+= 0.08;
        }
        if (move.isEatingMove) {
            this.#runtime.callFunction("showPileBullet", move.eatingPileIndex, waitTime);
        }
    }

    /**
     * Updates the piles with the move.
     * @param {Move} move 
     */
    applyMove(move) {
	
	
	
        //console.log(move);
        // First, we we place 0 in the initial pile.
        this.#currentPlayer.setStonesInPile(move.initialPile, 0);
        let stonesCounter = move.initialPileStones;
        let curPile = move.initialPile;
        // How many stones are placed in the eat pile.
        let stonesInEatenPile = 0;
        while (stonesCounter > 0) {
            curPile++;
            if (curPile === Player.TOTAL_PILES_WITH_STORES) {
                curPile = 0;
            }
            if (curPile === this.#nextPlayer.storePileIndex) {
                continue;
            }

            if (move.isEatingMove) {
                if (curPile === move.eatingPileIndex) {
                    stonesInEatenPile += 1;
					
                }
            }
            stonesCounter--;
            // Move the stone.
            this.getPlayerForPile(curPile).adjustNumberInPile(curPile, 1);
        }

        // If its an eating move -
        if (move.isEatingMove) { 
		
		
            this.#currentPlayer.setStonesInPile(move.lastPileIndex, 0);
            this.#nextPlayer.setStonesInPile(move.eatingPileIndex, 0);
            this.#currentPlayer.adjustNumberInPile(this.#currentPlayer.storePileIndex, 1 + move.eatingPileInitialStones + stonesInEatenPile);
			
			
        }
    }
    /**
     * Updates the marbles based on the move.
     * @param {Move} move 
     */
    applyMarblesForMove(move) {
	
		
        // First we empty the marble in the initial pile
        let initalMarbles = this.#currentPlayer.getMarblesInPile(move.initialPile);
        this.#currentPlayer.removeAllMarblesFromPile(move.initialPile);
         // First, we we place 0 in the initial pile.
         
         let stonesCounter = move.initialPileStones;
         let curPile = move.initialPile;
         
         while (stonesCounter > 0) {
             curPile++;
             if (curPile === Player.TOTAL_PILES_WITH_STORES) {
                 curPile = 0;
             }
             if (curPile === this.#nextPlayer.storePileIndex) {
                 continue;
             }
             
             stonesCounter--;
             // Move the stone.
             this.getPlayerForPile(curPile).addMarbleToPile(curPile, initalMarbles.pop());
         }
 
         // If its an eating move -
         if (move.isEatingMove) {
		 
		 
		 	//Tomer Edition
			this.#runtime.globalVars.eatenPile_index = move.eatingPileIndex;
			this.#runtime.globalVars.LastPile_Eat = move.lastPileIndex;
			this.#runtime.globalVars.EatingMove = true;
			
			
            // Move the marble from the last pile to the store.
            let lastMarble = this.#currentPlayer.getMarblesInPile(move.lastPileIndex);
            this.#currentPlayer.addMarbleToPile(this.#currentPlayer.storePileIndex, lastMarble.pop());
            this.#currentPlayer.removeAllMarblesFromPile(move.lastPileIndex);

            // Move the marbles from the eaten pile to the store.
            let eatenPileMarbles = this.#nextPlayer.getMarblesInPile(move.eatingPileIndex);
            while (eatenPileMarbles.length > 0) {
                this.#currentPlayer.addMarbleToPile(this.#currentPlayer.storePileIndex, eatenPileMarbles.pop());                
            }            
            this.#nextPlayer.removeAllMarblesFromPile(move.eatingPileIndex);            
         }
    }

    /**
     * Updates the marbles based on the move.
     * @param {Move} move 
     */
    unApplyMarblesForMove(move) {
        // First, undo the eating:
        // If its an eating move -
        if (move.isEatingMove) {
            
            // Move the marbles from the store to the eaten pile            
            let storeMarbles = this.#currentPlayer.getMarblesInPile(this.#currentPlayer.storePileIndex);
            for (let i = 0; i < move.eatingPileEatenStones; i++) {
                this.#nextPlayer.addMarbleToPile(move.eatingPileIndex, storeMarbles.pop());
            }

            // Move one marble to the final pile.
            this.#currentPlayer.addMarbleToPile(move.lastPileIndex, storeMarbles.pop());
         }

         // Now move all the marbles back to the initial pile -
        let stonesCounter = move.initialPileStones;        
        let curPile = move.lastPileIndex;
        let initialMarblePile = [];
        while (stonesCounter > 0) {
            
            if (curPile === -1 ) {
                curPile = Player.TOTAL_PILES_WITH_STORES -1;
            }
            if (curPile === this.#nextPlayer.storePileIndex) {
                curPile--;
                continue;
            }
            
            // Move the stone.
            
            let marbles = this.getPlayerForPile(curPile).getMarblesInPile(curPile);
            initialMarblePile.push(marbles.pop());
            
            stonesCounter--;
            curPile--;
        }
        for (let i = 0; i < initialMarblePile.length; i++) {
            this.#currentPlayer.addMarbleToPile(move.initialPile, initialMarblePile[i]);
        }

    }
    

    /**
     * Called when the undo button is clicked.
     */
    undoClicked() {
                
        if (this.#movesTaken.length === 0) {            
            return;
        }
        const move =  this.#movesTaken.pop();
        if (!move.hasExtraMove) {
            this.swapTurns();            
        }
        this.unApplyMove(move);
        this.unApplyMarblesForMove(move);
        this.initBoardFromPlayers();        
        
        this.setTurnIndicator();
        if (!this.#currentPlayer.isComputerPlayer) {
            this.startNextTurn();            
        }
    }
    /**
     * Undo a move.
     * @param {Move | null} move the move to undo
     */
    unApplyMove(move) {
        if (move === null) {
            return;
        }
        
        let stonesCounter = move.initialPileStones;        
        let curPile = move.lastPileIndex;
        
        while (stonesCounter > 0) {
            
            if (curPile === -1 ) {
                curPile = Player.TOTAL_PILES_WITH_STORES -1;
            }
            if (curPile === this.#nextPlayer.storePileIndex) {
                curPile--;
                continue;
            }
            
            // Move the stone.
            
            this.getPlayerForPile(curPile).adjustNumberInPile(curPile, -1);
            stonesCounter--;
            curPile--;
        }
        if (move.isEatingMove) {
            // We sure had 0 before the move.
            this.#currentPlayer.setStonesInPile(move.lastPileIndex, 0);
            this.#currentPlayer.setStonesInPile(this.#currentPlayer.storePileIndex, move.initialStoreStones);
            this.#nextPlayer.setStonesInPile(move.eatingPileIndex, move.eatingPileInitialStones);            
        }

        this.#currentPlayer.setStonesInPile(move.initialPile, move.initialPileStones);
    }


    /**
     * 
     * @param {number} pileIndex The pile index we're moving
     * 
     * @returns {Move} the move we build from the pile index.
     */
    buildMoveFromPlayerChoice(pileIndex) {
        let initialPile = pileIndex;
        let initialPileStones = this.#currentPlayer.getStonesInPile(pileIndex);
        let otherPlayerStoreIndex = this.#nextPlayer.storePileIndex;
        let playerStoreIndex = this.#currentPlayer.storePileIndex;
        let playerStoreStones = this.#currentPlayer.getStonesInPile(playerStoreIndex);
        let lastPile = this.getLastPile(initialPile, initialPileStones, otherPlayerStoreIndex);
        let hasExtraMove = (lastPile === playerStoreIndex);
        let eatingPileIndex = 0;
        let eatingPileEatenStones = 0;  
        let eatenPileInitialStones = 0;
        let isEatingMove = this.isEatingMove(initialPile, lastPile, initialPileStones, playerStoreIndex);
        if (isEatingMove) {
            eatingPileIndex = this.getOppositePileIndex(lastPile);
            eatingPileEatenStones = this.getEatingPileEatenStones(initialPile, initialPileStones, eatingPileIndex, this.#nextPlayer.getStonesInPile(eatingPileIndex));
            eatenPileInitialStones = this.#nextPlayer.getStonesInPile(eatingPileIndex);
        }
        
        let move = new Move (initialPile, lastPile, initialPileStones, playerStoreStones, hasExtraMove, isEatingMove, eatingPileIndex, eatenPileInitialStones, this.#isInExtraMove, eatingPileEatenStones);                        
        return move;
    }
    
    /**
     * Calculates how many pieces are eaten.
     * @param {number} initialPile 
     * @param {number} initialPileStones 
     * @param {number} eatingPileIndex 
     * @param {number} eatingPileInitialStones 
     * @returns {number} the final number of pieces that are eaten.
     */
    getEatingPileEatenStones(initialPile, initialPileStones, eatingPileIndex, eatingPileInitialStones) {
        let curPile = initialPile;
        let stonesCounter = initialPileStones;
        let stonesInEatenPile = eatingPileInitialStones;
        while (stonesCounter > 0) {
            curPile++;
            if (curPile === Player.TOTAL_PILES_WITH_STORES) {
                curPile = 0;
            }
            if (curPile === this.#nextPlayer.storePileIndex) {
                continue;
            }

            if (curPile === eatingPileIndex) {
                stonesInEatenPile += 1;
            }
            stonesCounter--;            
        }        
        return stonesInEatenPile;
    }
    /**
     * Returns the opposite pile.
     * @param {number} pileIndex the pile for which we want the opposite.
     * @returns {number} The opposite pile index.
     */
    getOppositePileIndex(pileIndex) {
       return Player.TOTAL_PILES_WITH_STORES - 2 - pileIndex; 
    }

    /**
     * Returns whether this is an eating move.
     * @param {number} initialPile The inital pile of the move.
     * @param {number} finalPile The final pile of the move.
     * @param {number} numberOfStones Number of stones in the move.
     * @param {number} playerStore The player store pile.
     * @returns {boolean} Whether this is an eating move.
     */
    isEatingMove(initialPile, finalPile, numberOfStones, playerStore) {
        // If its a full circle.
        if (numberOfStones >= (Player.TOTAL_PILES_WITH_STORES -1) ) {
            return false;
        }

        if (!this.#currentPlayer.pileIndexBelogsToPlayer(finalPile)) {
            return false;
        }

        if (finalPile === playerStore) {
            return false;
        }

        return (0 === this.#currentPlayer.getStonesInPile(finalPile));
    }

    /**
     * Returns the last pile of a move.
     * @param {number} initialPile the inital pile in the move
     * @param {number} numberOfStones Number of stones in the move.
     * @param {number} otherPlayerStore The other player store index (so we can skip it)
     * @returns {number} the last pile of the move.
     */
    getLastPile(initialPile, numberOfStones, otherPlayerStore) {
        let currentPile = initialPile;
        while (numberOfStones > 0) {
            currentPile++;
            if (currentPile === Player.TOTAL_PILES_WITH_STORES) {
                currentPile = 0;
            }
            if (currentPile == otherPlayerStore) {
                continue;
            }
            numberOfStones--;
        }
        return currentPile;
    }

    /**
     * Initializes the board settings based on what the players have in each pile.
     */
    initBoardFromPlayers() {
        this.#runtime.callFunction("removeAllMarbles");
        for (let i = 0; i <= Player.NUMBER_OF_PILES; i++) {
            let pileIndex0 = this.#player0.firstPile + i;
            this.setNumberOnBoard(pileIndex0, this.#player0.getStonesInPile(pileIndex0), 0);
            this.buildMarblePileOnBoard(this.#player0, pileIndex0);
            let pileIndex1 = this.#player1.firstPile + i;
            this.setNumberOnBoard(pileIndex1, this.#player1.getStonesInPile(pileIndex1), 0);
            this.buildMarblePileOnBoard(this.#player1, pileIndex1);
        }
    }

    
    /**
     * Updates the marble in a pile.
     * @param {Player} player The player to update.
     * @param {number} pileIndex The number of pile to updated.
     */
    buildMarblePileOnBoard(player, pileIndex) {
        const marbles = player.getMarblesInPile(pileIndex);
        let yOffset = -40;
        for (let i = 0; i < marbles.length; i++) {
            const curMarble = marbles[i];
            this.#runtime.callFunction("createMarble",curMarble.index, curMarble.color, pileIndex, yOffset);
            yOffset-= 10;
        }
    }

    

    /**
     * Sets the turn indicator to show whose turn is it.
     */
    setTurnIndicator() {
        this.#runtime.callFunction("setTurnIndicator",this.#currentPlayer.index, this.#currentPlayer.name, this.#isInExtraMove);        
    }

    litPile(index) {
        this.#runtime.callFunction("litPile",index);        
    }

    /**
     * Returns the player the pile belongs to.
     * @param {number} pile index of a give pile.
     * @returns {Player} the player the pile belongs to.
     */
    getPlayerForPile(pile) {
        if (this.#player0.pileIndexBelogsToPlayer(pile)) {
            return this.#player0;
        }
        return this.#player1;
    }

    /**
     * Swap the turns between the players.
     */
    swapTurns() {
        let tempPlayer = this.#currentPlayer;
        this.#currentPlayer = this.#nextPlayer;
        this.#nextPlayer = tempPlayer;
    }

    /**
     * Sets the number of pieces in a specific pile.
     * @param {number} pileIndex The number of the pile to update.
     * @param {number} number the number of stones to put in the pile.
     * @param {number} delay the delay in seconds before changing the number.
     */
    setNumberOnBoard(pileIndex, number, delay) {
        this.#runtime.callFunction("setPileStones",pileIndex, number, delay);
    }
}


const scriptsInEvents = {

	

	

	

	

	

	

	

	

	async Gameeventsheet_Event2_Act1(runtime, localVars)
	{
		runtime.globalVars.board = new Board(runtime);
		
		
	},

	async Gameeventsheet_Event3_Act1(runtime, localVars)
	{
		runtime.globalVars.board.setDepth();
	},

	async Gameeventsheet_Event4_Act15(runtime, localVars)
	{
		runtime.globalVars.board.startNextGame(!runtime.globalVars.isPVP,0,runtime.globalVars.computerLevel);
	},

	async Gameeventsheet_Event50_Act4(runtime, localVars)
	{
		runtime.globalVars.board.turnFinished();
	},

	async Gameeventsheet_Event52_Act4(runtime, localVars)
	{
		runtime.globalVars.board.turnFinished();
	},

	async Gameeventsheet_Event54_Act3(runtime, localVars)
	{
		runtime.globalVars.board.playerChoseMove(localVars.pileIndex);
	},

	async Gameeventsheet_Event67_Act2(runtime, localVars)
	{
		runtime.globalVars.board.undoClicked();
		
	},

	async Gameeventsheet_Event103_Act4(runtime, localVars)
	{
		runtime.globalVars.board.playerChoseMove(localVars.pile);
	},

	async Gameeventsheet_Event193_Act3(runtime, localVars)
	{
		runtime.globalVars.board.undoClicked();
		
	},

	async Gameeventsheet_Event227_Act2(runtime, localVars)
	{
		runtime.globalVars.board.startNextGame(!runtime.globalVars.isPVP,0,runtime.globalVars.computerLevel);
	},

	async Gameeventsheet_Event235_Act2(runtime, localVars)
	{
		runtime.globalVars.board.startNextGame(!runtime.globalVars.isPVP,0,runtime.globalVars.computerLevel);
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

