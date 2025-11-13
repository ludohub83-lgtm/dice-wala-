import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { getLeaderboard, getUserRank } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LeaderboardScreen({ navigation }) {
  const [type, setType] = useState('wins');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [type]);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard(type, 50);
      setLeaderboard(data);

      // Get user's rank
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        const rank = await getUserRank(userData.id, type);
        setUserRank(rank);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const getTrophyColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#2196F3';
    }
  };

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* User Rank Card */}
        {userRank && (
          <View style={styles.userRankContainer}>
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.userRankCard}>
              <View style={styles.userRankLeft}>
                <View style={[styles.rankBadge, { backgroundColor: getTrophyColor(userRank.rank) }]}>
                  <Text style={styles.rankText}>#{userRank.rank}</Text>
                </View>
                <View>
                  <Text style={styles.userRankName}>Your Rank</Text>
                  <Text style={styles.userRankStats}>
                    {type === 'wins' ? `${userRank.totalWins} wins` : `${userRank.coins} coins`}
                  </Text>
                </View>
              </View>
              <Ionicons name="trophy" size={32} color="#FFD700" />
            </LinearGradient>
          </View>
        )}

        {/* Type Selector */}
        <View style={styles.typeContainer}>
          <SegmentedButtons
            value={type}
            onValueChange={setType}
            buttons={[
              { value: 'wins', label: 'TOP WINS' },
              { value: 'coins', label: 'TOP COINS' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Leaderboard List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
            }
          >
            <View style={styles.leaderboardList}>
              {leaderboard.map((player) => (
                <View key={player.id} style={styles.playerCard}>
                  <LinearGradient
                    colors={player.rank <= 3 ? ['#263238', '#37474F'] : ['#1a1a1a', '#2a2a2a']}
                    style={styles.playerCardGradient}
                  >
                    <View style={[styles.rankBadge, { backgroundColor: getTrophyColor(player.rank) }]}>
                      <Text style={styles.rankText}>#{player.rank}</Text>
                    </View>
                    <Text style={styles.playerAvatar}>{player.avatar}</Text>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{player.username}</Text>
                      <Text style={styles.playerStats}>
                        {type === 'wins' 
                          ? `${player.totalWins} wins • ${player.winRate}% win rate`
                          : `${player.coins.toLocaleString()} coins • ${player.totalWins} wins`
                        }
                      </Text>
                    </View>
                    {player.rank <= 3 && (
                      <Ionicons
                        name="trophy"
                        size={28}
                        color={getTrophyColor(player.rank)}
                      />
                    )}
                  </LinearGradient>
                </View>
              ))}
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
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
  userRankContainer: {
    padding: 16,
    paddingTop: 0,
  },
  userRankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  userRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userRankName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userRankStats: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  typeContainer: {
    padding: 16,
    paddingTop: 0,
  },
  segmentedButtons: {
    backgroundColor: '#263238',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  leaderboardList: {
    padding: 16,
    gap: 12,
  },
  playerCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  playerCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerAvatar: {
    fontSize: 24,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerStats: {
    color: '#B0BEC5',
    fontSize: 13,
    marginTop: 2,
  },
});
