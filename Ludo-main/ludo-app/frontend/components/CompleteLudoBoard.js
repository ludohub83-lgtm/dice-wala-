import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Polygon, Circle, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 400);
const CELL_SIZE = BOARD_SIZE / 15;

// Ludo King Colors
const COLORS = {
  RED: { main: '#E53935', light: '#FFCDD2', dark: '#C62828', home: '#EF5350' },
  GREEN: { main: '#43A047', light: '#C8E6C9', dark: '#2E7D32', home: '#66BB6A' },
  YELLOW: { main: '#FDD835', light: '#FFF9C4', dark: '#F9A825', home: '#FFEE58' },
  BLUE: { main: '#1E88E5', light: '#BBDEFB', dark: '#1565C0', home: '#42A5F5' },
};

// Path coordinates for all 52 cells (clockwise from Red start)
const PATH_COORDINATES = [
  // Red starting area (bottom of red home)
  { x: 6, y: 1 }, { x: 5, y: 1 }, { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 },
  // Left side going down
  { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 },
  // Blue starting area (right of blue home)
  { x: 1, y: 6 }, { x: 1, y: 7 }, { x: 1, y: 8 }, { x: 1, y: 9 }, { x: 1, y: 10 }, { x: 1, y: 11 },
  // Bottom going right
  { x: 2, y: 13 }, { x: 3, y: 13 }, { x: 4, y: 13 }, { x: 5, y: 13 }, { x: 6, y: 13 },
  // Yellow starting area (top of yellow home)
  { x: 8, y: 13 }, { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 }, { x: 8, y: 9 }, { x: 8, y: 8 },
  // Right side going up
  { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
  // Green starting area (left of green home)
  { x: 13, y: 7 }, { x: 13, y: 6 }, { x: 13, y: 5 }, { x: 13, y: 4 }, { x: 13, y: 3 }, { x: 13, y: 2 },
  // Top going left
  { x: 12, y: 1 }, { x: 11, y: 1 }, { x: 10, y: 1 }, { x: 9, y: 1 }, { x: 8, y: 1 },
  // Back to red start
  { x: 7, y: 1 },
];

// Safe spots (star positions) - indices in path
const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

// Starting positions for each player
const START_POSITIONS = { 0: 0, 1: 13, 2: 26, 3: 39 };

// Home path coordinates (colored paths to center)
const HOME_PATHS = {
  0: [{ x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }], // Red
  1: [{ x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }], // Green  
  2: [{ x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }, { x: 7, y: 8 }], // Yellow
  3: [{ x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }], // Blue
};

export default function CompleteLudoBoard({ 
  gameState, 
  onTokenPress, 
  currentPlayer,
  diceValue,
  validMoves = []
}) {
  const [animatedTokens, setAnimatedTokens] = useState({});

  // Get player color
  const getPlayerColor = (playerId) => {
    const colorMap = [COLORS.RED, COLORS.GREEN, COLORS.YELLOW, COLORS.BLUE];
    return colorMap[playerId] || COLORS.RED;
  };

  // Convert path index to screen coordinates
  const getPathPosition = (pathIndex) => {
    if (pathIndex < 0) return null; // Token at home
    if (pathIndex >= 52) return null; // Token finished
    
    const coord = PATH_COORDINATES[pathIndex];
    return {
      x: coord.x * CELL_SIZE,
      y: coord.y * CELL_SIZE,
    };
  };

  // Render home area
  const renderHomeArea = (playerId) => {
    const color = getPlayerColor(playerId);
    const positions = [
      { x: 0, y: 0 }, // Red - Top Left
      { x: 9, y: 0 }, // Green - Top Right
      { x: 9, y: 9 }, // Yellow - Bottom Right
      { x: 0, y: 9 }, // Blue - Bottom Left
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
            const canMove = validMoves.includes(tokenIndex);
            
            return (
              <TouchableOpacity
                key={`home-token-${playerId}-${tokenIndex}`}
                style={[
                  styles.homeTokenSpot,
                  { backgroundColor: color.light },
                  canMove && styles.highlightedSpot,
                ]}
                onPress={() => onTokenPress && onTokenPress(playerId, tokenIndex)}
                disabled={!canMove}
              >
                {isAtHome && (
                  <View
                    style={[
                      styles.token,
                      {
                        backgroundColor: color.main,
                        borderColor: color.dark,
                      },
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
          {isStart && <Text style={styles.arrowIcon}>➤</Text>}
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
          {index === 4 && <Text style={styles.finishIcon}>🏁</Text>}
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

        let coords;
        if (position >= 52) {
          // On home path
          const homePathIndex = position - 52;
          const homePathCoord = HOME_PATHS[playerId][homePathIndex];
          coords = {
            x: homePathCoord.x * CELL_SIZE,
            y: homePathCoord.y * CELL_SIZE,
          };
        } else {
          // On main path
          coords = getPathPosition(position);
        }

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
            onPress={() => onTokenPress && onTokenPress(parseInt(playerId), tokenIndex)}
            disabled={!canMove}
          >
            <View style={styles.tokenInner} />
          </TouchableOpacity>
        );
      });
    });
  };

  // Render center triangle
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
          <Polygon points="50,50 0,0 0,100" fill={COLORS.RED.main} />
          <Polygon points="50,50 0,0 100,0" fill={COLORS.GREEN.main} />
          <Polygon points="50,50 100,0 100,100" fill={COLORS.YELLOW.main} />
          <Polygon points="50,50 0,100 100,100" fill={COLORS.BLUE.main} />
          <Circle cx="50" cy="50" r="20" fill="#FFF" stroke="#333" strokeWidth="2" />
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {/* Board background */}
        <View style={styles.boardBg} />

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
  },
  boardBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 8,
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
  },
  tokenInner: {
    width: '35%',
    height: '35%',
    borderRadius: 100,
    backgroundColor: '#FFF',
  },
  centerContainer: {
    position: 'absolute',
  },
});
