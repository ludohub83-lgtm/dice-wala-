import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCard from './AnimatedCard';

export default function ReferralCard({ referralCode = 'LUDO123', earnedCoins = 0 }) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Ludo Hub with my referral code: ${referralCode}\n\nGet 100 bonus coins on signup!\n\nDownload now and start winning!`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <AnimatedCard
      colors={['#00BCD4', '#0097A7']}
      onPress={handleShare}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="gift" size={40} color="#FFD700" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Refer & Earn</Text>
          <Text style={styles.subtitle}>Invite friends, earn rewards!</Text>
        </View>
      </View>

      <View style={styles.codeContainer}>
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <Text style={styles.code}>{referralCode}</Text>
        </View>
        <TouchableOpacity style={styles.copyButton}>
          <Ionicons name="copy" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={20} color="#FFF" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Referred</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.statValue}>{earnedCoins}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.shareGradient}>
          <Ionicons name="share-social" size={20} color="#FFF" />
          <Text style={styles.shareText}>Share Now</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.footer}>
        💰 Earn 50 coins for each friend who joins!
      </Text>
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
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  codeBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
  },
  codeLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  code: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  copyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
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
  shareButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  shareText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
});
