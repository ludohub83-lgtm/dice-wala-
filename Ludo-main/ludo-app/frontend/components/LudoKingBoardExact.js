import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Polygon, Circle, Line, Rect, G, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 420);
const CELL_SIZE = BOARD_SIZE / 15;

// Exact Ludo King colors
const COLORS = {
  RED: '#E53935',
  GREEN: '#43A047', 
  YELLOW: '#FDD835',
  BLUE: '#1E88E5',
};

// Path coordinates (52 cells clockwise) - Exact Ludo King layout
const PATH = [
  // Red start arrow (left side, row 6)
  [0,6],
  // Continue right to red home
  [1,6],[2,6],[3,6],[4,6],[5,6],
  // Turn down (column 6)
  [6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],
  // Yellow start arrow (bottom, column 8)
  [6,13],[7,13],
  // Continue right
  [8,13],[9,13],[10,13],[11,13],[12,13],[13,13],
  // Turn up (column 13)
  [13,12],[13,11],[13,10],[13,9],[13,8],
  // Green start arrow (right side, row 8)
  [13,7],[13,6],
  // Continue up
  [13,5],[13,4],[13,3],[13,2],[13,1],[13,0],
  // Turn left (row 0)
  [12,0],[11,0],[10,0],[9,0],[8,0],
  // Continue left
  [7,0],[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],
  // Blue start arrow (top, column 6)
  [6,6],
];

// Home paths (colored paths to center)
const HOME_PATHS = {
  RED: [[7,6],[7,7]], // Red goes right from column 6
  BLUE: [[6,7],[7,7]], // Blue goes down from row 6
  YELLOW: [[7,8],[7,7]], // Yellow goes left from column 8
  GREEN: [[8,7],[7,7]], // Green goes up from row 8
};

// Safe spots with stars (every 13th cell + start positions)
const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

// Starting arrows with direction
const START_ARROWS = [
  { pos: [0,6], dir: '→', color: COLORS.RED },
  { pos: [6,13], dir: '↓', color: COLORS.YELLOW },
  { pos: [13,7], dir: '←', color: COLORS.GREEN },
  { pos: [6,0], dir: '↑', color: COLORS.BLUE },
];

