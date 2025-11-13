import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Animated } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AnimatedCard from '../components/AnimatedCard';
import DailyRewardPopup from '../components/DailyRewardPopup';
import { getEvents, claimDailyReward, getDailyRewardStatus, spinWheel, getLeaderboard } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EventScreen({ navigation }) {
  const [showReward, setShowReward] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyRewardStatus, setDailyRewardStatus] = useState(null);
  const [claimedReward, setClaimedReward] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userId, setUserId] = useState(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    
    // Rotating animation for gift icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
    
    // Refresh status every minute
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;
      setUserId(userData?.id);

      const [eventsData, leaderboardData] = await Promise.all([
        getEvents(),
        getLeaderboard('wins', 5)
      ]);

      setEvents(eventsData);
      setLeaderboard(leaderboardData);

      if (userData?.id) {
        const status = await getDailyRewardStatus(userData.id);
        setDailyRewardStatus(status);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = async (event) => {
    if (!userId) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      if (event.type === 'daily') {
        const result = await claimDailyReward(userId);
        setClaimedReward(result.reward);
        setShowReward(true);
        // Refresh status
        const status = await getDailyRewardStatus(userId);
        setDailyRewardStatus(status);
      } else if (event.type === 'spin') {
        const result = await spinWheel(userId);
        Alert.alert('Lucky Spin!', result.message);
      } else if (event.type === 'tournament') {
        navigation.navigate('Tournament');
      } else if (event.type === 'referral') {
        navigation.navigate('Social');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to claim reward');
    }
  };

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Events & Rewards</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Events List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          ) : (
            <View style={styles.eventsContainer}>
              {events.map((event, index) => {
                // Check if this is daily bonus and if it's claimed
                const isDailyBonus = event.type === 'daily';
                const canClaim = isDailyBonus ? dailyRewardStatus?.canClaim : true;
                const hoursRemaining = isDailyBonus ? dailyRewardStatus?.hoursRemaining : 0;
                
                // Rotate animation interpolation
                const spin = rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                });

                return (
                  <AnimatedCard
                    key={event.id}
                    colors={canClaim ? event.color : ['#263238', '#37474F']}
                    onPress={() => canClaim && handleEventPress(event)}
                    style={styles.eventCard}
                    delay={index * 100}
                  >
                    <View style={styles.eventCardContent}>
                      {/* Animated Icon */}
                      <View style={styles.eventIcon}>
                        {isDailyBonus && canClaim ? (
                          <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <Ionicons name={event.icon} size={40} color="#FFF" />
                          </Animated.View>
                        ) : (
                          <Ionicons 
                            name={canClaim ? event.icon : 'time'} 
                            size={40} 
                            color={canClaim ? "#FFF" : "#78909C"} 
                          />
                        )}
                      </View>
                      
                      <View style={styles.eventContent}>
                        <Text style={[styles.eventTitle, !canClaim && styles.disabledText]}>
                          {event.title}
                        </Text>
                        <Text style={[styles.eventSubtitle, !canClaim && styles.disabledText]}>
                          {event.description}
                        </Text>
                        
                        {canClaim ? (
                          <View style={styles.rewardBadge}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.rewardText}>{event.reward}</Text>
                          </View>
                        ) : (
                          <View style={styles.cooldownBadge}>
                            <Ionicons name="hourglass" size={16} color="#FF9800" />
                            <Text style={styles.cooldownText}>
                              Available in {hoursRemaining}h
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      {canClaim ? (
                        <Ionicons name="chevron-forward" size={24} color="#FFF" />
                      ) : (
                        <View style={styles.lockedBadge}>
                          <Ionicons name="lock-closed" size={20} color="#78909C" />
                        </View>
                      )}
                    </View>
                  </AnimatedCard>
                );
              })}
            </View>
          )}

          <DailyRewardPopup
            visible={showReward}
            onClose={() => setShowReward(false)}
            reward={claimedReward || 5}
          />

          {/* Leaderboard Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Players</Text>
            <Card style={styles.leaderboardCard}>
              <Card.Content>
                {leaderboard.length === 0 ? (
                  <Text style={styles.emptyText}>No players yet</Text>
                ) : (
                  leaderboard.map((player) => (
                    <View key={player.id} style={styles.leaderboardItem}>
                      <View style={[styles.rankBadge, { 
                        backgroundColor: player.rank === 1 ? '#FFD700' : player.rank === 2 ? '#C0C0C0' : player.rank === 3 ? '#CD7F32' : '#2196F3'
                      }]}>
                        <Text style={styles.rankText}>#{player.rank}</Text>
                      </View>
                      <View style={styles.playerInfo}>
                        <Text style={styles.playerName}>{player.username}</Text>
                        <Text style={styles.playerScore}>{player.totalWins} wins • {player.winRate}% win rate</Text>
                      </View>
                      {player.rank <= 3 && (
                        <Ionicons
                          name="trophy"
                          size={24}
                          color={player.rank === 1 ? '#FFD700' : player.rank === 2 ? '#C0C0C0' : '#CD7F32'}
                        />
                      )}
                    </View>
                  ))
                )}
              </Card.Content>
            </Card>
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
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventsContainer: {
    padding: 16,
    gap: 12,
  },
  eventCard: {
    marginBottom: 12,
  },
  eventCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  eventIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  rewardText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  leaderboardCard: {
    backgroundColor: '#263238',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerScore: {
    color: '#B0BEC5',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cooldownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: 'rgba(255,152,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  cooldownText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#78909C',
  },
  lockedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#B0BEC5',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});
