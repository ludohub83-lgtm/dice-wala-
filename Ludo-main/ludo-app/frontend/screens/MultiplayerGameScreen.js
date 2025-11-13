/**
 * Multiplayer Game Screen
 * Main game interface with real-time multiplayer
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useGameLogic } from '../hooks/useGameLogic';
import GameBoard from '../components/GameBoard';
import DiceRoller from '../components/DiceRoller';
import { getGameStats } from '../gameLogic/LudoGameCore';

export default function MultiplayerGameScreen({ route, navigation }) {
  const { gameId, playerId } = route.params;
  const {
    gameState,
    loading,
    error,
    rolling,
    moving,
    isMyTurn,
    currentPlayer,
    myPlayerIndex,
    validMoves,
    rollDice,
    playMove,
  } = useGameLogic(gameId, playerId);

  const [lastCapture, setLastCapture] = useState(null);

  useEffect(() => {
    if (gameState?.gameStatus === 'finished') {
      const winner = gameState.players.find(p => p.hasWon);
      Alert.alert(
        'Game Over!',
        `${winner?.name || 'Player'} wins!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [gameState?.gameStatus]);

  const handleRollDice = async () => {
    const result = await rollDice();
    
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const handleTokenPress = async (tokenIndex) => {
    const result = await playMove(tokenIndex);
    
    if (result.success) {
      if (result.captures && result.captures.length > 0) {
        setLastCapture(`Captured ${result.captures.length} token(s)!`);
        setTimeout(() => setLastCapture(null), 2000);
      }
      
      if (result.threeSixes) {
        Alert.alert('Three Sixes!', 'You rolled three sixes in a row. Turn skipped!');
      }
    } else {
      Alert.alert('Invalid Move', result.error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!gameState) {
    return null;
  }

  const stats = getGameStats(gameState);
  const activePlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ludo Game</Text>
        <Text style={styles.turnIndicator}>
          {isMyTurn ? "Your Turn!" : `${activePlayer.name}'s Turn`}
        </Text>
      </View>

      {/* Player Stats */}
      <View style={styles.statsContainer}>
        {stats.map((player, index) => (
          <View
            key={player.id}
            style={[
              styles.playerStat,
              {
                backgroundColor: player.color,
                opacity: index === gameState.currentPlayerIndex ? 1 : 0.6,
              },
            ]}
          >
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerTokens}>
              Out: {player.tokensOut} | Home: {player.tokensFinished}
            </Text>
          </View>
        ))}
      </View>

      {/* Game Board */}
      <View style={styles.boardContainer}>
        <GameBoard
          gameState={gameState}
          onTokenPress={handleTokenPress}
          myPlayerIndex={myPlayerIndex}
        />
      </View>

      {/* Dice Section */}
      <View style={styles.diceContainer}>
        <DiceRoller
          value={gameState.diceValue}
          onRoll={handleRollDice}
          disabled={!gameState.canRollDice || rolling || moving}
          isMyTurn={isMyTurn}
        />
        
        {gameState.diceValue && validMoves.length > 0 && isMyTurn && (
          <Text style={styles.movePrompt}>Select a token to move</Text>
        )}
        
        {gameState.diceValue && validMoves.length === 0 && !isMyTurn && (
          <Text style={styles.noMovesText}>No valid moves</Text>
        )}
      </View>

      {/* Capture Notification */}
      {lastCapture && (
        <View style={styles.captureNotification}>
          <Text style={styles.captureText}>{lastCapture}</Text>
        </View>
      )}

      {/* Consecutive Sixes Indicator */}
      {gameState.consecutiveSixes > 0 && isMyTurn && (
        <View style={styles.sixesIndicator}>
          <Text style={styles.sixesText}>
            Sixes: {gameState.consecutiveSixes}/3
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
  },
  header: {
    padding: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  turnIndicator: {
    fontSize: 18,
    color: '#4CAF50',
    marginTop: 5,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  playerStat: {
    flex: 1,
    padding: 8,
    marginHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
  },
  playerName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerTokens: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceContainer: {
    padding: 20,
    alignItems: 'center',
  },
  movePrompt: {
    color: '#4CAF50',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  noMovesText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 10,
  },
  captureNotification: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  captureText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sixesIndicator: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 8,
  },
  sixesText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