export default function LudoKingBoardExact({
  gameState,
  onTokenPress,
  currentPlayer,
  validMoves = [],
}) {
  
  const getPlayerColor = (pId) => {
    return [COLORS.RED, COLORS.BLUE, COLORS.YELLOW, COLORS.GREEN][pId];
  };

  // Get position for token
  const getTokenPosition = (position, playerId) => {
    if (position === -1) return null; // At home
    if (position >= 57) return null; // Finished
    
    let coord;
    if (position < 52) {
      // Main path
      coord = PATH[position];
    } else {
      // Home path (52-56)
      const homePaths = [HOME_PATHS.RED, HOME_PATHS.BLUE, HOME_PATHS.YELLOW, HOME_PATHS.GREEN];
      const homeIdx = position - 52;
      coord = homePaths[playerId]?.[homeIdx];
    }
    
    if (!coord) return null;
    return { x: coord[0] * CELL_SIZE, y: coord[1] * CELL_SIZE };
  };

  // Render home area with 2x2 grid
  const renderHomeArea = (playerId) => {
    const positions = [
      { x: 0, y: 0, color: COLORS.RED },    // Red - Top Left
      { x: 0, y: 9, color: COLORS.BLUE },   // Blue - Bottom Left  
      { x: 9, y: 9, color: COLORS.YELLOW }, // Yellow - Bottom Right
      { x: 9, y: 0, color: COLORS.GREEN },  // Green - Top Right
    ];
    
    const pos = positions[playerId];
    const homeSpots = [
      { row: 0, col: 0 }, { row: 0, col: 1 },
      { row: 1, col: 0 }, { row: 1, col: 1 },
    ];
    
    return (
      <View
        key={`home-${playerId}`}
        style={[
          styles.homeArea,
          {
            left: pos.x * CELL_SIZE,
            top: pos.y * CELL_SIZE,
            backgroundColor: pos.color,
          },
        ]}
      >
        <View style={styles.homeInner}>
          {homeSpots.map((spot, tokenIndex) => {
            const token = gameState?.tokens?.[playerId]?.[tokenIndex];
            const isAtHome = token === -1;
            const canMove = validMoves.includes(tokenIndex) && playerId === currentPlayer;
            
            return (
              <TouchableOpacity
                key={`home-token-${playerId}-${tokenIndex}`}
                style={[
                  styles.homeSpot,
                  {
                    left: (1.5 + spot.col * 2.5) * CELL_SIZE,
                    top: (1.5 + spot.row * 2.5) * CELL_SIZE,
                  },
                  canMove && styles.glowSpot,
                ]}
                onPress={() => canMove && onTokenPress?.(playerId, tokenIndex)}
                disabled={!canMove}
                activeOpacity={0.7}
              >
                {isAtHome && (
                  <View style={[styles.pinToken, { backgroundColor: '#FFF', borderColor: pos.color }]}>
                    <View style={[styles.pinHead, { backgroundColor: pos.color }]} />
                    <View style={[styles.pinShadow, { backgroundColor: pos.color }]} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Render main path cells
  const renderPath = () => {
    return PATH.map((coord, idx) => {
      const isSafe = SAFE_SPOTS.includes(idx);
      const arrow = START_ARROWS.find(a => a.pos[0] === coord[0] && a.pos[1] === coord[1]);
      
      return (
        <View
          key={`path-${idx}`}
          style={[
            styles.pathCell,
            {
              left: coord[0] * CELL_SIZE,
              top: coord[1] * CELL_SIZE,
            },
          ]}
        >
          {isSafe && <Text style={styles.star}>⭐</Text>}
          {arrow && <Text style={[styles.arrow, { color: arrow.color }]}>{arrow.dir}</Text>}
        </View>
      );
    });
  };

  // Render colored home paths
  const renderHomePaths = () => {
    const paths = [
      { color: COLORS.RED, coords: HOME_PATHS.RED },
      { color: COLORS.BLUE, coords: HOME_PATHS.BLUE },
      { color: COLORS.YELLOW, coords: HOME_PATHS.YELLOW },
      { color: COLORS.GREEN, coords: HOME_PATHS.GREEN },
    ];
    
    return paths.map((path, pIdx) => 
      path.coords.map((coord, idx) => (
        <View
          key={`home-path-${pIdx}-${idx}`}
          style={[
            styles.homePathCell,
            {
              left: coord[0] * CELL_SIZE,
              top: coord[1] * CELL_SIZE,
              backgroundColor: path.color,
              opacity: 0.3,
            },
          ]}
        />
      ))
    );
  };

  // Render center triangle
  const renderCenter = () => {
    const centerX = 7 * CELL_SIZE;
    const centerY = 7 * CELL_SIZE;
    const size = CELL_SIZE;
    
    return (
      <View style={[styles.centerTriangle, { left: centerX, top: centerY, width: size, height: size }]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Polygon points="50,50 50,0 0,50" fill={COLORS.RED} />
          <Polygon points="50,50 0,50 50,100" fill={COLORS.BLUE} />
          <Polygon points="50,50 50,100 100,50" fill={COLORS.YELLOW} />
          <Polygon points="50,50 100,50 50,0" fill={COLORS.GREEN} />
          <Circle cx="50" cy="50" r="15" fill="#FFF" stroke="#333" strokeWidth="2" />
        </Svg>
      </View>
    );
  };

  // Render tokens on board
  const renderTokens = () => {
    if (!gameState?.tokens) return null;

    return Object.entries(gameState.tokens).map(([playerId, tokens]) => {
      const color = getPlayerColor(parseInt(playerId));
      
      return tokens.map((position, tokenIndex) => {
        const coords = getTokenPosition(position, parseInt(playerId));
        if (!coords) return null;

        const canMove = validMoves.includes(tokenIndex) && parseInt(playerId) === currentPlayer;

        return (
          <TouchableOpacity
            key={`token-${playerId}-${tokenIndex}`}
            style={[
              styles.boardToken,
              {
                left: coords.x + CELL_SIZE * 0.2,
                top: coords.y + CELL_SIZE * 0.2,
              },
              canMove && styles.glowToken,
            ]}
            onPress={() => canMove && onTokenPress?.(parseInt(playerId), tokenIndex)}
            disabled={!canMove}
            activeOpacity={0.7}
          >
            <View style={[styles.pinToken, { backgroundColor: '#FFF', borderColor: color }]}>
              <View style={[styles.pinHead, { backgroundColor: color }]} />
              <View style={[styles.pinShadow, { backgroundColor: color }]} />
            </View>
          </TouchableOpacity>
        );
      });
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {/* Grid background */}
        <View style={styles.grid}>
          {Array.from({ length: 16 }).map((_, i) => (
            <React.Fragment key={`grid-${i}`}>
              <View style={[styles.gridLine, { left: i * CELL_SIZE, height: BOARD_SIZE }]} />
              <View style={[styles.gridLine, { top: i * CELL_SIZE, width: BOARD_SIZE }]} />
            </React.Fragment>
          ))}
        </View>

        {/* Home areas */}
        {[0, 1, 2, 3].map(renderHomeArea)}

        {/* Colored home paths */}
        {renderHomePaths()}

        {/* Main path */}
        {renderPath()}

        {/* Center triangle */}
        {renderCenter()}

        {/* Tokens */}
        {renderTokens()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  board: {
    position: 'relative',
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  grid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#DDD',
    width: 1,
    height: 1,
  },
  homeArea: {
    position: 'absolute',
    width: CELL_SIZE * 6,
    height: CELL_SIZE * 6,
    borderRadius: 8,
  },
  homeInner: {
    flex: 1,
    position: 'relative',
  },
  homeSpot: {
    position: 'absolute',
    width: CELL_SIZE * 1.5,
    height: CELL_SIZE * 1.5,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  glowSpot: {
    borderColor: '#FFD700',
    borderWidth: 3,
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  pathCell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homePathCell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  star: {
    fontSize: CELL_SIZE * 0.6,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  arrow: {
    fontSize: CELL_SIZE * 0.5,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  centerTriangle: {
    position: 'absolute',
  },
  pinToken: {
    width: CELL_SIZE * 0.6,
    height: CELL_SIZE * 0.6,
    borderRadius: 100,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  pinHead: {
    width: '50%',
    height: '50%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  pinShadow: {
    position: 'absolute',
    bottom: -4,
    width: '80%',
    height: 8,
    borderRadius: 100,
    opacity: 0.3,
  },
  boardToken: {
    position: 'absolute',
    width: CELL_SIZE * 0.6,
    height: CELL_SIZE * 0.6,
  },
  glowToken: {
    elevation: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
});
