import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedCounter = ({ 
  value, 
  duration = 1000,
  prefix = '',
  suffix = '',
  style,
  textStyle,
  colors = ['#FFD700', '#FFA500'],
  size = 32,
  showGlow = true
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate to new value
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: value,
        duration: duration,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Glow animation
    if (showGlow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [value]);

  const displayValue = animatedValue.interpolate({
    inputRange: [0, value],
    outputRange: [0, value],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={[styles.container, style]}>
      {showGlow && (
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
              backgroundColor: colors[0],
            },
          ]}
        />
      )}

      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Animated.Text
            style={[
              styles.text,
              {
                fontSize: size,
              },
              textStyle,
            ]}
          >
            {prefix}
            {displayValue.__getValue().toFixed(0).toLocaleString()}
            {suffix}
          </Animated.Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 20,
  },
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default AnimatedCounter;
