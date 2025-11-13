import React from 'react';
import { View, Text, Button } from 'react-native';

export default function CloneHome({ navigation }) {
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ fontSize:24, fontWeight:'bold', marginBottom:16 }}>Ludo Clone Home</Text>
      <Button title="Go to Clone Lobby" onPress={() => navigation.navigate('CloneLobby')} />
      <View style={{ height:12 }} />
      <Button title="Start Clone Match" onPress={() => navigation.navigate('CloneMatch')} />
    </View>
  );
}
