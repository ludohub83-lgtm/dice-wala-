import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PulsingCoinIcon = ({ size = 60, value, style }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 0.75,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Coin */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }, { rotate }],
        }}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.coin,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          {/* Inner shine */}
          <View
            style={[
              styles.innerShine,
              {
                width: size * 0.6,
                height: size * 0.6,
                borderRadius: size * 0.3,
              },
            ]}
          />

          {/* Currency symbol */}
          <Animated.Text
            style={[
              styles.symbol,
              {
                fontSize: size * 0.5,
              },
            ]}
          >
            ₹
          </Animated.Text>
        </LinearGradient>
      </Animated.View>

      {/* Sparkles */}
      {[0, 1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.sparkle,
            {
              top: i === 0 ? 0 : i === 2 ? size : size / 2,
              left: i === 1 ? size : i === 3 ? 0 : size / 2,
              opacity: glowOpacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerGlow: {
    position: 'absolute',
    backgroundColor: '#FFD700',
  },
  coin: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#FFA500',
  },
  innerShine: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  symbol: {
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
});

export default PulsingCoinIcon;
