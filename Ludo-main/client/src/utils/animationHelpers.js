/**
 * Animation Helpers
 * Utilities for animating token movements
 */

import { Animated, Easing } from 'react-native';

/**
 * Animate token movement from one position to another
 * @param {Animated.ValueXY} animatedPosition - Animated position value
 * @param {Object} fromCoords - Starting coordinates {x, y}
 * @param {Object} toCoords - Ending coordinates {x, y}
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} Resolves when animation completes
 */
export function animateTokenMove(animatedPosition, fromCoords, toCoords, duration = 500) {
  return new Promise((resolve) => {
    // Set starting position
    animatedPosition.setValue(fromCoords);

    // Animate to ending position
    Animated.timing(animatedPosition, {
      toValue: toCoords,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // Position animations can't use native driver
    }).start(resolve);
  });
}

/**
 * Animate token capture (opponent token returning to yard)
 * @param {Animated.Value} scaleValue - Scale animation value
 * @param {Animated.Value} opacityValue - Opacity animation value
 * @returns {Promise} Resolves when animation completes
 */
export function animateTokenCapture(scaleValue, opacityValue) {
  return new Promise((resolve) => {
    Animated.parallel([
      // Shrink
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      // Fade out
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset for next use
      scaleValue.setValue(1);
      opacityValue.setValue(1);
      resolve();
    });
  });
}

/**
 * Animate token entering from yard
 * @param {Animated.Value} scaleValue - Scale animation value
 * @returns {Promise} Resolves when animation completes
 */
export function animateTokenEntry(scaleValue) {
  return new Promise((resolve) => {
    scaleValue.setValue(0);
    
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start(resolve);
  });
}

/**
 * Animate token reaching home
 * @param {Animated.Value} scaleValue - Scale animation value
 * @returns {Promise} Resolves when animation completes
 */
export function animateTokenHome(scaleValue) {
  return new Promise((resolve) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(resolve);
  });
}

/**
 * Pulse animation for selectable tokens
 * @param {Animated.Value} scaleValue - Scale animation value
 */
export function animateTokenPulse(scaleValue) {
  Animated.loop(
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start();
}

/**
 * Stop all animations on a value
 * @param {Animated.Value} animatedValue - Animated value to stop
 */
export function stopAnimation(animatedValue) {
  animatedValue.stopAnimation();
}

/**
 * Animate reconnect/sync - smoothly transition from old to new position
 * @param {Animated.ValueXY} animatedPosition - Animated position value
 * @param {Object} currentCoords - Current coordinates {x, y}
 * @param {Object} newCoords - New coordinates from server {x, y}
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} Resolves when animation completes
 */
export function animateReconnectSync(animatedPosition, currentCoords, newCoords, duration = 300) {
  // If positions are the same, no animation needed
  if (currentCoords.x === newCoords.x && currentCoords.y === newCoords.y) {
    return Promise.resolve();
  }

  return animateTokenMove(animatedPosition, currentCoords, newCoords, duration);
}

/**
 * Create animated position value
 * @param {Object} initialCoords - Initial coordinates {x, y}
 * @returns {Animated.ValueXY} Animated position value
 */
export function createAnimatedPosition(initialCoords = { x: 0, y: 0 }) {
  return new Animated.ValueXY(initialCoords);
}

/**
 * Create animated scale value
 * @param {number} initialValue - Initial scale value
 * @returns {Animated.Value} Animated scale value
 */
export function createAnimatedScale(initialValue = 1) {
  return new Animated.Value(initialValue);
}

/**
 * Create animated opacity value
 * @param {number} initialValue - Initial opacity value
 * @returns {Animated.Value} Animated opacity value
 */
export function createAnimatedOpacity(initialValue = 1) {
  return new Animated.Value(initialValue);
}

export default {
  animateTokenMove,
  animateTokenCapture,
  animateTokenEntry,
  animateTokenHome,
  animateTokenPulse,
  stopAnimation,
  animateReconnectSync,
  createAnimatedPosition,
  createAnimatedScale,
  createAnimatedOpacity,
};
