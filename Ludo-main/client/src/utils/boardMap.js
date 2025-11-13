/**
 * Board Mapping Utilities
 * Maps game positions to pixel coordinates for UI rendering
 * 
 * IMPORTANT: Adapt these functions to match your exact board layout
 */

/**
 * Position encoding:
 * -1: Yard (starting area)
 * 0-51: Main circular track
 * 100-105: Red home stretch
 * 110-115: Green home stretch
 * 120-125: Yellow home stretch
 * 130-135: Blue home stretch
 */

// Board dimensions - ADJUST TO YOUR UI
const BOARD_SIZE = 400; // Total board size in pixels
const CELL_SIZE = BOARD_SIZE / 15; // Each cell size

/**
 * Get pixel coordinates for a position
 * @param {number} position - Game position
 * @param {string} color - Player color ('red', 'green', 'yellow', 'blue')
 * @param {number} tokenIndex - Token index (0-3) for yard positioning
 * @returns {{ x: number, y: number }} Pixel coordinates
 */
export function getPositionCoordinates(position, color, tokenIndex = 0) {
  // Yard positions (starting area)
  if (position === -1) {
    return getYardCoordinates(color, tokenIndex);
  }

  // Home stretch positions
  if (position >= 100) {
    return getHomeStretchCoordinates(position, color);
  }

  // Main track positions (0-51)
  return getTrackCoordinates(position);
}

/**
 * Get yard coordinates for a token
 * Tokens are arranged in 2x2 grid in each corner
 */
function getYardCoordinates(color, tokenIndex) {
  const yardPositions = {
    red: { baseX: 1, baseY: 10 },
    green: { baseX: 1, baseY: 1 },
    yellow: { baseX: 10, baseY: 1 },
    blue: { baseX: 10, baseY: 10 },
  };

  const base = yardPositions[color];
  
  // 2x2 grid offsets for 4 tokens
  const offsets = [
    { dx: 0.5, dy: 0.5 },
    { dx: 2, dy: 0.5 },
    { dx: 0.5, dy: 2 },
    { dx: 2, dy: 2 },
  ];

  const offset = offsets[tokenIndex];

  return {
    x: (base.baseX + offset.dx) * CELL_SIZE,
    y: (base.baseY + offset.dy) * CELL_SIZE,
  };
}

/**
 * Get home stretch coordinates
 * Home stretch is the colored path leading to center
 */
function getHomeStretchCoordinates(position, color) {
  const homeStretches = {
    red: { startX: 7, startY: 13, dx: 0, dy: -1 },
    green: { startX: 1, startY: 7, dx: 1, dy: 0 },
    yellow: { startX: 7, startY: 1, dx: 0, dy: 1 },
    blue: { startX: 13, startY: 7, dx: -1, dy: 0 },
  };

  const stretch = homeStretches[color];
  const homeBase = {
    red: 100,
    green: 110,
    yellow: 120,
    blue: 130,
  };

  const step = position - homeBase[color];

  return {
    x: (stretch.startX + stretch.dx * step) * CELL_SIZE + CELL_SIZE / 2,
    y: (stretch.startY + stretch.dy * step) * CELL_SIZE + CELL_SIZE / 2,
  };
}

/**
 * Get main track coordinates
 * The 52-cell circular path around the board
 * 
 * IMPORTANT: This is a simplified mapping. You MUST adapt this to match
 * your exact board layout. The positions should follow the path clockwise
 * starting from red's entry point (position 0).
 */
function getTrackCoordinates(position) {
  // This is a TEMPLATE - adjust to your board's exact layout
  const trackPath = generateTrackPath();
  
  if (position < 0 || position >= trackPath.length) {
    console.warn(`Invalid track position: ${position}`);
    return { x: 0, y: 0 };
  }

  const cell = trackPath[position];
  return {
    x: cell.x * CELL_SIZE + CELL_SIZE / 2,
    y: cell.y * CELL_SIZE + CELL_SIZE / 2,
  };
}

/**
 * Generate the track path coordinates
 * This defines the 52 positions of the main circular track
 * 
 * CRITICAL: Adapt this to match your board's exact cell positions
 * The path should start at red's entry (position 0) and go clockwise
 */
function generateTrackPath() {
  const path = [];

  // Red's path (bottom, going left)
  // Entry at position 0
  for (let i = 0; i < 6; i++) {
    path.push({ x: 6, y: 13 - i });
  }

  // Left side (going up)
  for (let i = 0; i < 5; i++) {
    path.push({ x: 5 - i, y: 8 });
  }
  path.push({ x: 0, y: 7 });

  // Green's path (left, going up)
  // Entry at position 13
  for (let i = 0; i < 6; i++) {
    path.push({ x: i, y: 6 });
  }

  // Top side (going right)
  for (let i = 0; i < 5; i++) {
    path.push({ x: 6, y: 5 - i });
  }
  path.push({ x: 7, y: 0 });

  // Yellow's path (top, going right)
  // Entry at position 26
  for (let i = 0; i < 6; i++) {
    path.push({ x: 8, y: i });
  }

  // Right side (going down)
  for (let i = 0; i < 5; i++) {
    path.push({ x: 9 + i, y: 6 });
  }
  path.push({ x: 14, y: 7 });

  // Blue's path (right, going down)
  // Entry at position 39
  for (let i = 0; i < 6; i++) {
    path.push({ x: 14 - i, y: 8 });
  }

  // Bottom side (going left)
  for (let i = 0; i < 5; i++) {
    path.push({ x: 8, y: 9 + i });
  }
  path.push({ x: 7, y: 14 });

  // Complete the circle back to red's entry
  for (let i = 0; i < 6; i++) {
    path.push({ x: 6, y: 14 - i });
  }

  return path.slice(0, 52); // Ensure exactly 52 positions
}

/**
 * Get all token positions for rendering
 * @param {Object} game - Game state from Firestore
 * @returns {Array} Array of token render data
 */
export function getAllTokenPositions(game) {
  if (!game || !game.tokens) return [];

  const tokenPositions = [];

  game.players.forEach((player) => {
    const playerTokens = game.tokens[player.id] || [];
    
    playerTokens.forEach((token, index) => {
      const coords = getPositionCoordinates(token.pos, player.color, index);
      
      tokenPositions.push({
        playerId: player.id,
        playerColor: player.color,
        tokenIndex: index,
        position: token.pos,
        inHome: token.inHome,
        x: coords.x,
        y: coords.y,
      });
    });
  });

  return tokenPositions;
}

/**
 * Check if a token can be selected (is in available moves)
 * @param {Object} game - Game state
 * @param {string} playerId - Player ID
 * @param {number} tokenIndex - Token index
 * @returns {boolean} True if token can be selected
 */
export function isTokenSelectable(game, playerId, tokenIndex) {
  if (!game || !game.availableMoves) return false;
  const moves = game.availableMoves[playerId] || [];
  return moves.includes(tokenIndex);
}

/**
 * Get board dimensions for responsive sizing
 */
export function getBoardDimensions() {
  return {
    boardSize: BOARD_SIZE,
    cellSize: CELL_SIZE,
  };
}

export default {
  getPositionCoordinates,
  getAllTokenPositions,
  isTokenSelectable,
  getBoardDimensions,
};
