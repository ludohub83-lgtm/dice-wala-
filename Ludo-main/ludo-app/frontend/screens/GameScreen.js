import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Animated, Easing, Dimensions, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, ProgressBar, Portal, Dialog } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as gameService from '../services/gameService';
import LudoKingBoardPerfect from '../components/LudoKingBoardPerfect';
import Dice from '../components/Dice';
import Screen from '../components/Screen';
import GameStartCountdown from '../components/GameStartCountdown';
import ConfettiEffect from '../components/ConfettiEffect';
import { useResponsive } from '../components/ResponsiveContainer';
import { createRoom, joinRoom, postHistory, getEquippedDice, getAppConfig } from '../services/api';
import { addRecentMatch } from '../services/history';
import { initializeDifficulty, getDifficultyName, getWinBonus } from '../services/gameDifficulty';
import LocalGameEngine from '../services/localGameService';
import { initialState, moveToken, rollDice, playerWon, movableTokens } from '../clone/utils/gameLogic';

const { width } = Dimensions.get('window');

export default function GameScreen({ route, navigation, user }) {
  const gameMode = route?.params?.mode || 'online'; // 'online', 'local', 'computer', 'friends'
  const room = route?.params?.roomId || `room-${Date.now()}`;
  const roomFee = route?.params?.fee || route?.params?.betAmount || 20;
  const numPlayers = route?.params?.players || 4;
  const isOnlineMode = gameMode === 'online' || gameMode === 'friends';
  const isLocalMode = gameMode === 'local';
  const isComputerMode = gameMode === 'computer';
  
  const [state, setState] = useState(null);
  const [timer, setTimer] = useState(15);
  const [winner, setWinner] = useState(null);
  const [equippedDice, setEquippedDice] = useState('default');
  const [showCountdown, setShowCountdown] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState(null);
  const [localGameState, setLocalGameState] = useState(null);
  const [lastRoll, setLastRoll] = useState(null);
  const [adminControls, setAdminControls] = useState(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const { moderateScale, isSmallDevice } = useResponsive();

  // Error handler
  useEffect(() => {
    const errorHandler = (error) => {
      console.error('Game error:', error);
      setError(error.message || 'An error occurred');
    };
    
    return () => {};
  }, []);

  useEffect(() => {
    // Initialize game difficulty
    initializeDifficulty();
    
    // Load admin game controls
    (async () => {
      try {
        const config = await getAppConfig();
        if (config?.gameControls) {
          setAdminControls(config.gameControls);
        }
      } catch (error) {
        console.error('Failed to load game controls:', error);
      }
    })();
    
    // Show countdown for 3 seconds before starting game
    const countdownTimer = setTimeout(() => {
      setShowCountdown(false);
      setGameStarted(true);
    }, 3500);

    // Initialize game based on mode
    if (isOnlineMode) {
      // Online/Friends mode - use Firebase
      const onStateUpdate = (st) => {
        setState(st);
        // Check for winners
        if (st.winners && st.winners.length > 0) {
          const winnerId = st.winners[st.winners.length - 1];
          if (winnerId !== winner) {
            setWinner(winnerId);
            if (winnerId === user.id) {
              setShowConfetti(true);
            }
            // Save history
            (async () => {
              try {
                addRecentMatch({ roomId: room, fee: roomFee, winner: winnerId, me: user.id, won: winnerId === user.id });
              } catch {}
              try {
                await postHistory({ userId: user.id, roomId: room, fee: roomFee, winner: winnerId, won: winnerId === user.id, ts: Date.now() });
              } catch {}
            })();
          }
        }
      };

      const disconnect = gameService.connectToGame(room, user.id, onStateUpdate);
      
      return () => {
        clearTimeout(countdownTimer);
        disconnect();
      };
    } else {
      // Local/Computer mode - use local game engine
      const localState = initialState(numPlayers, 2);
      setLocalGameState(localState);
      setState({
        players: Array.from({ length: numPlayers }, (_, i) => `player-${i + 1}`),
        turn: 0,
        lastRoll: null,
        tokens: localState.tokens.map((row, pIdx) => row.map(t => t.pos)),
        winners: [],
        validMoves: {},
      });
      
      return () => {
        clearTimeout(countdownTimer);
      };
    }
    
    // Get equipped dice
    (async () => {
      try {
        const key = await getEquippedDice(user.id);
        if (key) setEquippedDice(key);
      } catch {}
    })();
  }, [room, user.id, gameMode, numPlayers]);

  const requestRoll = async (v) => {
    try {
      if (isOnlineMode) {
        await gameService.requestRoll(room, user.id);
      } else {
        // Local/Computer mode - roll locally
        const roll = rollDice();
        setLastRoll(roll);
        
        // If computer mode and it's bot's turn, auto-move
        if (isComputerMode && state && state.turn !== 0) {
          setTimeout(() => {
            handleBotMove(roll);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Roll error:', error);
      setError(error.message || 'Failed to roll dice');
    }
  };

  const handleBotMove = (roll) => {
    if (!localGameState) return;
    
    const validMoves = movableTokens(localGameState, localGameState.current, roll);
    if (validMoves.length === 0) {
      // No valid moves, advance turn
      const newState = { ...localGameState };
      newState.current = (newState.current + 1) % numPlayers;
      setLocalGameState(newState);
      updateStateFromLocal(newState);
      return;
    }
    
    // Bot logic: prefer finishing pieces
    let bestMove = validMoves[0];
    for (const move of validMoves) {
      const testState = JSON.parse(JSON.stringify(localGameState));
      const result = moveToken(testState, localGameState.current, move, roll);
      if (result.tokens[localGameState.current][move].finished) {
        bestMove = move;
        break;
      }
    }
    
    handleLocalMove(bestMove, roll);
  };

  const handleLocalMove = (tokenIndex, roll) => {
    if (!localGameState) return;
    
    const newState = moveToken(JSON.parse(JSON.stringify(localGameState)), localGameState.current, tokenIndex, roll);
    setLocalGameState(newState);
    updateStateFromLocal(newState);
    
    // Check for winner
    if (playerWon(newState, newState.current)) {
      setWinner(newState.current);
      if (newState.current === 0) {
        setShowConfetti(true);
      }
    }
    
    // If computer mode and next is bot, auto-roll
    if (isComputerMode && newState.current !== 0 && roll !== 6) {
      setTimeout(() => {
        const botRoll = rollDice();
        setLastRoll(botRoll);
        setTimeout(() => handleBotMove(botRoll), 500);
      }, 1500);
    }
  };

  const updateStateFromLocal = (localState) => {
    setState({
      players: Array.from({ length: numPlayers }, (_, i) => i === 0 ? user.id : `bot-${i}`),
      turn: localState.current,
      lastRoll: lastRoll,
      tokens: localState.tokens.map((row) => row.map(t => t.pos)),
      winners: [],
      validMoves: { [user.id]: movableTokens(localState, 0, lastRoll || 1) },
    });
  };

  const isMyTurn = state && state.players && (
    isOnlineMode 
      ? state.players[state.turn] === user.id
      : state.turn === 0
  );

  // Token selection UX
  const bounce = useRef(new Animated.Value(1)).current;
  const pulse = () => {
    Animated.sequence([
      Animated.timing(bounce, { toValue: 1.08, duration: 140, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 1, duration: 120, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  };
  const selectToken = async (idx) => {
    try {
      if (isOnlineMode) {
        // Online mode
        const result = await gameService.makeMove(room, user.id, idx);
        if (result && result.ok) {
          pulse();
          // Show capture notification
          if (result.captured && result.captured.length > 0) {
            Alert.alert('🎯 Capture!', `You captured ${result.captured.length} opponent piece(s)!`);
          }
          // Show finished notification
          if (result.finished) {
            Alert.alert('🏁 Piece Finished!', 'Your piece reached home!');
          }
        } else {
          Alert.alert('Invalid Move', result?.error || 'Cannot make this move');
        }
      } else {
        // Local/Computer mode
        if (!lastRoll) {
          Alert.alert('Roll First', 'Please roll the dice first!');
          return;
        }
        
        const validMoves = movableTokens(localGameState, 0, lastRoll);
        if (!validMoves.includes(idx)) {
          Alert.alert('Invalid Move', 'Cannot move this piece');
          return;
        }
        
        handleLocalMove(idx, lastRoll);
        pulse();
        setLastRoll(null); // Reset roll
        
        // Auto-roll for next player if local mode
        if (isLocalMode && localGameState && localGameState.current !== 0) {
          setTimeout(() => {
            const roll = rollDice();
            setLastRoll(roll);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Move error:', error);
      setError(error.message || 'Failed to make move');
      Alert.alert('Error', error.message || 'Failed to make move');
    }
  };

  useEffect(() => {
    // Reset and run a simple local countdown each time turn changes
    setTimer(15);
  }, [state?.turn]);

  useEffect(() => {
    if (!state) return;
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [state?.turn]);

  const handleExitGame = () => {
    setShowExitDialog(true);
  };

  const confirmExit = async () => {
    try {
      // Record the loss in history
      if (isOnlineMode) {
        try {
          await postHistory({ 
            userId: user.id, 
            roomId: room, 
            fee: roomFee, 
            winner: null, 
            won: false, 
            forfeited: true,
            ts: Date.now() 
          });
          addRecentMatch({ 
            roomId: room, 
            fee: roomFee, 
            winner: null, 
            me: user.id, 
            won: false,
            forfeited: true 
          });
        } catch (error) {
          console.error('Failed to record forfeit:', error);
        }
      }
      
      setShowExitDialog(false);
      navigation.goBack();
    } catch (error) {
      console.error('Exit error:', error);
      setShowExitDialog(false);
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        <GameStartCountdown
          visible={showCountdown}
          onComplete={() => setShowCountdown(false)}
        />
        <ConfettiEffect
          visible={showConfetti}
          onComplete={() => setShowConfetti(false)}
        />
        <ScrollView contentContainerStyle={{ padding: isSmallDevice ? 12 : 16, gap: 12 }}>
        <Portal>
          {/* Exit Game Dialog */}
          <Dialog visible={showExitDialog} onDismiss={() => setShowExitDialog(false)}>
            <Dialog.Title style={{ textAlign: 'center', fontSize: moderateScale(22), color: '#F44336' }}>
              ⚠️ Exit Game?
            </Dialog.Title>
            <Dialog.Content style={{ alignItems: 'center', paddingVertical: 20 }}>
              <View style={styles.warningIcon}>
                <Ionicons name="warning" size={moderateScale(60)} color="#FF9800" />
              </View>
              <Text style={[styles.resultText, { fontSize: 16, marginBottom: 12 }]}>
                Are you sure you want to exit this game?
              </Text>
              <View style={[styles.prizeBox, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
                <Ionicons name="close-circle" size={20} color="#F44336" />
                <Text style={[styles.prizeText, { color: '#F44336' }]}>
                  -{roomFee} coins
                </Text>
              </View>
              <Text style={[styles.warningText, { marginTop: 12, textAlign: 'center', color: '#666' }]}>
                Your entry fee will not be returned if you exit now.
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={{ justifyContent: 'space-around', padding: 16 }}>
              <Button
                mode="outlined"
                onPress={() => setShowExitDialog(false)}
                style={styles.dialogButton}
                textColor="#4CAF50"
              >
                Stay in Game
              </Button>
              <Button
                mode="contained"
                buttonColor="#F44336"
                onPress={confirmExit}
                style={styles.dialogButton}
              >
                Exit & Forfeit
              </Button>
            </Dialog.Actions>
          </Dialog>

          {/* Winner Dialog */}
          <Dialog visible={!!winner} onDismiss={() => setWinner(null)}>
            <Dialog.Title style={{ textAlign: 'center', fontSize: moderateScale(24) }}>
              {winner === user.id ? '🎉 Victory!' : '😔 Game Over'}
            </Dialog.Title>
            <Dialog.Content style={{ alignItems: 'center' }}>
              <View style={styles.resultIcon}>
                <Ionicons
                  name={winner === user.id ? 'trophy' : 'close-circle'}
                  size={moderateScale(60)}
                  color={winner === user.id ? '#FFD700' : '#F44336'}
                />
              </View>
              <Text style={styles.resultText}>
                {winner === user.id ? 'Congratulations! You won!' : `${winner || 'Someone'} won this match.`}
              </Text>
              <View style={styles.prizeBox}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.prizeText}>
                  {winner === user.id 
                    ? `+${Math.floor(roomFee * 4 * getWinBonus())}` 
                    : `-${roomFee}`} coins
                </Text>
                {winner === user.id && getDifficultyName() !== 'Normal' && (
                  <Text style={styles.difficultyText}>
                    ({getDifficultyName()} Mode: {Math.floor((getWinBonus() - 1) * 100)}% bonus)
                  </Text>
                )}
              </View>
            </Dialog.Content>
            <Dialog.Actions style={{ justifyContent: 'space-around', padding: 16 }}>
              <Button
                mode="outlined"
                onPress={() => { setWinner(null); navigation.goBack(); }}
                style={styles.dialogButton}
              >
                Exit
              </Button>
              <Button
                mode="contained"
                buttonColor="#4CAF50"
                onPress={async () => {
                  try {
                    const r = await createRoom({ userId: user.id, seats: 4, fee: roomFee });
                    await joinRoom({ userId: user.id, roomId: r.roomId, fee: roomFee });
                    setWinner(null);
                    setShowCountdown(true);
                    navigation.replace('Game', { roomId: r.roomId, fee: roomFee });
                  } catch (e) {
                    alert(e?.response?.data?.message || 'Failed to start another match');
                  }
                }}
                style={styles.dialogButton}
              >
                Play Again
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Card style={styles.card}>
          <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.cardGradient}>
            <View style={styles.matchInfo}>
              <View style={styles.matchHeader}>
                <Ionicons name="game-controller" size={24} color="#FFF" />
                <Text style={styles.matchTitle}>Match: {room}</Text>
                <TouchableOpacity 
                  style={styles.exitButton}
                  onPress={handleExitGame}
                  activeOpacity={0.7}
                >
                  <Ionicons name="exit-outline" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.prizeInfo}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.prizeInfoText}>Entry: {roomFee} • Prize: {roomFee * 4}</Text>
              </View>
            </View>
            <View style={styles.turnInfo}>
              <View style={[styles.turnIndicator, isMyTurn && styles.myTurn]}>
                <Text style={styles.turnText}>
                  {isMyTurn ? '🎮 Your Turn' : '⏳ Opponent Turn'}
                </Text>
              </View>
              <ProgressBar
                progress={(15 - timer) / 15}
                color="#FFD700"
                style={styles.progressBar}
              />
              <Text style={styles.timerText}>⏱️ {timer}s remaining</Text>
            </View>
          </LinearGradient>
        </Card>

        {/* Game Board with Tokens */}
        {state && (
          <Card style={styles.boardCard}>
            <Card.Content style={styles.boardContent}>
              <LudoKingBoardPerfect
                gameState={{
                  tokens: isOnlineMode 
                    ? state.tokens 
                    : localGameState?.tokens.map((row) => row.map(t => t.pos))
                }}
                onTokenPress={(playerId, tokenIndex) => {
                  if (isOnlineMode) {
                    if (playerId === state.players.indexOf(user.id)) {
                      selectToken(tokenIndex);
                    }
                  } else {
                    if (playerId === 0) {
                      selectToken(tokenIndex);
                    }
                  }
                }}
                currentPlayer={isOnlineMode ? state.players.indexOf(user.id) : 0}
                validMoves={
                  isOnlineMode 
                    ? (state.validMoves?.[user.id] || [])
                    : (lastRoll && localGameState ? movableTokens(localGameState, 0, lastRoll) : [])
                }
              />
            </Card.Content>
          </Card>
        )}

        {/* Dice */}
        <Card style={styles.diceCard}>
          <Card.Content style={styles.diceContent}>
            <Dice 
              onRoll={requestRoll} 
              enabled={!!isMyTurn && (!isComputerMode || state?.turn === 0)} 
              themeKey={equippedDice}
              lastRoll={state?.lastRoll || lastRoll}
            />
            {isLocalMode && (
              <Text style={styles.modeIndicator}>
                Player {state?.turn + 1 || 1}'s Turn
              </Text>
            )}
            {isComputerMode && state?.turn !== 0 && (
              <Text style={styles.modeIndicator}>
                Computer is thinking...
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Player Info */}
        {state && state.players && (
          <Card style={styles.playersCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.playersTitle}>Players</Text>
              <View style={styles.playersList}>
                {state.players.map((playerId, idx) => {
                  const isCurrent = state.turn === idx;
                  const tokens = state.tokens?.[playerId] || [];
                  const finished = tokens.filter(p => p === 57).length;
                  
                  return (
                    <View 
                      key={playerId} 
                      style={[
                        styles.playerItem,
                        isCurrent && styles.playerItemActive,
                        playerId === user.id && styles.playerItemMe
                      ]}
                    >
                      <View style={[styles.playerColor, { backgroundColor: ['#EF4444', '#2563EB', '#22C55E', '#FBBF24'][idx] }]} />
                      <Text style={styles.playerName}>
                        {playerId === user.id ? 'You' : `Player ${idx + 1}`}
                        {isCurrent && ' 🎮'}
                      </Text>
                      <Text style={styles.playerProgress}>
                        {finished}/4 finished
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="outlined"
          onPress={async () => {
            const state = await gameService.getState(room);
            if (state) setState(state);
          }}
          textColor="#2196F3"
          style={styles.refreshButton}
          icon="refresh"
        >
          Refresh State
        </Button>
      </ScrollView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  cardGradient: {
    padding: 16,
  },
  matchInfo: {
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  matchTitle: {
    flex: 1,
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exitButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prizeInfoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  turnInfo: {
    gap: 8,
  },
  turnIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  myTurn: {
    backgroundColor: '#4CAF50',
  },
  turnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  timerText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  resultIcon: {
    marginVertical: 20,
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  prizeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 8,
  },
  prizeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  dialogButton: {
    minWidth: 120,
  },
  refreshButton: {
    borderRadius: 12,
    borderColor: '#2196F3',
  },
  boardCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    marginVertical: 8,
  },
  boardContent: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceCard: {
    borderRadius: 16,
    elevation: 4,
    marginVertical: 8,
  },
  diceContent: {
    padding: 16,
    alignItems: 'center',
  },
  playersCard: {
    borderRadius: 16,
    elevation: 4,
    marginVertical: 8,
  },
  playersTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  playersList: {
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  playerItemActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  playerItemMe: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
  },
  playerColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  playerName: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  playerProgress: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  difficultyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modeIndicator: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  warningIcon: {
    marginVertical: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
