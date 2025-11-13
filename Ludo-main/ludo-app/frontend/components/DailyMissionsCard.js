import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCard from './AnimatedCard';

export default function DailyMissionsCard({ navigation }) {
  const [missions, setMissions] = useState([
    { id: 1, title: 'Play 3 Games', progress: 1, target: 3, reward: 50, icon: 'game-controller', completed: false },
    { id: 2, title: 'Win 1 Game', progress: 0, target: 1, reward: 100, icon: 'trophy', completed: false },
    { id: 3, title: 'Roll a Six', progress: 2, target: 5, reward: 25, icon: 'dice', completed: false },
  ]);

  const completedCount = missions.filter(m => m.completed).length;
  const totalRewards = missions.reduce((sum, m) => sum + (m.completed ? m.reward : 0), 0);

  return (
    <AnimatedCard
      colors={['#FF6B6B', '#FF8E53']}
      onPress={() => navigation.navigate('Event')}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={24} color="#FFF" />
          <View>
            <Text style={styles.title}>Daily Missions</Text>
            <Text style={styles.subtitle}>{completedCount}/3 Completed</Text>
          </View>
        </View>
        <View style={styles.rewardBadge}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rewardText}>{totalRewards}</Text>
        </View>
      </View>

      <View style={styles.missions}>
        {missions.map((mission) => (
          <View key={mission.id} style={styles.missionItem}>
            <View style={styles.missionLeft}>
              <Ionicons name={mission.icon} size={20} color={mission.completed ? '#4CAF50' : '#FFF'} />
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionProgress}>
                  {mission.progress}/{mission.target}
                </Text>
              </View>
            </View>
            <View style={styles.missionReward}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.missionRewardText}>{mission.reward}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All Missions</Text>
        <Ionicons name="chevron-forward" size={16} color="#FFF" />
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
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  rewardText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  missions: {
    gap: 12,
  },
  missionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  missionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  missionProgress: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  missionReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  missionRewardText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  viewAllText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
