import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AnimatedBackground = ({ 
  children, 
  colors = ['#667eea', '#764ba2', '#f093fb'],
  animated = true 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height)).current,
      scale: useRef(new Animated.Value(Math.random() * 0.5 + 0.5)).current,
      opacity: useRef(new Animated.Value(Math.random() * 0.3 + 0.1)).current,
    }))
  ).current;

  useEffect(() => {
    if (animated) {
      // Gradient animation
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: false,
        })
      ).start();

      // Particle animations
      particles.forEach((particle, index) => {
        const duration = 15000 + Math.random() * 10000;
        const delay = index * 500;

        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(particle.y, {
                toValue: -100,
                duration: duration,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(particle.opacity, {
                  toValue: 0.4,
                  duration: duration / 2,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.opacity, {
                  toValue: 0.1,
                  duration: duration / 2,
                  useNativeDriver: true,
                }),
              ]),
            ]),
            Animated.timing(particle.y, {
              toValue: height + 100,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }
  }, [animated]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated particles */}
        {particles.map((particle) => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x,
                transform: [
                  { translateY: particle.y },
                  { scale: particle.scale },
                ],
                opacity: particle.opacity,
              },
            ]}
          />
        ))}

        {/* Overlay pattern */}
        <View style={styles.pattern} />

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
});

export default AnimatedBackground;
