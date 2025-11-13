// Complete Ludo King Game Logic

// Game constants
export const TOTAL_PLAYERS = 4;
export const TOKENS_PER_PLAYER = 4;
export const WINNING_POSITION = 57;
export const HOME_POSITION = -1;

// Path positions (52 cells in main path)
export const MAIN_PATH_LENGTH = 52;
export const HOME_PATH_LENGTH = 6;

// Starting positions for each player on main path
export const START_POSITIONS = {
  0: 1,   // Red starts at position 1
  1: 14,  // Blue starts at position 14
  2: 27,  // Yellow starts at position 27
  3: 40,  // Green starts at position 40
};

// Safe positions (can't be captured)
export const SAFE_POSITIONS = [1, 9, 14, 22, 27, 35, 40, 48];

// Home entry positions (where tokens enter home path)
export const HOME_ENTRY_POSITIONS = {
  0: 51,  // Red enters home path at 51
  1: 12,  // Blue enters home path at 12
  2: 25,  // Yellow enters home path at 25
  3: 38,  // Green enters home path at 38
};

// Initialize game state
export const initializeGame = (numPlayers = 4) => {
  const players = [];
  const tokens = {};

  for (let i = 0; i < numPlayers; i++) {
    const playerId = i;
    players.push(playerId);
    tokens[playerId] = Array(TOKENS_PER_PLAYER).fill(HOME_POSITION);
  }

  return {
    players,
    tokens,
    currentPlayer: 0,
    diceValue: null,
    gameStarted: false,
    winner: null,
    lastRoll: null,
    consecutiveSixes: 0,
  };
};

// Roll dice (1-6)
export const rollDice = () => {
  return Math.floor(Math.random() * 6) + 1;
};

// Check if token can move out of home
export const canMoveOut = (diceValue) => {
  return diceValue === 6;
};

// Get absolute position on board
export const getAbsolutePosition = (playerId, relativePosition) => {
  if (relativePosition === HOME_POSITION) return HOME_POSITION;
  if (relativePosition >= MAIN_PATH_LENGTH) return relativePosition; // In home path
  
  const startPos = START_POSITIONS[playerId];
  const absolutePos = (startPos + relativePosition - 1) % MAIN_PATH_LENGTH;
  return absolutePos;
};

// Check if position is safe
export const isSafePosition = (absolutePosition) => {
  return SAFE_POSITIONS.includes(absolutePosition);
};

// Check if token can enter home path
export const canEnterHomePath = (playerId, currentPosition, diceValue) => {
  const homeEntry = HOME_ENTRY_POSITIONS[playerId];
  const newPosition = currentPosition + diceValue;
  
  // Check if token will reach or pass home entry
  if (currentPosition < MAIN_PATH_LENGTH && newPosition >= homeEntry) {
    return true;
  }
  
  return false;
};

// Calculate new position after move
export const calculateNewPosition = (playerId, currentPosition, diceValue) => {
  // Token at home
  if (currentPosition === HOME_POSITION) {
    if (canMoveOut(diceValue)) {
      return 0; // Move to start position
    }
    return HOME_POSITION;
  }

  // Token on main path
  if (currentPosition < MAIN_PATH_LENGTH) {
    const homeEntry = HOME_ENTRY_POSITIONS[playerId];
    const relativePos = currentPosition;
    const newRelativePos = relativePos + diceValue;

    // Check if entering home path
    if (newRelativePos > homeEntry && relativePos <= homeEntry) {
      const stepsIntoHome = newRelativePos - homeEntry - 1;
      return MAIN_PATH_LENGTH + stepsIntoHome;
    }

    // Normal move on main path
    if (newRelativePos < MAIN_PATH_LENGTH) {
      return newRelativePos;
    }

    // Wrap around
    return newRelativePos % MAIN_PATH_LENGTH;
  }

  // Token on home path
  const homePathPos = currentPosition - MAIN_PATH_LENGTH;
  const newHomePathPos = homePathPos + diceValue;

  if (newHomePathPos === HOME_PATH_LENGTH) {
    return WINNING_POSITION; // Token finished
  }

  if (newHomePathPos < HOME_PATH_LENGTH) {
    return MAIN_PATH_LENGTH + newHomePathPos;
  }

  // Can't move (would overshoot)
  return currentPosition;
};

