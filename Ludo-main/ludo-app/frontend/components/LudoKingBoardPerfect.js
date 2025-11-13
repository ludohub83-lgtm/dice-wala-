import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Polygon, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 16, height * 0.5, 450);
const CELL = BOARD_SIZE / 15;

// Exact Ludo King colors from image
const COLORS = {
  RED: '#E53935',
  GREEN: '#43A047',
  YELLOW: '#FDD835',
  BLUE: '#1E88E5',
};

// 52-cell path (clockwise starting from Red's start)
const PATH = [
  // Red start (left side, middle row)
  [0,6],[1,6],[2,6],[3,6],[4,6],[5,6],
  // Turn down
  [6,7],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13],
  // Yellow start (bottom, middle column)
  [7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13],
  // Turn up
  [13,12],[13,11],[13,10],[13,9],[13,8],[13,7],
  // Green start (right side, middle row)
  [13,6],[12,6],[11,6],[10,6],[9,6],[8,6],
  // Turn up
  [7,5],[7,4],[7,3],[7,2],[7,1],[7,0],
  // Continue left
  [6,0],[5,0],[4,0],[3,0],[2,0],[1,0],[0,1],
  // Back to red (complete circle)
  [0,2],[0,3],[0,4],[0,5],
];

// Home paths (colored triangular paths to center)
const HOME_PATHS = {
  0: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]], // Red
  1: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]], // Blue
  2: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]], // Yellow
  3: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]], // Green
};

// Safe spots (stars)
const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

// Start arrows
const ARROWS = [[0,6], [7,0], [13,8], [6,13]];

