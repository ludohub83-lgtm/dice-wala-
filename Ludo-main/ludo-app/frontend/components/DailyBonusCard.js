import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCard from './AnimatedCard';
import DailyRewardPopup from './DailyRewardPopup';
import { getDailyRewardStatus, claimDailyReward } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DailyBonusCard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(5);

  useEffect(() => {
    loadStatus();
    // Refresh status every minute
    const interval = setInterval(loadStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        const data = await getDailyRewardStatus(userData.id);
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to load daily bonus status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!status?.canClaim || claiming) return;

    setClaiming(true);
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        const result = await claimDailyReward(userData.id);
        setClaimedAmount(result.reward);
        setShowReward(true);
        // Refresh status after claiming
        await loadStatus();
      }
    } catch (error) {
      console.error('Failed to claim daily bonus:', error);
      alert(error.response?.data?.message || 'Failed to claim daily bonus');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#FF9800" />
      </View>
    );
  }

  const canClaim = status?.canClaim;
  const hoursRemaining = status?.hoursRemaining || 0;
  const streak = status?.currentStreak || 0;

  return (
    <>
      <TouchableOpacity
        onPress={handleClaim}
        disabled={!canClaim || claiming}
        activeOpacity={canClaim ? 0.7 : 1}
      >
        <LinearGradient
          colors={canClaim ? ['#FF9800', '#F57C00'] : ['#263238', '#37474F']}
          style={styles.card}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={canClaim ? "gift" : "time"} 
                size={40} 
                color={canClaim ? "#FFF" : "#78909C"} 
              />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={[styles.title, !canClaim && styles.disabledText]}>
                Daily Bonus
              </Text>
              <Text style={[styles.subtitle, !canClaim && styles.disabledText]}>
                {canClaim ? 'Claim 5 free stars!' : `Next claim in ${hoursRemaining}h`}
              </Text>
              {streak > 0 && (
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={14} color="#FF9800" />
                  <Text style={styles.streakText}>{streak} day streak</Text>
                </View>
              )}
            </View>

            <View style={styles.rewardContainer}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={[styles.rewardText, !canClaim && styles.disabledText]}>
                +5
              </Text>
            </View>
          </View>

          {canClaim && !claiming && (
            <View style={styles.claimBadge}>
              <Text style={styles.claimText}>TAP TO CLAIM</Text>
            </View>
          )}

          {claiming && (
            <View style={styles.claimingBadge}>
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <DailyRewardPopup
        visible={showReward}
        onClose={() => setShowReward(false)}
        reward={claimedAmount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  disabledText: {
    color: '#78909C',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardContainer: {
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  claimBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'center',
  },
  claimText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  claimingBadge: {
    paddingVertical: 8,
    marginTop: 12,
    alignItems: 'center',
  },
});
