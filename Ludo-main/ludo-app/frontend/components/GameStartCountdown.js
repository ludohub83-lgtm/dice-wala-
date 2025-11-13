import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function GameStartCountdown({ visible, onComplete }) {
  const [count, setCount] = useState(3);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      animateCount(3);
    }
  }, [visible]);

  const animateCount = (currentCount) => {
    if (currentCount === 0) {
      // Show "GO!" animation
      setCount('GO!');
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 2,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onComplete?.();
          });
        }, 500);
      });
      return;
    }

    setCount(currentCount);
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    rotateAnim.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.5,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        animateCount(currentCount - 1);
      }, 700);
    });
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }, { rotate }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.circle}>
            <Text style={styles.countText}>{count}</Text>
          </View>
          {count !== 'GO!' && (
            <Text style={styles.subtitle}>Get Ready!</Text>
          )}
        </Animated.View>

        {/* Animated rings */}
        <Animated.View
          style={[
            styles.ring,
            styles.ring1,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1.5],
                    outputRange: [1, 2],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring2,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.2],
              }),
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1.5],
                    outputRange: [1, 2.5],
                  }),
                },
              ],
            },
          ]}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    borderWidth: 5,
    borderColor: '#FFF',
  },
  countText: {
    color: '#FFF',
    fontSize: 80,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    letterSpacing: 2,
  },
  ring: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  ring1: {
    width: 250,
    height: 250,
  },
  ring2: {
    width: 300,
    height: 300,
  },
});