export default function LudoKingBoardPerfect({
  gameState,
  onTokenPress,
  currentPlayer,
  validMoves = [],
}) {
  
  const getColor = (pId) => [COLORS.RED, COLORS.BLUE, COLORS.YELLOW, COLORS.GREEN][pId];

  const getTokenPos = (pos, pId) => {
    if (pos === -1) return null;
    if (pos >= 57) return null;
    
    let coord;
    if (pos < 52) {
      coord = PATH[pos];
    } else {
      coord = HOME_PATHS[pId]?.[pos - 52];
    }
    
    return coord ? { x: coord[0] * CELL, y: coord[1] * CELL } : null;
  };

  // Home area (4 corners)
  const renderHome = (pId) => {
    const homes = [
      { x: 0, y: 0, color: COLORS.RED },
      { x: 0, y: 9, color: COLORS.BLUE },
      { x: 9, y: 9, color: COLORS.YELLOW },
      { x: 9, y: 0, color: COLORS.GREEN },
    ];
    
    const home = homes[pId];
    const spots = [[1.8,1.8], [4.2,1.8], [1.8,4.2], [4.2,4.2]];
    
    return (
      <View
        key={`home-${pId}`}
        style={[styles.home, {
          left: home.x * CELL,
          top: home.y * CELL,
          backgroundColor: home.color,
        }]}
      >
        <View style={styles.homeWhite}>
          {spots.map((spot, idx) => {
            const token = gameState?.tokens?.[pId]?.[idx];
            const isHome = token === -1;
            const canMove = validMoves.includes(idx) && pId === currentPlayer;
            
            return (
              <TouchableOpacity
                key={`spot-${pId}-${idx}`}
                style={[styles.spot, {
                  left: spot[0] * CELL,
                  top: spot[1] * CELL,
                }, canMove && styles.spotGlow]}
                onPress={() => {
                  console.log('Token pressed:', pId, idx, 'canMove:', canMove);
                  if (canMove && onTokenPress) {
                    onTokenPress(pId, idx);
                  }
                }}
                activeOpacity={canMove ? 0.6 : 1}
                disabled={!canMove}
              >
                {isHome && (
                  <View style={[styles.pin, { borderColor: home.color }]}>
                    <View style={[styles.pinTop, { backgroundColor: home.color }]} />
                    <View style={[styles.pinBase, { backgroundColor: home.color }]} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Path cells
  const renderPath = () => PATH.map((coord, i) => {
    const isSafe = SAFE_SPOTS.includes(i);
    const isArrow = ARROWS.some(a => a[0] === coord[0] && a[1] === coord[1]);
    
    return (
      <View key={`path-${i}`} style={[styles.cell, {
        left: coord[0] * CELL,
        top: coord[1] * CELL,
      }]}>
        {isSafe && <Text style={styles.star}>⭐</Text>}
        {isArrow && <Text style={styles.arrow}>➤</Text>}
      </View>
    );
  });

  // Colored home paths
  const renderHomePaths = () => {
    const colors = [COLORS.RED, COLORS.BLUE, COLORS.YELLOW, COLORS.GREEN];
    return Object.entries(HOME_PATHS).map(([pId, path]) =>
      path.map((coord, i) => (
        <View
          key={`hp-${pId}-${i}`}
          style={[styles.homePath, {
            left: coord[0] * CELL,
            top: coord[1] * CELL,
            backgroundColor: colors[pId],
          }]}
        />
      ))
    );
  };

  // Center triangle
  const renderCenter = () => (
    <View style={[styles.center, { left: 7 * CELL, top: 7 * CELL, width: CELL, height: CELL }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Polygon points="50,50 50,0 0,50" fill={COLORS.RED} />
        <Polygon points="50,50 0,50 50,100" fill={COLORS.BLUE} />
        <Polygon points="50,50 50,100 100,50" fill={COLORS.YELLOW} />
        <Polygon points="50,50 100,50 50,0" fill={COLORS.GREEN} />
        <Circle cx="50" cy="50" r="18" fill="#FFF" stroke="#333" strokeWidth="2" />
      </Svg>
    </View>
  );

  // Tokens on board
  const renderTokens = () => {
    if (!gameState?.tokens) return null;

    return Object.entries(gameState.tokens).map(([pId, tokens]) => {
      const color = getColor(parseInt(pId));
      
      return tokens.map((pos, idx) => {
        const coords = getTokenPos(pos, parseInt(pId));
        if (!coords) return null;

        const canMove = validMoves.includes(idx) && parseInt(pId) === currentPlayer;

        return (
          <TouchableOpacity
            key={`token-${pId}-${idx}`}
            style={[styles.tokenPos, {
              left: coords.x + CELL * 0.2,
              top: coords.y + CELL * 0.2,
            }, canMove && styles.tokenGlow]}
            onPress={() => {
              console.log('Board token pressed:', pId, idx, 'canMove:', canMove);
              if (canMove && onTokenPress) {
                onTokenPress(parseInt(pId), idx);
              }
            }}
            activeOpacity={canMove ? 0.6 : 1}
            disabled={!canMove}
          >
            <View style={[styles.pin, { borderColor: color }]}>
              <View style={[styles.pinTop, { backgroundColor: color }]} />
              <View style={[styles.pinBase, { backgroundColor: color }]} />
            </View>
          </TouchableOpacity>
        );
      });
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {/* Grid */}
        <View style={styles.grid}>
          {Array.from({ length: 16 }).map((_, i) => (
            <React.Fragment key={i}>
              <View style={[styles.line, { left: i * CELL, height: BOARD_SIZE }]} />
              <View style={[styles.line, { top: i * CELL, width: BOARD_SIZE }]} />
            </React.Fragment>
          ))}
        </View>

        {/* Homes */}
        {[0, 1, 2, 3].map(renderHome)}

        {/* Home paths */}
        {renderHomePaths()}

        {/* Path */}
        {renderPath()}

        {/* Center */}
        {renderCenter()}

        {/* Tokens */}
        {renderTokens()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  board: {
    position: 'relative',
    backgroundColor: '#FFF',
    borderRadius: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 4,
    borderColor: '#2C3E50',
    alignSelf: 'center',
  },
  grid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  line: {
    position: 'absolute',
    backgroundColor: '#DDD',
    width: 1,
    height: 1,
  },
  home: {
    position: 'absolute',
    width: CELL * 6,
    height: CELL * 6,
    borderRadius: 12,
    padding: CELL * 0.4,
  },
  homeWhite: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    position: 'relative',
  },
  spot: {
    position: 'absolute',
    width: CELL * 1.6,
    height: CELL * 1.6,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  spotGlow: {
    borderColor: '#FFD700',
    borderWidth: 3,
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  cell: {
    position: 'absolute',
    width: CELL,
    height: CELL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homePath: {
    position: 'absolute',
    width: CELL,
    height: CELL,
    opacity: 0.35,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  star: {
    fontSize: CELL * 0.65,
  },
  arrow: {
    fontSize: CELL * 0.55,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  center: {
    position: 'absolute',
  },
  pin: {
    width: CELL * 0.6,
    height: CELL * 0.6,
    borderRadius: 100,
    backgroundColor: '#FFF',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  pinTop: {
    width: '48%',
    height: '48%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 2,
  },
  pinBase: {
    position: 'absolute',
    bottom: -3,
    width: '75%',
    height: 6,
    borderRadius: 100,
    opacity: 0.35,
  },
  tokenPos: {
    position: 'absolute',
    width: CELL * 0.6,
    height: CELL * 0.6,
  },
  tokenGlow: {
    elevation: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
});
