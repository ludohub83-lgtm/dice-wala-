import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 400);
const CELL_SIZE = BOARD_SIZE / 15;

// Player colors matching Ludo King
const PLAYER_COLORS = {
  0: { main: '#E53935', light: '#FFCDD2', dark: '#C62828' }, // Red
  1: { main: '#43A047', light: '#C8E6C9', dark: '#2E7D32' }, // Green
  2: { main: '#FDD835', light: '#FFF9C4', dark: '#F9A825' }, // Yellow
  3: { main: '#1E88E5', light: '#BBDEFB', dark: '#1565C0' }, // Blue
};

// Safe spots (star positions)
const SAFE_SPOTS = [1, 9, 14, 22, 27, 35, 40, 48];

export default function LudoKingBoard({ gameState, onTokenPress, currentPlayer }) {
  // Render home area for each player
  const renderHomeArea = (player, position) => {
    const color = PLAYER_COLORS[player];
    const { x, y } = position;

    return (
      <View key={`home-${player}`} style={[styles.homeArea, { 
        left: x, 
        top: y,
        backgroundColor: color.main 
      }]}>
        <View style={styles.homeInner}>
          {/* 4 token positions in home */}
          {[0, 1, 2, 3].map((tokenIndex) => {
            const token = gameState?.tokens?.[player]?.[tokenIndex];
            const isAtHome = token === -1;
            
            return (
              <TouchableOpacity
                key={tokenIndex}
                style={[styles.homeTokenSpot, { backgroundColor: color.light }]}
                onPress={() => isAtHome && onTokenPress(player, tokenIndex)}
              >
                {isAtHome && (
                  <View style={[styles.token, { 
                    backgroundColor: color.main,
                    borderColor: color.dark 
                  }]}>
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
  const renderPathCell = (index, position, isSafe, isFinish) => {
    const { x, y } = position;
    
    return (
      <View
        key={`cell-${index}`}
        style={[
          styles.pathCell,
          { left: x, top: y },
          isSafe && styles.safeCell,
          isFinish && styles.finishCell
        ]}
      >
        {isSafe && <Text style={styles.starIcon}>⭐</Text>}
        {/* Render tokens on this cell */}
        {gameState?.tokens && Object.entries(gameState.tokens).map(([playerId, tokens]) => 
          tokens.map((tokenPos, tokenIndex) => {
            if (tokenPos === index) {
              const color = PLAYER_COLORS[parseInt(playerId)];
              return (
                <TouchableOpacity
                  key={`token-${playerId}-${tokenIndex}`}
                  style={[styles.token, { 
                    backgroundColor: color.main,
                    borderColor: color.dark,
                    position: 'absolute'
                  }]}
                  onPress={() => onTokenPress(parseInt(playerId), tokenIndex)}
                >
                  <View style={styles.tokenInner} />
                </TouchableOpacity>
              );
            }
            return null;
          })
        )}
      </View>
    );
  };

  // Render center triangle design
  const renderCenter = () => {
    return (
      <View style={styles.centerContainer}>
        <Svg width={CELL_SIZE * 3} height={CELL_SIZE * 3} viewBox="0 0 100 100">
          {/* Red triangle */}
          <Polygon
            points="50,50 0,0 0,100"
            fill={PLAYER_COLORS[0].main}
          />
          {/* Green triangle */}
          <Polygon
            points="50,50 0,0 100,0"
            fill={PLAYER_COLORS[1].main}
          />
          {/* Yellow triangle */}
          <Polygon
            points="50,50 100,0 100,100"
            fill={PLAYER_COLORS[2].main}
          />
          {/* Blue triangle */}
          <Polygon
            points="50,50 0,100 100,100"
            fill={PLAYER_COLORS[3].main}
          />
          {/* Center circle */}
          <Circle cx="50" cy="50" r="15" fill="#FFF" />
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {/* Board background */}
        <View style={styles.boardBackground} />

        {/* Home areas */}
        {renderHomeArea(0, { x: 0, y: 0 })} {/* Red - Top Left */}
        {renderHomeArea(1, { x: CELL_SIZE * 9, y: 0 })} {/* Green - Top Right */}
        {renderHomeArea(2, { x: CELL_SIZE * 9, y: CELL_SIZE * 9 })} {/* Yellow - Bottom Right */}
        {renderHomeArea(3, { x: 0, y: CELL_SIZE * 9 })} {/* Blue - Bottom Left */}

        {/* Path cells - simplified for now */}
        {/* You would map through all 52 path positions here */}
        
        {/* Center triangle */}
        {renderCenter()}

        {/* Finish paths (colored paths leading to center) */}
        {/* Red finish path */}
        <View style={[styles.finishPath, { 
          left: CELL_SIZE * 6,
          top: CELL_SIZE,
          width: CELL_SIZE,
          height: CELL_SIZE * 5,
          backgroundColor: PLAYER_COLORS[0].light 
        }]} />

        {/* Green finish path */}
        <View style={[styles.finishPath, { 
          left: CELL_SIZE * 9,
          top: CELL_SIZE * 6,
          width: CELL_SIZE * 5,
          height: CELL_SIZE,
          backgroundColor: PLAYER_COLORS[1].light 
        }]} />

        {/* Yellow finish path */}
        <View style={[styles.finishPath, { 
          left: CELL_SIZE * 8,
          top: CELL_SIZE * 9,
          width: CELL_SIZE,
          height: CELL_SIZE * 5,
          backgroundColor: PLAYER_COLORS[2].light 
        }]} />

        {/* Blue finish path */}
        <View style={[styles.finishPath, { 
          left: CELL_SIZE,
          top: CELL_SIZE * 8,
          width: CELL_SIZE * 5,
          height: CELL_SIZE,
          backgroundColor: PLAYER_COLORS[3].light 
        }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
  boardBackground: {
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
    padding: CELL_SIZE * 0.5,
  },
  homeInner: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: CELL_SIZE * 0.5,
    gap: CELL_SIZE * 0.5,
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
  pathCell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeCell: {
    backgroundColor: '#FFF9C4',
  },
  finishCell: {
    backgroundColor: '#E8F5E9',
  },
  starIcon: {
    fontSize: CELL_SIZE * 0.5,
  },
  token: {
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
  tokenInner: {
    width: '40%',
    height: '40%',
    borderRadius: 100,
    backgroundColor: '#FFF',
  },
  centerContainer: {
    position: 'absolute',
    left: CELL_SIZE * 6,
    top: CELL_SIZE * 6,
    width: CELL_SIZE * 3,
    height: CELL_SIZE * 3,
  },
  finishPath: {
    position: 'absolute',
  },
});