// Get valid moves for current player
export const getValidMoves = (gameState, playerId, diceValue) => {
  const validMoves = [];
  const playerTokens = gameState.tokens[playerId];

  playerTokens.forEach((position, tokenIndex) => {
    // Token at home
    if (position === HOME_POSITION) {
      if (canMoveOut(diceValue)) {
        validMoves.push(tokenIndex);
      }
      return;
    }

    // Token finished
    if (position === WINNING_POSITION) {
      return;
    }

    // Calculate new position
    const newPos = calculateNewPosition(playerId, position, diceValue);

    // Check if move is valid
    if (newPos !== position) {
      validMoves.push(tokenIndex);
    }
  });

  return validMoves;
};

// Check for captures
export const checkCapture = (gameState, playerId, newPosition) => {
  if (newPosition === HOME_POSITION || newPosition >= MAIN_PATH_LENGTH) {
    return []; // Can't capture in home or home path
  }

  const absolutePos = getAbsolutePosition(playerId, newPosition);

  if (isSafePosition(absolutePos)) {
    return []; // Can't capture on safe positions
  }

  const captured = [];

  // Check all other players' tokens
  gameState.players.forEach((otherPlayerId) => {
    if (otherPlayerId === playerId) return;

    gameState.tokens[otherPlayerId].forEach((tokenPos, tokenIndex) => {
      if (tokenPos === HOME_POSITION || tokenPos >= MAIN_PATH_LENGTH) return;

      const otherAbsolutePos = getAbsolutePosition(otherPlayerId, tokenPos);

      if (otherAbsolutePos === absolutePos) {
        captured.push({ playerId: otherPlayerId, tokenIndex });
      }
    });
  });

  return captured;
};

// Move token
export const moveToken = (gameState, playerId, tokenIndex, diceValue) => {
  const newState = JSON.parse(JSON.stringify(gameState));
  const currentPosition = newState.tokens[playerId][tokenIndex];
  const newPosition = calculateNewPosition(playerId, currentPosition, diceValue);

  // Update token position
  newState.tokens[playerId][tokenIndex] = newPosition;

  // Check for captures
  const captured = checkCapture(newState, playerId, newPosition);
  captured.forEach(({ playerId: capturedPlayerId, tokenIndex: capturedTokenIndex }) => {
    newState.tokens[capturedPlayerId][capturedTokenIndex] = HOME_POSITION;
  });

  // Check if player gets another turn (rolled 6 or captured)
  const getsAnotherTurn = diceValue === 6 || captured.length > 0;

  if (!getsAnotherTurn) {
    // Next player's turn
    newState.currentPlayer = (newState.currentPlayer + 1) % newState.players.length;
  }

  // Update consecutive sixes
  if (diceValue === 6) {
    newState.consecutiveSixes = (newState.consecutiveSixes || 0) + 1;
    
    // If 3 consecutive sixes, skip turn
    if (newState.consecutiveSixes >= 3) {
      newState.currentPlayer = (newState.currentPlayer + 1) % newState.players.length;
      newState.consecutiveSixes = 0;
    }
  } else {
    newState.consecutiveSixes = 0;
  }

  // Check for winner
  const allFinished = newState.tokens[playerId].every(pos => pos === WINNING_POSITION);
  if (allFinished) {
    newState.winner = playerId;
  }

  newState.lastRoll = diceValue;

  return {
    newState,
    captured,
    getsAnotherTurn,
    tokenFinished: newPosition === WINNING_POSITION,
  };
};

// Check if player has won
export const hasPlayerWon = (gameState, playerId) => {
  return gameState.tokens[playerId].every(pos => pos === WINNING_POSITION);
};

// Get token color
export const getTokenColor = (playerId) => {
  const colors = ['#E53935', '#1E88E5', '#FDD835', '#43A047'];
  return colors[playerId];
};

// Get player name
export const getPlayerName = (playerId) => {
  const names = ['Red', 'Blue', 'Yellow', 'Green'];
  return names[playerId];
};
