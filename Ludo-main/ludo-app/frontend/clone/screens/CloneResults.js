import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getUserStats } from '../services/matchService';

export default function CloneResults({ route, navigation, user }) {
  const winner = route?.params?.winner ?? null;
  const matchId = route?.params?.matchId ?? null;
  const turns = route?.params?.turns ?? null;
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) return;
      const s = await getUserStats(user.id);
      if (mounted) setStats(s);
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
      <Text style={{ fontSize:24, fontWeight:'800', marginBottom:8 }}>Match Results</Text>
      {matchId && (
        <Text style={{ color:'#6b7280', marginBottom:8 }}>Match: {String(matchId).slice(0,8)}…</Text>
      )}
      {turns != null && (
        <Text style={{ color:'#6b7280', marginBottom:16 }}>Turns: {turns}</Text>
      )}
      {winner != null && (
        <Text style={{ fontSize:18, fontWeight:'700', marginBottom:16 }}>Winner: Player {winner + 1}</Text>
      )}
      {user?.id && (
        <View style={{ marginBottom:16, padding:12, borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, backgroundColor:'#fff', minWidth:240 }}>
          <Text style={{ fontWeight:'700', marginBottom:6 }}>My Stats</Text>
          <Text style={{ color:'#374151' }}>Wins: {stats?.wins ?? 0}</Text>
          <Text style={{ color:'#374151' }}>Fastest win: {stats?.fastest_win_s ? `${stats.fastest_win_s}s` : '-'}</Text>
        </View>
      )}
      <View style={{ flexDirection:'row', gap:12 }}>
        <Button title="Back to Lobby" onPress={() => navigation.navigate('CloneLobby')} />
        <Button title="Play Again" onPress={() => navigation.navigate('CloneMatch', { mode: 'pass_and_play' })} />
      </View>
    </View>
  );
}
