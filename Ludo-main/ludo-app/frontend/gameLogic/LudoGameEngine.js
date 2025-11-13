/**
 * Complete Ludo Game Engine
 * Handles all game logic, rules, and state management
 */

// Game Constants
export const COLORS = ['red', 'green', 'yellow', 'blue'];
export const TOKENS_PER_PLAYER = 4;
export const BOARD_SIZE = 52; // Main path cells
export const HOME_PATH_SIZE = 6; // Colored path to home
export const WINNING_POSITION = 57;

// Starting positions on main path for each color
export const START_POSITIONS = {
  red: 1,
  green: 14,
  yellow: 27,
  blue: 40,
};

// Safe zones (star positions where tokens can't be captured)
export const SAFE_ZONES = [1, 9, 14, 22, 27, 35, 40, 48];

// Home entry positions (where tokens enter colored path)
export const HOME_ENTRY = {
  red: 51,
  green: 12,
  yellow: 25,
  blue: 38,
};

/**
 * Initialize a new game
 */
export function initializeGame(players) {
  const gameState = {
    players: players.map((p, index) => ({
      id: p.id,
      name: p.name,
      color: COLORS[index],
      tokens: Array(TOKENS_PER_PLAYER).fill(-1), // -1 = in base
      isActive: true,
      hasWon: false,
    })),
    currentPlayerIndex: 0,
    diceValue: null,
    canRollDice: true,
    validMoves: [],
    gameStarted: true,
    gameOver: false,
    winner: null,
    consecutiveSixes: 0,
    lastUpdate: Date.now(),
  };

  return gameState;
}

/**
 * Roll dice - returns 1-6
 */
export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Check if token can move out of base
 */
export function canMoveOut(diceValue) {
  return diceValue === 6;
}

/**
 * Get valid moves for current player
 */
export function getValidMoves(gameState) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const diceValue = gameState.diceValue;
  
  if (!diceValue) return [];

  const validMoves = [];

  player.tokens.forEach((position, tokenIndex) => {
    if (position === -1) {
      // Token in base - can only move out on 6
      if (canMoveOut(diceValue)) {
        validMoves.push(tokenIndex);
      }
    } else if (position < WINNING_POSITION) {
      // Token on board - check if move is valid
      const newPosition = calculateNewPosition(player.color, position, diceValue);
      if (newPosition !== null && newPosition <= WINNING_POSITION) {
        validMoves.push(tokenIndex);
      }
    }
  });

  return validMoves;
}

/**
 * Calculate new position after dice roll
 */
export function calculateNewPosition(color, currentPosition, diceValue) {
  // Token in base
  if (currentPosition === -1) {
    if (diceValue === 6) {
      return 0; // Move to start position
    }
    return null;
  }

  // Token finished
  if (currentPosition >= WINNING_POSITION) {
    return null;
  }

  // Token on main path (0-51)
  if (currentPosition < BOARD_SIZE) {
    const homeEntry = HOME_ENTRY[color];
    const startPos = START_POSITIONS[color];
    
    // Calculate relative position from player's start
    let relativePos = (currentPosition - startPos + BOARD_SIZE) % BOARD_SIZE;
    let newRelativePos = relativePos + diceValue;

    // Check if entering home path
    const distanceToHome = (homeEntry - startPos + BOARD_SIZE) % BOARD_SIZE;
    
    if (newRelativePos > distanceToHome) {
      // Entering home path
      const stepsIntoHome = newRelativePos - distanceToHome;
      if (stepsIntoHome <= HOME_PATH_SIZE) {
        return BOARD_SIZE + stepsIntoHome - 1;
      } else {
        return null; // Overshoot - invalid move
      }
    }

    // Normal move on main path
    return (startPos + newRelativePos) % BOARD_SIZE;
  }

  // Token on home path (52-56)
  const homePathPosition = currentPosition - BOARD_SIZE;
  const newHomePathPosition = homePathPosition + diceValue;

  if (newHomePathPosition === HOME_PATH_SIZE) {
    return WINNING_POSITION; // Reached home!
  } else if (newHomePathPosition < HOME_PATH_SIZE) {
    return BOARD_SIZE + newHomePathPosition;
  }

  return null; // Overshoot
}

/**
 * Check if position is a safe zone
 */
export function isSafeZone(position) {
  return SAFE_ZONES.includes(position);
}

/**
 * Check for captures
 */
