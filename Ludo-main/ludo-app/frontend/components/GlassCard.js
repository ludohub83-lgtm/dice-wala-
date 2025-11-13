import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

const GlassCard = ({ 
  children, 
  intensity = 80,
  tint = 'light', // light, dark, default
  style,
  borderColor = 'rgba(255, 255, 255, 0.3)',
  shadowColor = '#000'
}) => {
  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={intensity} tint={tint} style={styles.blur}>
          <View style={[styles.content, { borderColor }]}>
            {children}
          </View>
        </BlurView>
      ) : (
        // Android fallback with semi-transparent background
        <View
          style={[
            styles.androidFallback,
            {
              backgroundColor:
                tint === 'dark'
                  ? 'rgba(0, 0, 0, 0.7)'
                  : 'rgba(255, 255, 255, 0.7)',
              borderColor,
            },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  blur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  androidFallback: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    backdropFilter: 'blur(10px)',
  },
});

export default GlassCard;
