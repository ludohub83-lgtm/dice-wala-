/**
 * Game Animations Utility
 * Reusable animations for game elements
 */

import { Animated, Easing } from 'react-native';

/**
 * Dice roll animation
 */
export function animateDiceRoll(animatedValue, onComplete) {
  Animated.sequence([
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: 5 }
    ),
    Animated.spring(animatedValue, {
      toValue: 0,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }),
  ]).start(onComplete);
}

/**
 * Token movement animation
 */
export function animateTokenMove(animatedValue, fromPos, toPos, duration = 500) {
  return new Promise((resolve) => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(resolve);
  });
}

/**
 * Token capture animation
 */
export function animateCapture(scaleValue, opacityValue) {
  return new Promise((resolve) => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(resolve);
  });
}

/**
 * Win celebration animation
 */
export function animateWin(animatedValue) {
  Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start();
}

/**
 * Pulse animation for valid moves
 */
export function animatePulse(animatedValue) {
  Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start();
}

/**
 * Shake animation for invalid move
 */
export function animateShake(animatedValue) {
  Animated.sequence([
    Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]).start();
}

/**
 * Fade in animation
 */
export function animateFadeIn(animatedValue, duration = 300) {
  Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  }).start();
}

/**
 * Fade out animation
 */
export function animateFadeOut(animatedValue, duration = 300) {
  return new Promise((resolve) => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start(resolve);
  });
}

/**
 * Bounce animation
 */
export function animateBounce(animatedValue) {
  Animated.spring(animatedValue, {
    toValue: 1,
    friction: 2,
    tension: 40,
    useNativeDriver: true,
  }).start();
}

export default {
  animateDiceRoll,
  animateTokenMove,
  animateCapture,
  animateWin,
  animatePulse,
  animateShake,
  animateFadeIn,
  animateFadeOut,
  animateBounce,
};
