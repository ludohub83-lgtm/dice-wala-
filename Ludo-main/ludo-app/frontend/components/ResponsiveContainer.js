import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
const BREAKPOINTS = {
  small: 320,
  medium: 375,
  large: 414,
  tablet: 768,
};

export const useResponsive = () => {
  const isSmallDevice = width < BREAKPOINTS.medium;
  const isMediumDevice = width >= BREAKPOINTS.medium && width < BREAKPOINTS.large;
  const isLargeDevice = width >= BREAKPOINTS.large && width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet;
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  const scale = (size) => {
    const baseWidth = 375; // iPhone X width
    return (width / baseWidth) * size;
  };

  const verticalScale = (size) => {
    const baseHeight = 812; // iPhone X height
    return (height / baseHeight) * size;
  };

  const moderateScale = (size, factor = 0.5) => {
    return size + (scale(size) - size) * factor;
  };

  return {
    width,
    height,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    isIOS,
    isAndroid,
    scale,
    verticalScale,
    moderateScale,
  };
};

export default function ResponsiveContainer({ children, style }) {
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: isTablet ? 40 : 0,
          paddingRight: isTablet ? 40 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
