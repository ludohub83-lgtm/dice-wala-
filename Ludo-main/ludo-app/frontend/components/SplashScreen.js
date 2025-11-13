import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AppLogo from './AppLogo';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish?.();
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a4d8f', '#0d2847', '#1a4d8f']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <AppLogo size={150} animated={true} />
          
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }}
          >
            <Text style={styles.title}>LUDO HUB</Text>
            <Text style={styles.subtitle}>Play • Win • Enjoy</Text>
          </Animated.View>
        </Animated.View>

        {/* Made by Shera */}
        <Animated.View
          style={[
            styles.footer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.madeBy}>Made by Shera ❤</Text>
        </Animated.View>

        {/* Animated Circles */}
        <Animated.View
          style={[
            styles.circle,
            styles.circle1,
            { opacity: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.1] }) },
          ]}
        />
        <Animated.View
          style={[
            styles.circle,
            styles.circle2,
            { opacity: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.1] }) },
          ]}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 30,
  },
  title: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#FFD700',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.5,
    left: -width * 0.25,
  },
  circle2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.4,
    right: -width * 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  madeBy: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});
