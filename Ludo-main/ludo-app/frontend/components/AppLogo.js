import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';

export default function AppLogo({ size = 100, animated = true }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [animated]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          animated && {
            transform: [{ rotate }, { scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { width: size, height: size, borderRadius: size / 2 }]}
        >
          <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 100 100">
            {/* Ludo Board Shape */}
            <Path
              d="M 10 10 L 40 10 L 40 40 L 10 40 Z"
              fill="#FF6B6B"
              stroke="#FFF"
              strokeWidth="2"
            />
            <Path
              d="M 60 10 L 90 10 L 90 40 L 60 40 Z"
              fill="#4ECDC4"
              stroke="#FFF"
              strokeWidth="2"
            />
            <Path
              d="M 10 60 L 40 60 L 40 90 L 10 90 Z"
              fill="#FFA07A"
              stroke="#FFF"
              strokeWidth="2"
            />
            <Path
              d="M 60 60 L 90 60 L 90 90 L 60 90 Z"
              fill="#FFD700"
              stroke="#FFF"
              strokeWidth="2"
            />
            
            {/* Center Star */}
            <Polygon
              points="50,35 55,45 65,45 57,52 60,62 50,55 40,62 43,52 35,45 45,45"
              fill="#FFF"
              stroke="#FFD700"
              strokeWidth="1.5"
            />
            
            {/* Dice Dots */}
            <Circle cx="25" cy="25" r="3" fill="#FFF" />
            <Circle cx="75" cy="25" r="3" fill="#FFF" />
            <Circle cx="25" cy="75" r="3" fill="#FFF" />
            <Circle cx="75" cy="75" r="3" fill="#FFF" />
          </Svg>
        </LinearGradient>
      </Animated.View>
      
      {/* Glow Effect */}
      <View style={[styles.glow, { width: size * 1.2, height: size * 1.2, borderRadius: size * 0.6 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    zIndex: -1,
  },
});
