import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptic feedback hook
export const useHapticFeedback = () => {
  const isAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

  const light = async () => {
    if (isAvailable) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  };

  const medium = async () => {
    if (isAvailable) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  };

  const heavy = async () => {
    if (isAvailable) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  };

  const success = async () => {
    if (isAvailable) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  };

  const warning = async () => {
    if (isAvailable) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  };

  const error = async () => {
    if (isAvailable) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  };

  const selection = async () => {
    if (isAvailable) {
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  };

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    isAvailable,
  };
};

export default useHapticFeedback;
