// Complete Ludo King Game Logic

// Starting positions for each player on the main path
const START_POSITIONS = { 0: 0, 1: 13, 2: 26, 3: 39 };

// Safe spots where tokens cannot be captured
const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

export class LudoGame {
  constructor(players, gameControls = null) {
    this.players = players.slice(0, 4); // Max 4 players
    this.currentTurn = 0;
    this.diceValue = 0;
    this.tokens = {};
    this.winners = [];
    this.gameControls = gameControls || {
      enableSafeSpots: true,
      enableCapture: true,
      autoSkipTurn: true,
      turnTimeLimit: 30,
      maxPlayers: 4,
    };
    
    // Initialize tokens for each player (all at home = -1)
    this.players.forEach((playerId, index) => {
      this.tokens[index] = [-1, -1, -1, -1];
    });
  }

  // Roll dice
  rollDice() {
    this.diceValue = Math.floor(Math.random() * 6) + 1;
    return this.diceValue;
  }

  // Get valid moves for current player
  getValidMoves() {
    const playerId = this.currentTurn;
    const tokens = this.tokens[playerId];
    const validMoves = [];

    tokens.forEach((position, tokenIndex) => {
      if (this.canMoveToken(playerId, tokenIndex)) {
        validMoves.push(tokenIndex);
      }
    });

    return validMoves;
  }

  // Check if a specific token can move
  canMoveToken(playerId, tokenIndex) {
    const position = this.tokens[playerId][tokenIndex];
    const dice = this.diceValue;

    // Token at home - can only move with 6
    if (position === -1) {
      return dice === 6;
    }

    // Token on main path (0-51)
    if (position >= 0 && position < 52) {
      const newPos = position + dice;
      // Check if it would overshoot home path entry
      const turnsToHome = this.getTurnsToHomePath(playerId, position);
      if (turnsToHome !== null && turnsToHome < dice) {
        // Would enter home path
        const homePathPos = dice - turnsToHome - 1;
        return homePathPos < 5; // Home path has 5 cells
      }
      return newPos < 52;
    }

    // Token on home path (52-56)
    if (position >= 52 && position < 57) {
      const homePathIndex = position - 52;
      return homePathIndex + dice <= 5;
    }

    // Token finished
    return false;
  }

  // Get number of moves until home path entry
  getTurnsToHomePath(playerId, currentPosition) {
    const startPos = START_POSITIONS[playerId];
    let turnsToHome;
    
    if (currentPosition >= startPos) {
      turnsToHome = 51 - currentPosition;
    } else {
      turnsToHome = (52 - startPos) + currentPosition;
    }
    
    return turnsToHome;
  }

  // Move token
  moveToken(playerId, tokenIndex) {
    if (playerId !== this.currentTurn) {
      return { success: false, message: 'Not your turn' };
    }

    if (!this.canMoveToken(playerId, tokenIndex)) {
      return { success: false, message: 'Invalid move' };
    }

    const currentPos = this.tokens[playerId][tokenIndex];
    const dice = this.diceValue;
    let newPos;
    let captured = null;

    // Move from home
    if (currentPos === -1) {
      newPos = START_POSITIONS[playerId];
    }
    // Move on main path
    else if (currentPos >= 0 && currentPos < 52) {
      const turnsToHome = this.getTurnsToHomePath(playerId, currentPos);
      
      if (turnsToHome !== null && turnsToHome < dice) {
        // Enter home path
        const homePathPos = dice - turnsToHome - 1;
        newPos = 52 + homePathPos;
      } else {
        newPos = (currentPos + dice) % 52;
      }

      // Check for capture (only on main path, not on safe spots if enabled)
      if (this.gameControls.enableCapture && newPos < 52) {
        const isSafe = this.gameControls.enableSafeSpots && SAFE_SPOTS.includes(newPos);
        if (!isSafe) {
          captured = this.checkCapture(playerId, newPos);
        }
      }
    }
    // Move on home path
    else if (currentPos >= 52) {
      newPos = currentPos + dice;
      if (newPos > 57) {
        return { success: false, message: 'Exact number needed to finish' };
      }
    }

    // Update token position
    this.tokens[playerId][tokenIndex] = newPos;

    // Check if token finished
    const finished = newPos === 57;
    const allFinished = this.tokens[playerId].every(pos => pos === 57);

    if (allFinished && !this.winners.includes(playerId)) {
      this.winners.push(playerId);
    }

    // Determine if player gets another turn
    const extraTurn = dice === 6 || captured !== null;

    if (!extraTurn) {
      this.nextTurn();
    }

    return {
      success: true,
      newPosition: newPos,
      captured,
      extraTurn,
      finished,
      allFinished,
    };
  }

  // Check if token captures opponent
  checkCapture(playerId, position) {
    for (let opponentId = 0; opponentId < this.players.length; opponentId++) {
      if (opponentId === playerId) continue;

      const opponentTokens = this.tokens[opponentId];
      for (let i = 0; i < opponentTokens.length; i++) {
        if (opponentTokens[i] === position) {
          // Capture! Send opponent token back home
          this.tokens[opponentId][i] = -1;
          return { playerId: opponentId, tokenIndex: i };
        }
      }
    }
    return null;
  }

  // Move to next turn
  nextTurn() {
    this.currentTurn = (this.currentTurn + 1) % this.players.length;
    this.diceValue = 0;
  }

  // Get game state
  getState() {
    return {
      players: this.players,
      currentTurn: this.currentTurn,
      diceValue: this.diceValue,
      tokens: this.tokens,
      winners: this.winners,
      validMoves: this.getValidMoves(),
    };
  }

  // Load state
  loadState(state) {
    this.players = state.players || this.players;
    this.currentTurn = state.currentTurn || 0;
    this.diceValue = state.diceValue || 0;
    this.tokens = state.tokens || this.tokens;
    this.winners = state.winners || [];
  }
}

// Helper function to calculate token position on screen
export function getTokenScreenPosition(playerId, position) {
  // This would return x, y coordinates for rendering
  // Implementation depends on your board layout
  return { x: 0, y: 0 };
}

// Check if position is safe
export function isSafeSpot(position) {
  return SAFE_SPOTS.includes(position);
}

// Get player start position
export function getPlayerStartPosition(playerId) {
  return START_POSITIONS[playerId];
}
