import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert } from 'react-native';
import { Text, Card, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { getWallet, createRoom, joinRoom } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LobbyScreen({ navigation, route }) {
  const gameMode = route?.params?.mode || 'online'; // 'online', 'local', 'computer'
  const isFreeModeMode = gameMode === 'local' || gameMode === 'computer';
  
  const [selectedMode, setSelectedMode] = useState('classic');
  const [selectedPlayers, setSelectedPlayers] = useState(4);
  const [betAmount, setBetAmount] = useState('50');
  const [userCoins, setUserCoins] = useState(0);
  const glowAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUserCoins();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadUserCoins = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        const wallet = await getWallet(userData.id);
        setUserCoins(wallet.coins || 0);
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const handleCreateGame = () => {
    const bet = parseInt(betAmount) || 0;
    
    // Check if user has enough coins for online mode
    if (!isFreeModeMode && userCoins < bet) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${bet} stars to join this game but you only have ${userCoins} stars.\n\nWould you like to add more stars?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Add Stars',
            onPress: () => navigation.navigate('ManualPayment')
          }
        ]
      );
      return;
    }

    // Create room for online/friends mode
    if (gameMode === 'online' || gameMode === 'friends') {
      (async () => {
        try {
          const user = await AsyncStorage.getItem('user');
          if (user) {
            const userData = JSON.parse(user);
            const room = await createRoom({ 
              userId: userData.id, 
              seats: selectedPlayers, 
              fee: bet 
            });
            await joinRoom({ 
              userId: userData.id, 
              roomId: room.roomId, 
              fee: bet 
            });
            navigation.navigate('Game', { 
              roomId: room.roomId,
              mode: gameMode,
              fee: bet,
              players: selectedPlayers,
            });
          }
        } catch (error) {
          Alert.alert('Error', error.message || 'Failed to create game');
        }
      })();
    } else {
      // Local/Computer mode - no room needed
      navigation.navigate('Game', { 
        mode: gameMode,
        betAmount: 0,
        players: selectedPlayers,
        roomId: `local-${Date.now()}`,
      });
    }
  };

  const gameModes = [
    { id: 'classic', name: 'Classic', icon: 'game-controller', color: '#2196F3' },
    { id: 'quick', name: 'Quick', icon: 'flash', color: '#FF9800' },
    { id: 'master', name: 'Master', icon: 'trophy', color: '#4CAF50' },
    { id: 'arrow', name: 'Arrow', icon: 'arrow-forward', color: '#E91E63' },
  ];

  const playerCounts = [2, 3, 4];
  const betAmounts = ['50', '100', '250', '500', '1000', '2500', '5000', '10000', '20000'];

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {gameMode === 'local' ? 'Local Mode' : gameMode === 'computer' ? 'VS Computer' : 'Create Game'}
              </Text>
              {isFreeModeMode && (
                <View style={styles.freeModeBadge}>
                  <Ionicons name="gift" size={16} color="#FFF" />
                  <Text style={styles.freeModeBadgeText}>FREE - No Betting</Text>
                </View>
              )}
            </View>
            <View style={{ width: 28 }} />
          </View>

          {/* Game Mode Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Game Mode</Text>
            <View style={styles.modeGrid}>
              {gameModes.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeCard,
                    selectedMode === mode.id && styles.modeCardSelected,
                  ]}
                  onPress={() => setSelectedMode(mode.id)}
                >
                  <LinearGradient
                    colors={selectedMode === mode.id ? [mode.color, mode.color + 'CC'] : ['#263238', '#37474F']}
                    style={styles.modeCardGradient}
                  >
                    <Ionicons name={mode.icon} size={32} color="#FFF" />
                    <Text style={styles.modeCardText}>{mode.name}</Text>
                    {selectedMode === mode.id && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Player Count Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Players</Text>
            <View style={styles.playerCountRow}>
              {playerCounts.map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.playerCountButton,
                    selectedPlayers === count && styles.playerCountButtonSelected,
                  ]}
                  onPress={() => setSelectedPlayers(count)}
                >
                  <LinearGradient
                    colors={selectedPlayers === count ? ['#2196F3', '#1976D2'] : ['#263238', '#37474F']}
                    style={styles.playerCountGradient}
                  >
                    <Ionicons name="people" size={24} color="#FFF" />
                    <Text style={styles.playerCountText}>{count} Players</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bet Amount Selection - Only for online modes */}
          {!isFreeModeMode && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Bet Amount</Text>
              <View style={styles.betGrid}>
                {betAmounts.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.betCard,
                      betAmount === amount && styles.betCardSelected,
                    ]}
                    onPress={() => setBetAmount(amount)}
                  >
                    <LinearGradient
                      colors={betAmount === amount ? ['#4CAF50', '#388E3C'] : ['#263238', '#37474F']}
                      style={styles.betCardGradient}
                    >
                      <Ionicons name="star" size={20} color="#FFD700" />
                      <Text style={styles.betCardText}>{amount}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Custom Amount */}
              <View style={styles.customBetContainer}>
                <Text style={styles.customBetLabel}>Custom Amount:</Text>
                <TextInput
                  mode="outlined"
                  value={betAmount}
                  onChangeText={setBetAmount}
                  keyboardType="numeric"
                  style={styles.customBetInput}
                  outlineColor="#37474F"
                  activeOutlineColor="#2196F3"
                  textColor="#FFF"
                  placeholder="Enter amount"
                  placeholderTextColor="#78909C"
                />
              </View>
            </View>
          )}

          {/* Game Rules */}
          <View style={styles.section}>
            <Card style={styles.rulesCard}>
              <Card.Content>
                <Text style={styles.rulesTitle}>
                  {isFreeModeMode ? 'Mode Features' : 'Game Rules'}
                </Text>
                {isFreeModeMode ? (
                  <>
                    <View style={styles.ruleItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      <Text style={styles.ruleText}>
                        {gameMode === 'local' ? 'Play with friends on same device' : 'Play against AI opponents'}
                      </Text>
                    </View>
                    <View style={styles.ruleItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      <Text style={styles.ruleText}>No betting required</Text>
                    </View>
                    <View style={styles.ruleItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      <Text style={styles.ruleText}>
                        {gameMode === 'local' ? 'Pass device between players' : 'Practice and improve skills'}
                      </Text>
                    </View>
                    <View style={styles.ruleItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      <Text style={styles.ruleText}>Play anytime, anywhere</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.ruleItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      <Text style={styles.ruleText}>Winner takes all coins</Text>
                    </View>
                    <View style={styles.ruleItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      <Text style={styles.ruleText}>Fair play guaranteed</Text>
                    </View>
                    <View style={styles.ruleItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      <Text style={styles.ruleText}>Auto-match with players</Text>
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>
          </View>

          {/* User Balance Display (Online Mode Only) */}
          {!isFreeModeMode && (
            <View style={styles.balanceContainer}>
              <Card style={styles.balanceCard}>
                <Card.Content style={styles.balanceContent}>
                  <View style={styles.balanceLeft}>
                    <Ionicons name="wallet" size={24} color="#4CAF50" />
                    <View>
                      <Text style={styles.balanceLabel}>Your Balance</Text>
                      <View style={styles.balanceAmount}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.balanceText}>{userCoins.toLocaleString()}</Text>
                      </View>
                    </View>
                  </View>
                  {userCoins < parseInt(betAmount || 0) && (
                    <View style={styles.insufficientBadge}>
                      <Ionicons name="warning" size={16} color="#FFF" />
                      <Text style={styles.insufficientText}>Low</Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Create Game Button */}
          <View style={styles.createButtonContainer}>
            <Animated.View style={{ transform: [{ scale: glowAnim }] }}>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateGame}
              >
                <LinearGradient 
                  colors={isFreeModeMode ? ['#FF9800', '#F57C00'] : ['#4CAF50', '#388E3C']} 
                  style={styles.createButtonGradient}
                >
                  <Ionicons name="play-circle" size={32} color="#FFF" />
                  <View>
                    <Text style={styles.createButtonText}>
                      {isFreeModeMode ? 'START GAME' : 'CREATE GAME'}
                    </Text>
                    <Text style={styles.createButtonSubtext}>
                      {isFreeModeMode ? 'Play for free!' : `Entry: ${betAmount} stars`}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitleContainer: {
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  freeModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  freeModeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modeCard: {
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  modeCardSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  modeCardGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  modeCardText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  playerCountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  playerCountButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  playerCountButtonSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  playerCountGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  playerCountText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  betGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  betCard: {
    width: '30%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  betCardSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  betCardGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  betCardText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customBetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customBetLabel: {
    color: '#FFF',
    fontSize: 14,
  },
  customBetInput: {
    flex: 1,
    backgroundColor: '#263238',
  },
  rulesCard: {
    backgroundColor: '#263238',
  },
  rulesTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ruleText: {
    color: '#B0BEC5',
    fontSize: 14,
  },
  createButtonContainer: {
    padding: 16,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
  },
  createButtonGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  createButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  balanceContainer: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#263238',
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceLabel: {
    color: '#B0BEC5',
    fontSize: 12,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  balanceText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  insufficientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  insufficientText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
