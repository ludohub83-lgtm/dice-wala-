/**
 * Game Board Component
 * Main Ludo board with tokens and interaction
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { getAbsolutePosition, BOARD_CONFIG } from '../gameLogic/LudoPathCalculator';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 40, 400);
const CELL_SIZE = BOARD_SIZE / 15;

export default function GameBoard({ gameState, onTokenPress, myPlayerIndex }) {
  const renderToken = (player, tokenIndex) => {
    const position = player.tokens[tokenIndex];
    const posInfo = getAbsolutePosition(player.color, position);
    const isValidMove = gameState.validMoves?.includes(tokenIndex) && 
                       gameState.currentPlayerIndex === myPlayerIndex;

    // Calculate token position on board
    const coords = getTokenCoordinates(posInfo, player.color, tokenIndex);
    
    if (!coords) return null;

    return (
      <TouchableOpacity
        key={`${player.id}-${tokenIndex}`}
        style={[
          styles.token,
          {
            backgroundColor: player.color,
            left: coords.x,
            top: coords.y,
            borderColor: isValidMove ? '#FFD700' : '#fff',
            borderWidth: isValidMove ? 3 : 2,
            transform: [{ scale: isValidMove ? 1.1 : 1 }],
          },
        ]}
        onPress={() => isValidMove && onTokenPress(tokenIndex)}
        disabled={!isValidMove}
      >
        <Text style={styles.tokenText}>{tokenIndex + 1}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {/* Board background */}
        <View style={styles.boardGrid}>
          {renderBoardLayout()}
        </View>

        {/* Render all tokens */}
        {gameState.players.map((player) =>
          player.tokens.map((_, tokenIndex) => renderToken(player, tokenIndex))
        )}
      </View>
    </View>
  );
}

function getTokenCoordinates(posInfo, color, tokenIndex) {
  const { type, position, step } = posInfo;

  if (type === 'base') {
    // Base positions (starting area)
    const basePositions = {
      red: { x: 1, y: 1 },
      green: { x: 9, y: 1 },
      yellow: { x: 9, y: 9 },
      blue: { x: 1, y: 9 },
    };
    
    const base = basePositions[color];
    const offsets = [
      { dx: 0.5, dy: 0.5 },
      { dx: 2, dy: 0.5 },
      { dx: 0.5, dy: 2 },
      { dx: 2, dy: 2 },
    ];
    
    const offset = offsets[tokenIndex];
    return {
      x: (base.x + offset.dx) * CELL_SIZE,
      y: (base.y + offset.dy) * CELL_SIZE,
    };
  }

  if (type === 'finished') {
    // Home (finished) position
    const homePositions = {
      red: { x: 7, y: 6 },
      green: { x: 8, y: 7 },
      yellow: { x: 7, y: 8 },
      blue: { x: 6, y: 7 },
    };
    
    const home = homePositions[color];
    return {
      x: (home.x + tokenIndex * 0.2) * CELL_SIZE,
      y: (home.y + tokenIndex * 0.2) * CELL_SIZE,
    };
  }

  if (type === 'homePath') {
    // Colored home path
    const homePathStarts = {
      red: { x: 7, y: 12, dx: 0, dy: -1 },
      green: { x: 2, y: 7, dx: 1, dy: 0 },
      yellow: { x: 7, y: 2, dx: 0, dy: 1 },
      blue: { x: 12, y: 7, dx: -1, dy: 0 },
    };
    
    const path = homePathStarts[color];
    return {
      x: (path.x + path.dx * step) * CELL_SIZE + CELL_SIZE / 2,
      y: (path.y + path.dy * step) * CELL_SIZE + CELL_SIZE / 2,
    };
  }

  if (type === 'mainPath') {
    // Main circular path
    const pathCoords = getMainPathCoordinates();
    const coord = pathCoords[position % 52];
    
    if (coord) {
      return {
        x: coord.x * CELL_SIZE + CELL_SIZE / 2,
        y: coord.y * CELL_SIZE + CELL_SIZE / 2,
      };
    }
  }

  return null;
}

function getMainPathCoordinates() {
  // Define the 52 positions of the main circular path
  // This is a simplified version - adjust based on your board layout
  const coords = [];
  
  // Bottom path (red start area)
  for (let i = 0; i < 6; i++) coords.push({ x: 6, y: 13 - i });
  
  // Left side going up
  for (let i = 0; i < 5; i++) coords.push({ x: 5 - i, y: 8 });
  coords.push({ x: 0, y: 7 });
  for (let i = 0; i < 5; i++) coords.push({ x: i, y: 6 });
  
  // Top path (yellow start area)
  for (let i = 0; i < 6; i++) coords.push({ x: 6, y: 6 - i });
  
  // Right side going down
  for (let i = 0; i < 5; i++) coords.push({ x: 7 + i, y: 1 });
  coords.push({ x: 14, y: 6 });
  for (let i = 0; i < 5; i++) coords.push({ x: 14 - i, y: 7 });
  
  // Complete the circle
  for (let i = 0; i < 6; i++) coords.push({ x: 8, y: 7 + i });
  
  return coords;
}

function renderBoardLayout() {
  // Simplified board layout - customize based on your design
  return (
    <View style={styles.boardLayout}>
      {/* Player bases */}
      <View style={[styles.playerBase, styles.redBase]} />
      <View style={[styles.playerBase, styles.greenBase]} />
      <View style={[styles.playerBase, styles.yellowBase]} />
      <View style={[styles.playerBase, styles.blueBase]} />
      
      {/* Center home area */}
      <View style={styles.centerHome}>
        <Text style={styles.homeText}>HOME</Text>
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
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    position: 'relative',
  },
  boardGrid: {
    width: '100%',
    height: '100%',
  },
  boardLayout: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  playerBase: {
    position: 'absolute',
    width: CELL_SIZE * 6,
    height: CELL_SIZE * 6,
    borderRadius: 10,
    opacity: 0.3,
  },
  redBase: {
    backgroundColor: 'red',
    left: 0,
    bottom: 0,
  },
  greenBase: {
    backgroundColor: 'green',
    left: 0,
    top: 0,
  },
  yellowBase: {
    backgroundColor: 'yellow',
    right: 0,
    top: 0,
  },
  blueBase: {
    backgroundColor: 'blue',
    right: 0,
    bottom: 0,
  },
  centerHome: {
    position: 'absolute',
    width: CELL_SIZE * 3,
    height: CELL_SIZE * 3,
    left: '50%',
    top: '50%',
    marginLeft: -CELL_SIZE * 1.5,
    marginTop: -CELL_SIZE * 1.5,
    backgroundColor: '#FFD700',
    borderRadius: CELL_SIZE * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  token: {
    position: 'absolute',
    width: CELL_SIZE * 0.8,
    height: CELL_SIZE * 0.8,
    borderRadius: CELL_SIZE * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tokenText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
