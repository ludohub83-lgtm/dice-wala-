import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCard from './AnimatedCard';
import { getLeaderboard } from '../services/api';

export default function LeaderboardCard({ navigation }) {
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard('wins', 5);
      setTopPlayers(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      // Fallback data
      setTopPlayers([
        { rank: 1, username: 'Player 1', totalWins: 15420, avatar: '🏆' },
        { rank: 2, username: 'Player 2', totalWins: 14850, avatar: '🥈' },
        { rank: 3, username: 'Player 3', totalWins: 13990, avatar: '🥉' },
        { rank: 4, username: 'Player 4', totalWins: 12500, avatar: '👤' },
        { rank: 5, username: 'Player 5', totalWins: 11200, avatar: '👤' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTrophyColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#78909C';
    }
  };

  return (
    <AnimatedCard
      colors={['#9C27B0', '#7B1FA2']}
      onPress={() => navigation.navigate('Event')}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <View>
            <Text style={styles.title}>Leaderboard</Text>
            <Text style={styles.subtitle}>Top Players This Week</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#FFF" />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      ) : (
        <View style={styles.leaderboard}>
          {topPlayers.map((player, index) => (
            <View key={player.rank} style={styles.playerRow}>
              <View style={styles.playerLeft}>
                <View style={[styles.rankBadge, { backgroundColor: getTrophyColor(player.rank) }]}>
                  <Text style={styles.rankText}>#{player.rank}</Text>
                </View>
                <Text style={styles.playerAvatar}>{player.avatar}</Text>
                <Text style={styles.playerName}>{player.username}</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Ionicons name="trophy" size={14} color="#FFD700" />
                <Text style={styles.scoreText}>{(player.totalWins || 0).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={styles.viewFullButton}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <Text style={styles.viewFullText}>View Full Leaderboard</Text>
      </TouchableOpacity>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  leaderboard: {
    gap: 8,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerAvatar: {
    fontSize: 20,
  },
  playerName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewFullButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignItems: 'center',
  },
  viewFullText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
