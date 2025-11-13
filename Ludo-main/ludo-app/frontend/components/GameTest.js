/**
 * Game Test Component
 * Quick test to verify game logic works
 */

import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import {
  initializeGame,
  processDiceRoll,
  moveToken,
  getGameStats,
} from '../gameLogic/LudoGameCore';

export default function GameTest() {
  const [gameState, setGameState] = useState(null);
  const [log, setLog] = useState([]);

  const addLog = (message) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startTestGame = () => {
    const players = [
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' },
    ];
    
    const newGame = initializeGame(players);
    setGameState(newGame);
    setLog([]);
    addLog('Game initialized with 2 players');
  };

  const rollDice = () => {
    if (!gameState) return;
    
    const newState = processDiceRoll(gameState);
    setGameState(newState);
    
    const player = newState.players[newState.currentPlayerIndex];
    addLog(`${player.name} rolled ${newState.diceValue}`);
    
    if (newState.validMoves.length === 0) {
      addLog('No valid moves - turn skipped');
    } else {
      addLog(`Valid moves: ${newState.validMoves.join(', ')}`);
    }
  };

  const moveFirstToken = () => {
    if (!gameState || gameState.validMoves.length === 0) return;
    
    const tokenIndex = gameState.validMoves[0];
    const result = moveToken(gameState, tokenIndex);
    
    if (result.success) {
      setGameState(result.gameState);
      
      const player = gameState.players[gameState.currentPlayerIndex];
      addLog(`${player.name} moved token ${tokenIndex}`);
      
      if (result.captures && result.captures.length > 0) {
        addLog(`Captured ${result.captures.length} token(s)!`);
      }
      
      if (result.extraTurn) {
        addLog('Extra turn!');
      }
      
      if (result.threeSixes) {
        addLog('Three sixes - turn skipped!');
      }
      
      if (result.gameState.gameStatus === 'finished') {
        addLog(`🎉 ${player.name} WINS!`);
      }
    } else {
      addLog(`Error: ${result.error}`);
    }
  };

  const autoPlay = () => {
    if (!gameState) return;
    
    // Roll dice
    const afterRoll = processDiceRoll(gameState);
    setGameState(afterRoll);
    
    const player = afterRoll.players[afterRoll.currentPlayerIndex];
    addLog(`${player.name} rolled ${afterRoll.diceValue}`);
    
    // Move if possible
    if (afterRoll.validMoves.length > 0) {
      const tokenIndex = afterRoll.validMoves[0];
      const result = moveToken(afterRoll, tokenIndex);
      
      if (result.success) {
        setGameState(result.gameState);
        addLog(`${player.name} moved token ${tokenIndex}`);
        
        if (result.captures?.length > 0) {
          addLog(`Captured ${result.captures.length} token(s)!`);
        }
      }
    } else {
      addLog('No valid moves');
    }
  };

  const stats = gameState ? getGameStats(gameState) : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ludo Game Logic Test</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Start New Game" onPress={startTestGame} />
      </View>

      {gameState && (
        <>
          <View style={styles.gameInfo}>
            <Text style={styles.infoText}>
              Current Turn: {gameState.players[gameState.currentPlayerIndex].name}
            </Text>
            <Text style={styles.infoText}>
              Dice: {gameState.diceValue || 'Not rolled'}
            </Text>
            <Text style={styles.infoText}>
              Can Roll: {gameState.canRollDice ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.infoText}>
              Valid Moves: {gameState.validMoves.join(', ') || 'None'}
            </Text>
            <Text style={styles.infoText}>
              Consecutive 6s: {gameState.consecutiveSixes}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.subtitle}>Player Stats:</Text>
            {stats.map((player, index) => (
              <View key={player.id} style={styles.playerStat}>
                <Text style={[styles.statText, { color: player.color }]}>
                  {player.name}:
                </Text>
                <Text style={styles.statText}>
                  Out: {player.tokensOut} | Home: {player.tokensFinished}
                </Text>
                {player.hasWon && <Text style={styles.winText}>🏆 WINNER</Text>}
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Roll Dice"
              onPress={rollDice}
              disabled={!gameState.canRollDice}
            />
            <Button
              title="Move First Valid Token"
              onPress={moveFirstToken}
              disabled={gameState.validMoves.length === 0}
            />
            <Button
              title="Auto Play Turn"
              onPress={autoPlay}
              disabled={gameState.gameStatus === 'finished'}
            />
          </View>

          <View style={styles.tokenDisplay}>
            <Text style={styles.subtitle}>Token Positions:</Text>
            {gameState.players.map((player, pIndex) => (
              <View key={player.id} style={styles.playerTokens}>
                <Text style={[styles.playerName, { color: player.color }]}>
                  {player.name}:
                </Text>
                <Text style={styles.tokenText}>
                  {player.tokens.map((pos, i) => `T${i + 1}:${pos}`).join(' | ')}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.logContainer}>
        <Text style={styles.subtitle}>Game Log:</Text>
        {log.slice().reverse().map((entry, index) => (
          <Text key={index} style={styles.logEntry}>
            {entry}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 15,
    marginBottom: 10,
  },
  buttonContainer: {
    gap: 10,
    marginVertical: 10,
  },
  gameInfo: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    marginVertical: 3,
  },
  statsContainer: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  playerStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
  },
  winText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenDisplay: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  playerTokens: {
    marginVertical: 5,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  tokenText: {
    color: '#aaa',
    fontSize: 12,
  },
  logContainer: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    maxHeight: 300,
  },
  logEntry: {
    color: '#aaa',
    fontSize: 12,
    marginVertical: 2,
  },
});
