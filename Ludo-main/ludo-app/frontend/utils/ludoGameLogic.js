// Proper Ludo game logic like Ludo King

// Track configuration
export const TRACK_LENGTH = 51; // Main track (0-50)
export const HOME_STRETCH_LENGTH = 6; // Home stretch (51-56)
export const TOTAL_PATH = TRACK_LENGTH + HOME_STRETCH_LENGTH; // 0-56

// Entry points for each player (where they enter the track)
// These are the positions on the main track where each player enters
export const ENTRY_POINTS = [1, 14, 27, 40]; // Red, Blue, Green, Yellow

// Home stretch start positions
export const HOME_STRETCH_START = [51, 51, 51, 51];

// Safe cells (cannot be captured)
export const SAFE_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48]);

// Player colors
export const PLAYER_COLORS = ['#EF4444', '#2563EB', '#22C55E', '#FBBF24'];

/**
 * Get the next position on the track
 */
export function getNextPosition(currentPos, steps, playerIndex) {
  if (currentPos < 0) {
    // In home, need 6 to get out
    if (steps === 6) {
      return ENTRY_POINTS[playerIndex];
    }
    return -1; // Stay in home
  }

  if (currentPos < TRACK_LENGTH) {
    // On main track - move forward
    let nextPos = currentPos + steps;
    const entryPoint = ENTRY_POINTS[playerIndex];
    
    // Check if we've passed our entry point (need to complete full loop first)
    // If we're moving past our entry point, we can enter home stretch
    if (currentPos < entryPoint && nextPos >= entryPoint) {
      // We've reached/passed our entry point
      const overshoot = nextPos - entryPoint;
      if (overshoot <= HOME_STRETCH_LENGTH) {
        // Enter home stretch
        return HOME_STRETCH_START[playerIndex] + overshoot - 1;
      }
      // Overshot home stretch, continue on track
      return nextPos;
    }
    
    // Normal movement - check if we've looped around
    if (nextPos >= TRACK_LENGTH) {
      // We've completed the track, check if we can enter home stretch
      const loopPos = nextPos - TRACK_LENGTH;
      if (loopPos <= entryPoint) {
        // We can enter home stretch if we're at or past entry point
        const overshoot = loopPos;
        if (overshoot <= HOME_STRETCH_LENGTH) {
          return HOME_STRETCH_START[playerIndex] + overshoot - 1;
        }
      }
      // Continue on track (wrapped around)
      return loopPos;
    }
    
    return nextPos;
  } else {
    // In home stretch
    const homeStretchPos = currentPos - HOME_STRETCH_START[playerIndex];
    const nextHomePos = homeStretchPos + steps;
    
    if (nextHomePos <= HOME_STRETCH_LENGTH) {
      return HOME_STRETCH_START[playerIndex] + nextHomePos;
    }
    
    // Overshoot - invalid move, stay in place
    return currentPos;
  }
}

/**
 * Check if a move is valid
 */
export function isValidMove(currentPos, steps, playerIndex) {
  if (currentPos < 0) {
    return steps === 6; // Need 6 to get out
  }
  
  if (currentPos < TRACK_LENGTH) {
    // On main track - any move is valid
    return true;
  }
  
  // In home stretch - check if we can finish
  const homeStretchPos = currentPos - HOME_STRETCH_START[playerIndex];
  return homeStretchPos + steps <= HOME_STRETCH_LENGTH;
}

/**
 * Check if position is a safe cell
 */
export function isSafeCell(pos) {
  return SAFE_CELLS.has(pos);
}

/**
 * Check if piece can capture opponent at this position
 */
export function canCapture(pos, capturingPlayerIndex) {
  if (pos < 0 || pos >= TRACK_LENGTH) return false; // Can't capture in home or home stretch
  if (isSafeCell(pos)) return false; // Can't capture on safe cells
  
  return true;
}

/**
 * Convert position to board coordinates (x, y in 0-14 grid)
 * Board is 15x15 grid (0-14)
 */
