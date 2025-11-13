import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Polygon, Circle, Path, Rect, G } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 400);
const CELL_SIZE = BOARD_SIZE / 15;

// Ludo King exact colors
const COLORS = {
  RED: { main: '#E53935', light: '#FFCDD2', dark: '#C62828', home: '#EF5350' },
  GREEN: { main: '#43A047', light: '#C8E6C9', dark: '#2E7D32', home: '#66BB6A' },
  YELLOW: { main: '#FDD835', light: '#FFF9C4', dark: '#F9A825', home: '#FFEE58' },
  BLUE: { main: '#1E88E5', light: '#BBDEFB', dark: '#1565C0', home: '#42A5F5' },
};

// Complete path coordinates (52 cells) - clockwise from Red start
const PATH_COORDINATES = [
  // Red starting position (bottom left of red home)
  { x: 6, y: 1 }, { x: 5, y: 1 }, { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 1 },
  // Arrow position for Red
  { x: 1, y: 1 },
  // Left side going down
  { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 },
  // Blue starting position (right of blue home)
  { x: 1, y: 6 },
  // Continue down
  { x: 1, y: 7 }, { x: 1, y: 8 }, { x: 1, y: 9 }, { x: 1, y: 10 }, { x: 1, y: 11 }, { x: 1, y: 12 },
  // Bottom going right
  { x: 2, y: 13 }, { x: 3, y: 13 }, { x: 4, y: 13 }, { x: 5, y: 13 }, { x: 6, y: 13 },
  // Yellow starting position (top of yellow home)
  { x: 6, y: 12 },
  // Continue right
  { x: 7, y: 13 }, { x: 8, y: 13 }, { x: 9, y: 13 }, { x: 10, y: 13 }, { x: 11, y: 13 }, { x: 12, y: 13 },
  // Right side going up
  { x: 13, y: 12 }, { x: 13, y: 11 }, { x: 13, y: 10 }, { x: 13, y: 9 }, { x: 13, y: 8 },
  // Green starting position (left of green home)
  { x: 13, y: 7 },
  // Continue up
  { x: 13, y: 6 }, { x: 13, y: 5 }, { x: 13, y: 4 }, { x: 13, y: 3 }, { x: 13, y: 2 }, { x: 13, y: 1 },
  // Top going left
  { x: 12, y: 0 }, { x: 11, y: 0 }, { x: 10, y: 0 }, { x: 9, y: 0 }, { x: 8, y: 0 },
  // Back to red start
  { x: 8, y: 1 }, { x: 7, y: 1 },
];

// Safe spots (star positions) - indices in path
const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

// Starting positions for each player
const START_POSITIONS = { 0: 0, 1: 13, 2: 26, 3: 39 };

// Home path coordinates (colored paths to center)
const HOME_PATHS = {
  0: [{ x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 }], // Red
  1: [{ x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }], // Blue  
  2: [{ x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }, { x: 7, y: 8 }, { x: 7, y: 7 }], // Yellow
  3: [{ x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }, { x: 7, y: 7 }], // Green
};

