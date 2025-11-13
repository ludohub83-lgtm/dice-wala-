import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FloatingActionMenu = ({ 
  actions = [],
  mainIcon = '+',
  mainColors = ['#FF6B6B', '#FF8E53'],
  position = 'bottom-right' // bottom-right, bottom-left, top-right, top-left
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const positionStyles = {
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
  };

  return (
    <View style={[styles.container, positionStyles[position]]}>
      {/* Action buttons */}
      {actions.map((action, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(70 * (index + 1))],
        });

        const scale = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });

        const opacity = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.5, 1],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.actionButton,
              {
                transform: [{ translateY }, { scale }],
                opacity,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                action.onPress();
                toggleMenu();
              }}
              style={styles.actionTouchable}
            >
              <LinearGradient
                colors={action.colors || ['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </LinearGradient>
              
              {/* Label */}
              <View style={styles.labelContainer}>
                <Text style={styles.label}>{action.label}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main button */}
      <TouchableOpacity onPress={toggleMenu} activeOpacity={0.8}>
        <LinearGradient
          colors={mainColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainButton}
        >
          <Animated.Text
            style={[
              styles.mainIcon,
              {
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            {mainIcon}
          </Animated.Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Backdrop */}
      {isOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1000,
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButton: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  actionTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  actionIcon: {
    fontSize: 24,
    color: '#fff',
  },
  labelContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: -1,
  },
});

export default FloatingActionMenu;
