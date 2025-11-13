import React from 'react';
import { View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import Screen from '../components/Screen';

export default function HistoryDetailScreen({ route, navigation }) {
  const { roomId, fee, winner, me, ts } = route?.params || {};
  const won = winner && me ? (winner === me) : false;
  const dateStr = ts ? new Date(ts).toLocaleString() : '';

  return (
    <Screen style={{ backgroundColor:'#0b3b8a' }}>
      <Card mode="elevated" style={{ backgroundColor:'#103f96' }}>
        <Card.Content>
          <Text variant="headlineSmall" style={{ color:'#fff' }}>Match Details</Text>
          <View style={{ height:8 }} />
          <Text style={{ color:'#dbeafe' }}>Room: {roomId}</Text>
          <Text style={{ color:'#dbeafe' }}>Entry Fee: {fee} coins</Text>
          <Text style={{ color:'#dbeafe' }}>Result: {won ? 'Won' : 'Lost'}</Text>
          <Text style={{ color:'#dbeafe' }}>Winner: {winner}</Text>
          <Text style={{ color:'#dbeafe' }}>Date: {dateStr}</Text>
          <View style={{ height:12 }} />
          <Button mode="contained" onPress={() => navigation.navigate('Lobby')}>Play Again</Button>
        </Card.Content>
      </Card>
    </Screen>
  );
}