export default function LudoKingBoardComplete({ 
  gameState, 
  onTokenPress, 
  currentPlayer,
  diceValue,
  validMoves = [],
  adminControls = null // Admin controls from Firebase
}) {
  const [animatedTokens, setAnimatedTokens] = useState({});
  const [highlightedCells, setHighlightedCells] = useState([]);

  // Get player color
  const getPlayerColor = (playerId) => {
    const colorMap = [COLORS.RED, COLORS.BLUE, COLORS.YELLOW, COLORS.GREEN];
    return colorMap[playerId] || COLORS.RED;
  };

  // Convert path index to screen coordinates
  const getPathPosition = (pathIndex, playerId) => {
    if (pathIndex < 0) return null; // Token at home
    if (pathIndex >= 57) return null; // Token finished
    
    // On main path (0-51)
    if (pathIndex < 52) {
      const coord = PATH_COORDINATES[pathIndex];
      return {
        x: coord.x * CELL_SIZE,
        y: coord.y * CELL_SIZE,
      };
    }
    
    // On home path (52-56)
    if (pathIndex >= 52 && pathIndex < 57) {
      const homePathIndex = pathIndex - 52;
      const homePathCoord = HOME_PATHS[playerId][homePathIndex];
      if (homePathCoord) {
        return {
          x: homePathCoord.x * CELL_SIZE,
          y: homePathCoord.y * CELL_SIZE,
        };
      }
    }
    
    return null;
  };

  // Render home area
  const renderHomeArea = (playerId) => {
    const color = getPlayerColor(playerId);
    const positions = [
      { x: 0, y: 0 }, // Red - Top Left
      { x: 0, y: 9 }, // Blue - Bottom Left
      { x: 9, y: 9 }, // Yellow - Bottom Right
      { x: 9, y: 0 }, // Green - Top Right
    ];
    
    const pos = positions[playerId];
    
    return (
      <View
        key={`home-${playerId}`}
        style={[
          styles.homeArea,
          {
            left: pos.x * CELL_SIZE,
            top: pos.y * CELL_SIZE,
            backgroundColor: color.home,
          },
        ]}
      >
        <View style={[styles.homeInner, { backgroundColor: '#FFF' }]}>
          {[0, 1, 2, 3].map((tokenIndex) => {
            const token = gameState?.tokens?.[playerId]?.[tokenIndex];
            const isAtHome = token === -1;
            const canMove = validMoves.includes(tokenIndex) && playerId === currentPlayer;
            
            return (
              <TouchableOpacity
                key={`home-token-${playerId}-${tokenIndex}`}
                style={[
                  styles.homeTokenSpot,
                  { backgroundColor: color.light },
                  canMove && styles.highlightedSpot,
                ]}
                onPress={() => canMove && onTokenPress && onTokenPress(playerId, tokenIndex)}
                disabled={!canMove}
                activeOpacity={canMove ? 0.7 : 1}
              >
                {isAtHome && (
                  <View
                    style={[
                      styles.token,
                      {
                        backgroundColor: color.main,
                        borderColor: color.dark,
                      },
                      canMove && styles.glowingToken,
                    ]}
                  >
                    <View style={styles.tokenInner} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Render path cells
  const renderPathCells = () => {
    return PATH_COORDINATES.map((coord, index) => {
      const isSafe = SAFE_SPOTS.includes(index);
      const isStart = Object.values(START_POSITIONS).includes(index);
      
      return (
        <View
          key={`path-${index}`}
          style={[
            styles.pathCell,
            {
              left: coord.x * CELL_SIZE,
              top: coord.y * CELL_SIZE,
            },
            isSafe && styles.safeCell,
            isStart && styles.startCell,
          ]}
        >
          {isSafe && <Text style={styles.starIcon}>⭐</Text>}
          {isStart && (
            <View style={styles.arrowContainer}>
              <Text style={styles.arrowIcon}>▶</Text>
            </View>
          )}
        </View>
      );
    });
  };

  // Render home paths (colored paths to center)
  const renderHomePaths = () => {
    return Object.entries(HOME_PATHS).map(([playerId, path]) => {
      const color = getPlayerColor(parseInt(playerId));
      
      return path.map((coord, index) => (
        <View
          key={`home-path-${playerId}-${index}`}
          style={[
            styles.homePathCell,
            {
              left: coord.x * CELL_SIZE,
              top: coord.y * CELL_SIZE,
              backgroundColor: color.light,
            },
          ]}
        >
          {index === 5 && <Text style={styles.finishIcon}>🏁</Text>}
        </View>
      ));
    });
  };

  // Render tokens on board
  const renderTokens = () => {
    if (!gameState?.tokens) return null;

    return Object.entries(gameState.tokens).map(([playerId, tokens]) => {
      const color = getPlayerColor(parseInt(playerId));
      
      return tokens.map((position, tokenIndex) => {
        if (position === -1) return null; // At home
        if (position >= 57) return null; // Finished

        const coords = getPathPosition(position, parseInt(playerId));
        if (!coords) return null;

        const canMove = validMoves.includes(tokenIndex) && parseInt(playerId) === currentPlayer;

        return (
          <TouchableOpacity
            key={`token-${playerId}-${tokenIndex}`}
            style={[
              styles.tokenOnBoard,
              {
                left: coords.x + CELL_SIZE * 0.15,
                top: coords.y + CELL_SIZE * 0.15,
                backgroundColor: color.main,
                borderColor: color.dark,
              },
              canMove && styles.highlightedToken,
            ]}
            onPress={() => canMove && onTokenPress && onTokenPress(parseInt(playerId), tokenIndex)}
            disabled={!canMove}
            activeOpacity={canMove ? 0.7 : 1}
          >
            <View style={styles.tokenInner} />
            {canMove && (
              <View style={styles.tokenGlow} />
            )}
          </TouchableOpacity>
        );
      });
    });
  };

  // Render center triangle (Ludo King style)
  const renderCenter = () => {
    return (
      <View
        style={[
          styles.centerContainer,
          {
            left: 6 * CELL_SIZE,
            top: 6 * CELL_SIZE,
            width: 3 * CELL_SIZE,
            height: 3 * CELL_SIZE,
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* Red triangle */}
          <Polygon points="50,50 0,0 0,100" fill={COLORS.RED.main} />
          {/* Blue triangle */}
          <Polygon points="50,50 0,100 100,100" fill={COLORS.BLUE.main} />
          {/* Yellow triangle */}
          <Polygon points="50,50 100,100 100,0" fill={COLORS.YELLOW.main} />
          {/* Green triangle */}
          <Polygon points="50,50 100,0 0,0" fill={COLORS.GREEN.main} />
          {/* Center white circle */}
          <Circle cx="50" cy="50" r="20" fill="#FFF" stroke="#333" strokeWidth="2" />
          {/* Inner circle */}
          <Circle cx="50" cy="50" r="12" fill="none" stroke="#333" strokeWidth="1" />
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {/* Board background */}
        <View style={styles.boardBg} />

        {/* Grid lines */}
        <View style={styles.gridContainer}>
          {Array.from({ length: 15 }).map((_, i) => (
            <View key={`grid-v-${i}`} style={[styles.gridLine, { left: i * CELL_SIZE, height: BOARD_SIZE }]} />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <View key={`grid-h-${i}`} style={[styles.gridLine, { top: i * CELL_SIZE, width: BOARD_SIZE }]} />
          ))}
        </View>

        {/* Path cells */}
        {renderPathCells()}

        {/* Home paths */}
        {renderHomePaths()}

        {/* Home areas */}
        {[0, 1, 2, 3].map((playerId) => renderHomeArea(playerId))}

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
  },
  board: {
    position: 'relative',
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  boardBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  gridContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#E0E0E0',
    width: 0.5,
    height: 0.5,
  },
  homeArea: {
    position: 'absolute',
    width: CELL_SIZE * 6,
    height: CELL_SIZE * 6,
    borderRadius: 8,
    padding: CELL_SIZE * 0.3,
  },
  homeInner: {
    flex: 1,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: CELL_SIZE * 0.4,
    gap: CELL_SIZE * 0.3,
  },
  homeTokenSpot: {
    width: '45%',
    height: '45%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  highlightedSpot: {
    borderColor: '#4CAF50',
    borderWidth: 3,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  pathCell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#FFF',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeCell: {
    backgroundColor: '#FFF9C4',
  },
  startCell: {
    backgroundColor: '#E8F5E9',
  },
  homePathCell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    fontSize: CELL_SIZE * 0.5,
  },
  arrowContainer: {
    transform: [{ rotate: '0deg' }],
  },
  arrowIcon: {
    fontSize: CELL_SIZE * 0.4,
    color: '#4CAF50',
  },
  finishIcon: {
    fontSize: CELL_SIZE * 0.5,
  },
  token: {
    width: CELL_SIZE * 0.6,
    height: CELL_SIZE * 0.6,
    borderRadius: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  tokenOnBoard: {
    position: 'absolute',
    width: CELL_SIZE * 0.7,
    height: CELL_SIZE * 0.7,
    borderRadius: 100,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  highlightedToken: {
    borderColor: '#FFD700',
    borderWidth: 4,
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  glowingToken: {
    elevation: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  tokenInner: {
    width: '35%',
    height: '35%',
    borderRadius: 100,
    backgroundColor: '#FFF',
  },
  tokenGlow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    zIndex: -1,
  },
  centerContainer: {
    position: 'absolute',
  },
});
