import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LiquidButton = ({ 
  title, 
  onPress, 
  colors = ['#00d2ff', '#3a7bd5'],
  icon,
  style 
}) => {
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Wave animations with different speeds
    Animated.loop(
      Animated.timing(waveAnim1, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(waveAnim2, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(waveAnim3, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const wave1TranslateY = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const wave2TranslateY = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const wave3TranslateY = waveAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          {/* Liquid wave layers */}
          <Animated.View
            style={[
              styles.wave,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: [{ translateY: wave1TranslateY }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                transform: [{ translateY: wave2TranslateY }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                transform: [{ translateY: wave3TranslateY }],
              },
            ]}
          />

          {/* Content */}
          <View style={styles.content}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={styles.text}>{title}</Text>
          </View>

          {/* Bubble effects */}
          {[...Array(5)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                {
                  left: `${20 + i * 15}%`,
                  bottom: `${10 + Math.random() * 20}%`,
                  width: 4 + Math.random() * 6,
                  height: 4 + Math.random() * 6,
                },
              ]}
            />
          ))}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    borderRadius: 30,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 50,
  },
});

export default LiquidButton;
