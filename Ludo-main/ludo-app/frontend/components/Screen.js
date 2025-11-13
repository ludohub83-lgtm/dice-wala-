import React from 'react';
import { View } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

export default function Screen({ children, style }) {
  const theme = useTheme();
  return (
    <View style={[{ flex:1, padding:16, backgroundColor: theme.colors.background }, style]}>
      {children}
      <View style={{ marginTop: 'auto', alignItems:'center', paddingTop:12 }}>
        <Text variant="labelSmall" style={{ opacity:0.65 }}>Made by Shera</Text>
      </View>
    </View>
  );
}
