import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerEffect from './ShimmerEffect';

export const SkeletonCard = ({ width = '100%', height = 100 }) => (
  <View style={[styles.card, { width, height }]}>
    <ShimmerEffect width="100%" height="100%" />
  </View>
);

export const SkeletonList = ({ count = 3 }) => (
  <View style={styles.list}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} height={80} />
    ))}
  </View>
);

export const SkeletonProfile = () => (
  <View style={styles.profile}>
    <View style={styles.avatar}>
      <ShimmerEffect width={60} height={60} style={{ borderRadius: 30 }} />
    </View>
    <View style={styles.profileInfo}>
      <ShimmerEffect width="60%" height={20} style={{ marginBottom: 8 }} />
      <ShimmerEffect width="40%" height={16} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  list: {
    padding: 16,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  profileInfo: {
    flex: 1,
  },
});
