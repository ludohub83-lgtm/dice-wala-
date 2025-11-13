import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HolographicCard = ({ children, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Subtle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        { transform: [{ rotateY: rotate }] }
      ]}
    >
      {/* Rainbow gradient border */}
      <LinearGradient
        colors={['#ff0080', '#ff8c00', '#40e0d0', '#9d00ff', '#ff0080']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        {/* Inner card */}
        <View style={styles.innerCard}>
          {/* Holographic shimmer effect */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                'transparent',
                'rgba(255, 255, 255, 0.3)',
                'rgba(255, 255, 255, 0.6)',
                'rgba(255, 255, 255, 0.3)',
                'transparent',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>

          {/* Content */}
          {children}
        </View>
      </LinearGradient>

      {/* Glow effect */}
      <View style={styles.glow} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  gradientBorder: {
    borderRadius: 24,
    padding: 3,
  },
  innerCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 21,
    padding: 20,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    width: width * 2,
    height: '100%',
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 0, 128, 0.2)',
    zIndex: -1,
  },
});

export default HolographicCard;
