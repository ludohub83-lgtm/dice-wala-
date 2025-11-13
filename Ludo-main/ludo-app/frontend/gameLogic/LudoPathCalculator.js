/**
 * Ludo Path Calculator
 * Handles precise path calculations for Ludo King-style board
 */

// Board configuration matching Ludo King
export const BOARD_CONFIG = {
  MAIN_PATH_LENGTH: 52,
  HOME_PATH_LENGTH: 6,
  TOKENS_PER_PLAYER: 4,
  WINNING_POSITION: 57,
};

// Starting positions on the main circular path
export const START_POSITIONS = {
  red: 1,
  green: 14,
  yellow: 27,
  blue: 40,
};

// Home entry positions (where tokens turn into colored home path)
export const HOME_ENTRY_POSITIONS = {
  red: 51,
  green: 12,
  yellow: 25,
  blue: 38,
};

// Safe zones (star positions - tokens cannot be captured here)
export const SAFE_POSITIONS = [1, 9, 14, 22, 27, 35, 40, 48];

// Base positions (starting area for each color)
export const BASE_POSITION = -1;

/**
 * Calculate the next position for a token
 * @param {string} color - Player color
 * @param {number} currentPos - Current position (-1 for base, 0-51 for main path, 52-56 for home path, 57 for finished)
 * @param {number} steps - Number of steps to move
 * @returns {number|null} New position or null if invalid
 */
export function calculateNextPosition(color, currentPos, steps) {
  // Token in base
  if (currentPos === BASE_POSITION) {
    if (steps === 6) {
      return 0; // Move to starting position
    }
    return null; // Can only exit on 6
  }

  // Token already finished
  if (currentPos >= BOARD_CONFIG.WINNING_POSITION) {
    return null;
  }

  const startPos = START_POSITIONS[color];
  const homeEntry = HOME_ENTRY_POSITIONS[color];

  // Token on main circular path (0-51)
  if (currentPos < BOARD_CONFIG.MAIN_PATH_LENGTH) {
    // Calculate relative position from player's start
    const relativePos = (currentPos - startPos + BOARD_CONFIG.MAIN_PATH_LENGTH) % BOARD_CONFIG.MAIN_PATH_LENGTH;
    const homeEntryRelative = (homeEntry - startPos + BOARD_CONFIG.MAIN_PATH_LENGTH) % BOARD_CONFIG.MAIN_PATH_LENGTH;
    
    const newRelativePos = relativePos + steps;

    // Check if passing or landing on home entry
    if (newRelativePos === homeEntryRelative) {
      // Enter home path
      return BOARD_CONFIG.MAIN_PATH_LENGTH; // First position of home path
    } else if (newRelativePos > homeEntryRelative) {
      // Moving into home path
      const stepsIntoHome = newRelativePos - homeEntryRelative;
      if (stepsIntoHome <= BOARD_CONFIG.HOME_PATH_LENGTH) {
        return BOARD_CONFIG.MAIN_PATH_LENGTH + stepsIntoHome - 1;
      }
      return null; // Overshoot - invalid move
    }

    // Normal move on main path
    return (startPos + newRelativePos) % BOARD_CONFIG.MAIN_PATH_LENGTH;
  }

  // Token on home path (52-56)
  const homePathPos = currentPos - BOARD_CONFIG.MAIN_PATH_LENGTH;
  const newHomePathPos = homePathPos + steps;

  if (newHomePathPos === BOARD_CONFIG.HOME_PATH_LENGTH) {
    return BOARD_CONFIG.WINNING_POSITION; // Reached home!
  } else if (newHomePathPos < BOARD_CONFIG.HOME_PATH_LENGTH) {
    return BOARD_CONFIG.MAIN_PATH_LENGTH + newHomePathPos;
  }

  return null; // Overshoot
}

/**
 * Check if a position is safe from capture
 */
export function isSafePosition(position) {
  if (position === BASE_POSITION) return true;
  if (position >= BOARD_CONFIG.MAIN_PATH_LENGTH) return true; // Home path is safe
  return SAFE_POSITIONS.includes(position);
}

/**
 * Get the absolute position on the board for rendering
 * @param {string} color - Player color
 * @param {number} position - Token position
 * @returns {object} Position info for rendering
 */
export function getAbsolutePosition(color, position) {
  if (position === BASE_POSITION) {
    return { type: 'base', color, position: BASE_POSITION };
  }

  if (position >= BOARD_CONFIG.WINNING_POSITION) {
    return { type: 'finished', color, position };
  }

  if (position >= BOARD_CONFIG.MAIN_PATH_LENGTH) {
    const homeStep = position - BOARD_CONFIG.MAIN_PATH_LENGTH;
    return { type: 'homePath', color, step: homeStep, position };
  }

  return { type: 'mainPath', position, isSafe: isSafePosition(position) };
}

/**
 * Check if two tokens are on the same position
 */
export function areTokensOnSamePosition(pos1, pos2) {
  return pos1 === pos2 && pos1 !== BASE_POSITION && pos1 < BOARD_CONFIG.MAIN_PATH_LENGTH;
}

/**
 * Get all positions a token will pass through
 */
export function getPathPositions(color, startPos, steps) {
  const positions = [];
  let currentPos = startPos;

  for (let i = 1; i <= steps; i++) {
    currentPos = calculateNextPosition(color, currentPos === startPos ? startPos : currentPos, 1);
    if (currentPos !== null) {
      positions.push(currentPos);
    }
  }

  return positions;
}

export default {
  calculateNextPosition,
  isSafePosition,
  getAbsolutePosition,
  areTokensOnSamePosition,
  getPathPositions,
  BOARD_CONFIG,
  START_POSITIONS,
  HOME_ENTRY_POSITIONS,
  SAFE_POSITIONS,
  BASE_POSITION,
};