export function checkCapture(gameState, playerIndex, newPosition) {
  // Can't capture in base, home path, or safe zones
  if (newPosition === -1 || newPosition >= BOARD_SIZE || isSafeZone(newPosition)) {
    return null;
  }

  const captures = [];

  gameState.players.forEach((player, pIndex) => {
    if (pIndex === playerIndex) return; // Can't capture own tokens

    player.tokens.forEach((tokenPos, tokenIndex) => {
      if (tokenPos === newPosition && tokenPos < BOARD_SIZE) {
        captures.push({ playerIndex: pIndex, tokenIndex });
      }
    });
  });

  return captures.length > 0 ? captures : null;
}

/**
 * Move a token
 */
export function moveToken(gameState, tokenIndex) {
  const playerIndex = gameState.currentPlayerIndex;
  const player = gameState.players[playerIndex];
  const currentPosition = player.tokens[tokenIndex];
  const diceValue = gameState.diceValue;

  const newPosition = calculateNewPosition(player.color, currentPosition, diceValue);

  if (newPosition === null) {
    return { success: false, error: 'Invalid move' };
  }

  // Update token position
  const newGameState = { ...gameState };
  newGameState.players = [...gameState.players];
  newGameState.players[playerIndex] = {
    ...player,
    tokens: [...player.tokens],
  };
  newGameState.players[playerIndex].tokens[tokenIndex] = newPosition;

  // Check for captures
  const captures = checkCapture(newGameState, playerIndex, newPosition);
  if (captures) {
    captures.forEach(({ playerIndex: capturedPlayerIndex, tokenIndex: capturedTokenIndex }) => {
      newGameState.players[capturedPlayerIndex] = {
        ...newGameState.players[capturedPlayerIndex],
        tokens: [...newGameState.players[capturedPlayerIndex].tokens],
      };
      newGameState.players[capturedPlayerIndex].tokens[capturedTokenIndex] = -1;
    });
  }

  // Check for win
  const hasWon = newGameState.players[playerIndex].tokens.every(pos => pos === WINNING_POSITION);
  if (hasWon) {
    newGameState.players[playerIndex].hasWon = true;
    newGameState.gameOver = true;
    newGameState.winner = player.id;
  }

  // Determine next turn
  const gotSix = diceValue === 6;
  const gotCapture = captures && captures.length > 0;

  if (gotSix) {
    newGameState.consecutiveSixes = (gameState.consecutiveSixes || 0) + 1;
    
    // Three consecutive sixes - skip turn
    if (newGameState.consecutiveSixes >= 3) {
      newGameState.currentPlayerIndex = getNextPlayerIndex(newGameState);
      newGameState.consecutiveSixes = 0;
    }
    // Otherwise, same player continues
  } else if (gotCapture) {
    // Extra turn on capture
    newGameState.consecutiveSixes = 0;
  } else {
    // Normal turn advance
    newGameState.currentPlayerIndex = getNextPlayerIndex(newGameState);
    newGameState.consecutiveSixes = 0;
  }

  newGameState.diceValue = null;
  newGameState.canRollDice = true;
  newGameState.validMoves = [];
  newGameState.lastUpdate = Date.now();

  return {
    success: true,
    gameState: newGameState,
    captured: captures,
    hasWon,
  };
}

/**
 * Get next player index (skip players who have won)
 */
function getNextPlayerIndex(gameState) {
  let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  let attempts = 0;

  while (gameState.players[nextIndex].hasWon && attempts < gameState.players.length) {
    nextIndex = (nextIndex + 1) % gameState.players.length;
    attempts++;
  }

  return nextIndex;
}

/**
 * Process dice roll
 */
export function processDiceRoll(gameState) {
  const diceValue = rollDice();
  
  const newGameState = {
    ...gameState,
    diceValue,
    canRollDice: false,
    lastUpdate: Date.now(),
  };

  const validMoves = getValidMoves(newGameState);
  newGameState.validMoves = validMoves;

  // If no valid moves, advance turn
  if (validMoves.length === 0) {
    newGameState.currentPlayerIndex = getNextPlayerIndex(newGameState);
    newGameState.diceValue = null;
    newGameState.canRollDice = true;
    newGameState.consecutiveSixes = 0;
  }

  return newGameState;
}

/**
 * Convert position to global coordinates for rendering
 */
export function getGlobalPosition(color, position) {
  if (position === -1) return { type: 'base', color };
  if (position >= WINNING_POSITION) return { type: 'home', color };
  if (position >= BOARD_SIZE) return { type: 'homePath', color, step: position - BOARD_SIZE };
  
  return { type: 'main', position };
}
