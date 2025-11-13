import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function QuickStatsCard({ stats = {} }) {
  const {
    gamesPlayed = 0,
    gamesWon = 0,
    winRate = 0,
    totalEarnings = 0,
  } = stats;

  const statItems = [
    { label: 'Games', value: gamesPlayed, icon: 'game-controller', color: '#2196F3' },
    { label: 'Wins', value: gamesWon, icon: 'trophy', color: '#4CAF50' },
    { label: 'Win Rate', value: `${winRate}%`, icon: 'trending-up', color: '#FF9800' },
    { label: 'Earnings', value: `₹${totalEarnings}`, icon: 'cash', color: '#9C27B0' },
  ];

  return (
    <View style={styles.container}>
      {statItems.map((item, index) => (
        <View key={index} style={styles.statCard}>
          <LinearGradient
            colors={[item.color, item.color + 'CC']}
            style={styles.gradient}
          >
            <Ionicons name={item.icon} size={24} color="#FFF" />
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </LinearGradient>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  value: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
});
