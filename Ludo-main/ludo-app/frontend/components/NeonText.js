import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';

const NeonText = ({ 
  children, 
  color = '#00ffff',
  glowColor = '#00ffff',
  size = 24,
  style,
  animated = true 
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [animated]);

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          color: color,
          fontSize: size,
          textShadowColor: glowColor,
          textShadowRadius: 20,
          shadowOpacity: shadowOpacity,
        },
        style,
      ]}
    >
      {children}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
  },
});

export default NeonText;