export function positionToBoardXY(pos, playerIndex, tokenIndex = 0) {
  if (pos < 0) {
    // Home positions (2x2 grid in corner)
    const homePositions = [
      // Red (top-left)
      [{ x: 2.5, y: 2.5 }, { x: 3.5, y: 2.5 }, { x: 2.5, y: 3.5 }, { x: 3.5, y: 3.5 }],
      // Blue (top-right)
      [{ x: 11.5, y: 2.5 }, { x: 12.5, y: 2.5 }, { x: 11.5, y: 3.5 }, { x: 12.5, y: 3.5 }],
      // Green (bottom-left)
      [{ x: 2.5, y: 11.5 }, { x: 3.5, y: 11.5 }, { x: 2.5, y: 12.5 }, { x: 3.5, y: 12.5 }],
      // Yellow (bottom-right)
      [{ x: 11.5, y: 11.5 }, { x: 12.5, y: 11.5 }, { x: 11.5, y: 12.5 }, { x: 12.5, y: 12.5 }],
    ];
    return homePositions[playerIndex % 4][tokenIndex % 4];
  }

  // Main track positions (0-50)
  // Track goes around the board: top -> right -> bottom -> left
  if (pos < TRACK_LENGTH) {
    // Create track mapping
    const trackCells = [];
    
    // Top row: x from 1 to 6, y = 6 (positions 0-5)
    for (let i = 0; i < 6; i++) {
      trackCells.push({ x: 1 + i, y: 6 });
    }
    
    // Right column: x = 8, y from 1 to 6 (positions 6-11)
    for (let i = 0; i < 6; i++) {
      trackCells.push({ x: 8, y: 1 + i });
    }
    
    // Bottom row: x from 13 to 8, y = 8 (positions 12-17)
    for (let i = 0; i < 6; i++) {
      trackCells.push({ x: 13 - i, y: 8 });
    }
    
    // Left column: x = 6, y from 13 to 8 (positions 18-23)
    for (let i = 0; i < 6; i++) {
      trackCells.push({ x: 6, y: 13 - i });
    }
    
    // Continue around (positions 24-50)
    // Top row extended: x from 7 to 12, y = 6
    for (let i = 0; i < 6; i++) {
      trackCells.push({ x: 7 + i, y: 6 });
    }
    
    // Right column extended: x = 8, y from 7 to 12
    for (let i = 0; i < 6; i++) {
      trackCells.push({ x: 8, y: 7 + i });
    }
    
    // Bottom row extended: x from 7 to 2, y = 8
    for (let i = 0; i < 6; i++) {
      trackCells.push({ x: 7 - i, y: 8 });
    }
    
    // Left column extended: x = 6, y from 7 to 2
    for (let i = 0; i < 6; i++) {
      trackCells.push({ x: 6, y: 7 - i });
    }
    
    // Final positions to complete the loop
    for (let i = 0; i < 3; i++) {
      trackCells.push({ x: 1 + i, y: 6 });
    }
    
    if (pos < trackCells.length) {
      return trackCells[pos];
    }
    
    // Fallback
    return { x: 7, y: 7 };
  }

  // Home stretch (51-56) - path to center
  const homeStep = pos - HOME_STRETCH_START[playerIndex];
  const homeStretches = [
    { x: 7, y: 5.5 - homeStep * 0.5 }, // Red: top to center
    { x: 8.5 + homeStep * 0.5, y: 7 }, // Blue: right to center
    { x: 7, y: 8.5 + homeStep * 0.5 }, // Green: bottom to center
    { x: 5.5 - homeStep * 0.5, y: 7 }, // Yellow: left to center
  ];
  
  return homeStretches[playerIndex % 4];
}

/**
 * Get all valid moves for a player
 */
export function getValidMoves(tokens, diceRoll, playerIndex) {
  const validMoves = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const pos = tokens[i];
    if (isValidMove(pos, diceRoll, playerIndex)) {
      validMoves.push(i);
    }
  }
  
  return validMoves;
}

