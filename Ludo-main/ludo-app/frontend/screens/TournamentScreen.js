import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Animated } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { getActiveTournament, joinTournament, getTournamentStatus, leaveTournament } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TournamentScreen({ navigation }) {
  const [tournament, setTournament] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    
    // Pulse animation for live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setUserId(userData.id);
        setUsername(userData.username || `Player${userData.id}`);

        const [tournamentData, statusData] = await Promise.all([
          getActiveTournament(),
          getTournamentStatus(userData.id)
        ]);

        setTournament(tournamentData.tournament);
        setStatus(statusData);
      }
    } catch (error) {
      console.error('Failed to load tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!userId || joining) return;

    setJoining(true);
    try {
      const result = await joinTournament(userId, username);
      
      if (result.match) {
        // Match found, navigate to game
        Alert.alert(
          'Match Found!',
          'Starting your tournament match...',
          [
            {
              text: 'Play Now',
              onPress: () => navigation.navigate('Game', {
                mode: 'tournament',
                matchId: result.match.id,
                tournamentId: result.tournament.id,
                betAmount: 0 // Already paid entry fee
              })
            }
          ]
        );
      } else {
        // Added to queue
        Alert.alert('Joined Tournament', result.message);
      }
      
      await loadData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to join tournament');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    Alert.alert(
      'Leave Tournament',
      'Are you sure? Your entry fee will be refunded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveTournament(userId);
              Alert.alert('Success', 'Left tournament and refunded entry fee');
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to leave tournament');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <Screen>
        <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        </LinearGradient>
      </Screen>
    );
  }

  const timeRemaining = tournament ? new Date(tournament.endTime) - new Date() : 0;
  const minutesRemaining = Math.floor(timeRemaining / 60000);

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hourly Tournament</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Tournament Info Card */}
          <View style={styles.section}>
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.tournamentCard}>
              <View style={styles.tournamentHeader}>
                <Ionicons name="trophy" size={48} color="#FFD700" />
                <View style={styles.tournamentInfo}>
                  <Text style={styles.tournamentTitle}>Active Tournament</Text>
                  <Text style={styles.tournamentId}>{tournament?.id}</Text>
                </View>
              </View>

              {/* Live Player Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Players Joined</Text>
                  <Text style={styles.progressCount}>
                    {tournament?.totalPlayers || 0} Players
                  </Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill,
                        { 
                          width: `${Math.min(((tournament?.totalPlayers || 0) / 100) * 100, 100)}%` 
                        }
                      ]}
                    >
                      <LinearGradient
                        colors={['#FFD700', '#FFA000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.progressGradient}
                      />
                    </View>
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>0</Text>
                    <Text style={styles.progressLabel}>25</Text>
                    <Text style={styles.progressLabel}>50</Text>
                    <Text style={styles.progressLabel}>75</Text>
                    <Text style={styles.progressLabel}>100+</Text>
                  </View>
                </View>

                {/* Live Indicator */}
                <View style={styles.liveIndicator}>
                  <Animated.View 
                    style={[
                      styles.liveDot,
                      { transform: [{ scale: pulseAnim }] }
                    ]} 
                  />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={24} color="#FFF" />
                  <Text style={styles.statValue}>{tournament?.totalPlayers || 0}</Text>
                  <Text style={styles.statLabel}>Total Players</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="game-controller" size={24} color="#FFF" />
                  <Text style={styles.statValue}>{tournament?.totalMatches || 0}</Text>
                  <Text style={styles.statLabel}>Active Matches</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={24} color="#FFF" />
                  <Text style={styles.statValue}>{minutesRemaining}m</Text>
                  <Text style={styles.statLabel}>Time Left</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Prize Info */}
          <View style={styles.section}>
            <Card style={styles.prizeCard}>
              <Card.Content>
                <View style={styles.prizeRow}>
                  <View style={styles.prizeItem}>
                    <Text style={styles.prizeLabel}>Entry Fee</Text>
                    <View style={styles.prizeAmount}>
                      <Ionicons name="star" size={20} color="#FFD700" />
                      <Text style={styles.prizeValue}>100</Text>
                    </View>
                  </View>
                  <Ionicons name="arrow-forward" size={24} color="#4CAF50" />
                  <View style={styles.prizeItem}>
                    <Text style={styles.prizeLabel}>Win Prize</Text>
                    <View style={styles.prizeAmount}>
                      <Ionicons name="star" size={20} color="#FFD700" />
                      <Text style={styles.prizeValue}>300</Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* How It Works */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <Card style={styles.infoCard}>
              <Card.Content>
                <View style={styles.infoItem}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepNumber}>1</Text>
                  </View>
                  <Text style={styles.infoText}>Pay 100 stars entry fee</Text>
                </View>
                <View style={styles.infoItem}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                  <Text style={styles.infoText}>Wait for 4 players to join</Text>
                </View>
                <View style={styles.infoItem}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepNumber}>3</Text>
                  </View>
                  <Text style={styles.infoText}>Play match (max 3 min wait)</Text>
                </View>
                <View style={styles.infoItem}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepNumber}>4</Text>
                  </View>
                  <Text style={styles.infoText}>Winner gets 300 stars!</Text>
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* Player Status */}
          {status?.inTournament && (
            <View style={styles.section}>
              <Card style={styles.statusCard}>
                <Card.Content>
                  <View style={styles.statusHeader}>
                    <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                    <Text style={styles.statusTitle}>You're In!</Text>
                  </View>
                  <Text style={styles.statusText}>
                    Position in queue: {status.position}
                  </Text>
                  <Text style={styles.statusText}>
                    Waiting players: {status.waitingPlayers}
                  </Text>
                  <TouchableOpacity
                    style={styles.leaveButton}
                    onPress={handleLeave}
                  >
                    <Text style={styles.leaveButtonText}>Leave & Refund</Text>
                  </TouchableOpacity>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Join Button */}
          {!status?.inTournament && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoin}
                disabled={joining}
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  style={styles.joinGradient}
                >
                  {joining ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="trophy" size={32} color="#FFF" />
                      <View>
                        <Text style={styles.joinText}>Join Tournament</Text>
                        <Text style={styles.joinSubtext}>Entry: 100 stars</Text>
                      </View>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Queue Info with Progress */}
          {tournament?.playersInQueue > 0 && (
            <View style={styles.section}>
              <Card style={styles.queueCard}>
                <Card.Content>
                  <View style={styles.queueHeader}>
                    <Ionicons name="hourglass" size={24} color="#FF9800" />
                    <Text style={styles.queueTitle}>Matchmaking Queue</Text>
                  </View>
                  
                  <View style={styles.queueProgressContainer}>
                    <View style={styles.queueProgressBar}>
                      <View 
                        style={[
                          styles.queueProgressFill,
                          { width: `${(tournament.playersInQueue / 4) * 100}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.queueProgressText}>
                      {tournament.playersInQueue} / 4 players
                    </Text>
                  </View>
                  
                  <Text style={styles.queueText}>
                    {4 - tournament.playersInQueue} more player(s) needed to start match
                  </Text>
                </Card.Content>
              </Card>
            </View>
          )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  tournamentCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },
  tournamentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tournamentId: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  progressSection: {
    marginVertical: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressCount: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    minWidth: '2%',
  },
  progressGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  liveText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  prizeCard: {
    backgroundColor: '#263238',
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  prizeItem: {
    alignItems: 'center',
    gap: 8,
  },
  prizeLabel: {
    color: '#B0BEC5',
    fontSize: 14,
  },
  prizeAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prizeValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#263238',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#FFF',
    fontSize: 16,
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#263238',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusTitle: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 8,
  },
  leaveButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F44336',
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  joinButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  joinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  joinText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  joinSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  queueCard: {
    backgroundColor: '#263238',
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  queueTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  queueProgressContainer: {
    marginBottom: 12,
  },
  queueProgressBar: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  queueProgressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 10,
    minWidth: '5%',
  },
  queueProgressText: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  queueText: {
    color: '#B0BEC5',
    fontSize: 14,
    textAlign: 'center',
  },
});
