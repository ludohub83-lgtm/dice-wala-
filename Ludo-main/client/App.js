/**
 * Main App Entry Point
 * Example integration with the Ludo game system
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { auth } from './src/firebaseConfig';
import { signInAnonymously } from 'firebase/auth';
import { useGame } from './src/hooks/useGame';

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('auth'); // auth, lobby, game
  const [currentGameId, setCurrentGameId] = useState(null);
  const [playerName, setPlayerName] = useState('');

  // Auto sign-in anonymously
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setScreen('lobby');
      } else {
        signInAnonymously(auth).catch(console.error);
      }
    });

    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.text}>Signing in...</Text>
      </View>
    );
  }

  if (screen === 'lobby') {
    return <LobbyScreen user={user} onJoinGame={(gameId) => {
      setCurrentGameId(gameId);
      setScreen('game');
    }} />;
  }

  if (screen === 'game' && currentGameId) {
    return <GameScreen gameId={currentGameId} userId={user.uid} onLeave={() => {
      setCurrentGameId(null);
      setScreen('lobby');
    }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

function LobbyScreen({ user, onJoinGame }) {
  const [playerName, setPlayerName] = useState('Player');
  const { createGame, actionLoading } = useGame(null, user.uid);

  const handleCreateGame = async () => {
    const result = await createGame(playerName, { starShortcuts: false });
    if (result.success) {
      onJoinGame(result.gameId);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎲 Ludo Game</Text>
      <Text style={styles.subtitle}>Server-Authoritative Multiplayer</Text>

      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={playerName}
        onChangeText={setPlayerName}
      />

      <Button
        title={actionLoading ? "Creating..." : "Create New Game"}
        onPress={handleCreateGame}
        disabled={actionLoading || !playerName}
        color="#4CAF50"
      />

      <Text style={styles.info}>
        This is a demo app. Integrate with your existing UI using the useGame hook.
      </Text>

      <StatusBar style="auto" />
    </View>
  );
}

function GameScreen({ gameId, userId, onLeave }) {
  const {
    game,
    loading,
    error,
    isMyTurn,
    availableMoves,
    myPlayer,
    rollDice,
    playMove,
    startGame,
    actionLoading,
  } = useGame(gameId, userId);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.text}>Loading game...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Back to Lobby" onPress={onLeave} />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Game not found</Text>
        <Button title="Back to Lobby" onPress={onLeave} />
      </View>
    );
  }

  const currentPlayer = game.players[game.turnIndex];
  const isHost = game.players[0]?.id === userId;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game: {gameId.substring(0, 8)}</Text>

      {/* Players */}
      <View style={styles.playersContainer}>
        {game.players.map((player, index) => (
          <View key={player.id} style={[styles.playerCard, { borderColor: player.color }]}>
            <Text style={styles.playerName}>{player.displayName}</Text>
            <Text style={styles.playerColor}>{player.color}</Text>
            {index === game.turnIndex && <Text style={styles.turnIndicator}>🎯 Turn</Text>}
          </View>
        ))}
      </View>

      {/* Game Status */}
      {!game.started && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Waiting for players... ({game.players.length}/4)</Text>
          {isHost && game.players.length >= 2 && (
            <Button
              title="Start Game"
              onPress={startGame}
              disabled={actionLoading}
              color="#2196F3"
            />
          )}
        </View>
      )}

      {game.started && (
        <>
          {/* Turn Info */}
          <View style={styles.turnContainer}>
            <Text style={styles.turnText}>
              {isMyTurn ? "🎲 Your Turn!" : `${currentPlayer.displayName}'s Turn`}
            </Text>
            {game.dice > 0 && (
              <Text style={styles.diceText}>Dice: {game.dice}</Text>
            )}
          </View>

          {/* Actions */}
          {isMyTurn && (
            <View style={styles.actionsContainer}>
              {game.dice === 0 ? (
                <Button
                  title={actionLoading ? "Rolling..." : "Roll Dice"}
                  onPress={rollDice}
                  disabled={actionLoading}
                  color="#4CAF50"
                />
              ) : (
                <View>
                  <Text style={styles.moveText}>Select a token to move:</Text>
                  {availableMoves.length > 0 ? (
                    <View style={styles.tokensContainer}>
                      {availableMoves.map((tokenIndex) => (
                        <TouchableOpacity
                          key={tokenIndex}
                          style={styles.tokenButton}
                          onPress={() => playMove(tokenIndex)}
                          disabled={actionLoading}
                        >
                          <Text style={styles.tokenButtonText}>Token {tokenIndex + 1}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noMovesText}>No valid moves</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Token Positions (Debug) */}
          {myPlayer && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Your Tokens:</Text>
              {game.tokens[myPlayer.id]?.map((token, index) => (
                <Text key={index} style={styles.debugText}>
                  Token {index + 1}: Position {token.pos} {token.inHome && '🏠'}
                </Text>
              ))}
            </View>
          )}

          {/* Winners */}
          {game.winnerIds.length > 0 && (
            <View style={styles.winnersContainer}>
              <Text style={styles.winnersTitle}>🏆 Winners:</Text>
              {game.winnerIds.map((winnerId) => {
                const winner = game.players.find(p => p.id === winnerId);
                return (
                  <Text key={winnerId} style={styles.winnerText}>
                    {winner?.displayName}
                  </Text>
                );
              })}
            </View>
          )}
        </>
      )}

      <Button title="Leave Game" onPress={onLeave} color="#f44336" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  info: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 30,
    textAlign: 'center',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    marginBottom: 20,
  },
  playersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  playerCard: {
    backgroundColor: '#16213e',
    padding: 10,
    margin: 5,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 100,
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerColor: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  turnIndicator: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 5,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  turnContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  turnText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  diceText: {
    color: '#fff',
    fontSize: 24,
    marginTop: 10,
  },
  actionsContainer: {
    width: '100%',
    marginVertical: 20,
  },
  moveText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  tokensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tokenButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 5,
    borderRadius: 8,
    minWidth: 100,
  },
  tokenButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noMovesText: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
  },
  debugContainer: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    width: '100%',
  },
  debugTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    color: '#aaa',
    fontSize: 12,
    marginVertical: 2,
  },
  winnersContainer: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    width: '100%',
  },
  winnersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  winnerText: {
    fontSize: 16,
    marginVertical: 2,
  },
});
