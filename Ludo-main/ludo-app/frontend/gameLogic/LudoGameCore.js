/**
 * Ludo Game Core Logic
 * Complete game rules implementation matching Ludo King
 */

import {
  calculateNextPosition,
  isSafePosition,
  BOARD_CONFIG,
  BASE_POSITION,
} from './LudoPathCalculator';

export const PLAYER_COLORS = ['red', 'green', 'yellow', 'blue'];

/**
 * Initialize a new game with players
 */
export function initializeGame(players) {
  if (players.length < 2 || players.length > 4) {
    throw new Error('Game requires 2-4 players');
  }

  return {
    gameId: null,
    players: players.map((player, index) => ({
      id: player.id,
      name: player.name,
      color: PLAYER_COLORS[index],
      tokens: Array(BOARD_CONFIG.TOKENS_PER_PLAYER).fill(BASE_POSITION),
      tokensFinished: 0,
      hasWon: false,
      isActive: true,
    })),
    currentPlayerIndex: 0,
    diceValue: null,
    canRollDice: true,
    validMoves: [],
    consecutiveSixes: 0,
    gameStatus: 'active', // active, finished
    winner: null,
    turnStartTime: Date.now(),
    lastUpdate: Date.now(),
  };
}

/**
 * Roll the dice (1-6)
 */
export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Process a dice roll and update game state
 */
export function processDiceRoll(gameState) {
  const diceValue = rollDice();
  
  const newState = {
    ...gameState,
    diceValue,
    canRollDice: false,
    lastUpdate: Date.now(),
  };

  // Calculate valid moves
  const validMoves = calculateValidMoves(newState);
  newState.validMoves = validMoves;

  // If no valid moves, skip turn
  if (validMoves.length === 0) {
    return advanceTurn(newState, false);
  }

  return newState;
}

/**
 * Calculate all valid moves for current player
 */
export function calculateValidMoves(gameState) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const { diceValue } = gameState;

  if (!diceValue) return [];

  const validMoves = [];

  player.tokens.forEach((position, tokenIndex) => {
    const newPosition = calculateNextPosition(player.color, position, diceValue);
    
    if (newPosition !== null) {
      validMoves.push(tokenIndex);
    }
  });

  return validMoves;
}

/**
 * Move a token and handle captures
 */
export function moveToken(gameState, tokenIndex) {
  const playerIndex = gameState.currentPlayerIndex;
  const player = gameState.players[playerIndex];
  const currentPosition = player.tokens[tokenIndex];
  const { diceValue } = gameState;

  // Validate move
  if (!gameState.validMoves.includes(tokenIndex)) {
    return { success: false, error: 'Invalid move' };
  }

  const newPosition = calculateNextPosition(player.color, currentPosition, diceValue);

  if (newPosition === null) {
    return { success: false, error: 'Cannot move to that position' };
  }

  // Create new state
  const newState = JSON.parse(JSON.stringify(gameState));
  newState.players[playerIndex].tokens[tokenIndex] = newPosition;

  // Check if token reached home
  if (newPosition === BOARD_CONFIG.WINNING_POSITION) {
    newState.players[playerIndex].tokensFinished++;
    
    // Check for win
    if (newState.players[playerIndex].tokensFinished === BOARD_CONFIG.TOKENS_PER_PLAYER) {
      newState.players[playerIndex].hasWon = true;
      newState.gameStatus = 'finished';
      newState.winner = player.id;
    }
  }

  // Check for captures
  const captures = checkForCaptures(newState, playerIndex, newPosition);
  
  // Apply captures
  if (captures.length > 0) {
    captures.forEach(({ playerIndex: capturedPlayerIndex, tokenIndex: capturedTokenIndex }) => {
      newState.players[capturedPlayerIndex].tokens[capturedTokenIndex] = BASE_POSITION;
      if (newState.players[capturedPlayerIndex].tokensFinished > 0) {
        newState.players[capturedPlayerIndex].tokensFinished--;
      }
    });
  }

  // Determine if player gets another turn
  const gotSix = diceValue === 6;
  const gotCapture = captures.length > 0;

  newState.lastUpdate = Date.now();

  if (gotSix) {
    newState.consecutiveSixes++;
    
    // Three consecutive sixes - lose turn
    if (newState.consecutiveSixes >= 3) {
      return {
        success: true,
        gameState: advanceTurn(newState, false),
        captures,
        threeSixes: true,
      };
    }
    
    // Continue turn
    newState.diceValue = null;
    newState.canRollDice = true;
    newState.validMoves = [];
    
    return {
      success: true,
      gameState: newState,
      captures,
      extraTurn: true,
    };
  }

  if (gotCapture) {
    // Extra turn for capture
    newState.diceValue = null;
    newState.canRollDice = true;
    newState.validMoves = [];
    newState.consecutiveSixes = 0;
    
    return {
      success: true,
      gameState: newState,
      captures,
      extraTurn: true,
    };
  }

  // Normal turn advance
  return {
    success: true,
    gameState: advanceTurn(newState, false),
    captures,
  };
}

/**
 * Check for token captures at a position
 */
function checkForCaptures(gameState, movingPlayerIndex, position) {
  // Can't capture in safe zones or home path
  if (isSafePosition(position) || position >= BOARD_CONFIG.MAIN_PATH_LENGTH) {
    return [];
  }

  const captures = [];

  gameState.players.forEach((player, playerIndex) => {
    if (playerIndex === movingPlayerIndex) return;

    player.tokens.forEach((tokenPos, tokenIndex) => {
      if (tokenPos === position && tokenPos < BOARD_CONFIG.MAIN_PATH_LENGTH) {
        captures.push({ playerIndex, tokenIndex });
      }
    });
  });

  return captures;
}

/**
 * Advance to next player's turn
 */
function advanceTurn(gameState, keepSixes = false) {
  const newState = { ...gameState };
  
  newState.currentPlayerIndex = getNextActivePlayerIndex(newState);
  newState.diceValue = null;
  newState.canRollDice = true;
  newState.validMoves = [];
  newState.turnStartTime = Date.now();
  
  if (!keepSixes) {
    newState.consecutiveSixes = 0;
  }

  return newState;
}

/**
 * Get next active player index (skip players who have won)
 */
function getNextActivePlayerIndex(gameState) {
  let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  let attempts = 0;

  while (gameState.players[nextIndex].hasWon && attempts < gameState.players.length) {
    nextIndex = (nextIndex + 1) % gameState.players.length;
    attempts++;
  }

  return nextIndex;
}

/**
 * Check if a player can make any move
 */
export function hasValidMoves(gameState, playerIndex) {
  const player = gameState.players[playerIndex];
  const { diceValue } = gameState;

  if (!diceValue) return false;

  return player.tokens.some((position) => {
    return calculateNextPosition(player.color, position, diceValue) !== null;
  });
}

/**
 * Get game statistics
 */
export function getGameStats(gameState) {
  return gameState.players.map(player => ({
    id: player.id,
    name: player.name,
    color: player.color,
    tokensOut: player.tokens.filter(pos => pos !== BASE_POSITION).length,
    tokensFinished: player.tokensFinished,
    hasWon: player.hasWon,
  }));
}

export default {
  initializeGame,
  rollDice,
  processDiceRoll,
  calculateValidMoves,
  moveToken,
  hasValidMoves,
  getGameStats,
  PLAYER_COLORS,
};
