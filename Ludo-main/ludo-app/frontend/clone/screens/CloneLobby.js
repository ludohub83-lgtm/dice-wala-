  const recentOpenMatches = useMemo(() => {
    const cutoff = Date.now() - 30 * 60 * 1000; // 30 minutes
    return (openMatches || []).filter((m) => {
      const t = new Date(m.created_at).getTime();
      return isFinite(t) && t >= cutoff;
    });
  }, [openMatches]);
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Button, Alert, ScrollView, RefreshControl, TextInput } from 'react-native';
import { createMatch, joinMatch, listOpenMatches, subscribeOpenMatches, getUserStats, getMatch, getAppConfig, getCoinsBalance, claimDailyBonusRPC } from '../services/matchService';

export default function CloneLobby({ navigation, user }) {
  const [openMatches, setOpenMatches] = useState([]);
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [myStats, setMyStats] = useState(null);
  const [appConfig, setAppConfig] = useState({ ai_difficulty: 'normal', entry_fee_coin: 0, daily_bonus_coin: 0, bot_fill_ratio: 0 });
  const [coins, setCoins] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await listOpenMatches({ limit: 30 });
      setOpenMatches(rows);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    const unsub = subscribeOpenMatches((rows) => setOpenMatches(rows));
    return () => { clearInterval(id); try { unsub(); } catch {} };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) { setMyStats(null); return; }
      const s = await getUserStats(user.id);
      if (mounted) setMyStats(s);
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  // Load config and wallet
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cfg = await getAppConfig();
        const bal = await getCoinsBalance(user?.id);
        if (mounted) { setAppConfig(cfg || {}); setCoins(bal || 0); }
      } catch {}
    })();
    const t = setInterval(async () => {
      try { const bal = await getCoinsBalance(user?.id); setCoins(bal || 0); } catch {}
    }, 10000);
    return () => { mounted = false; clearInterval(t); };
  }, [user?.id]);

  return (
    <View style={{ flex:1 }}>
      <View style={{ alignItems:'center', paddingTop:16 }}>
        <View style={{ width:'100%', paddingHorizontal:16, flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <Text style={{ fontSize:24, fontWeight:'bold' }}>Clone Lobby</Text>
          <Button title="Leaderboard" onPress={() => navigation.navigate('CloneLeaderboard')} />
        </View>
        {user?.id && (
          <View style={{ width:'100%', paddingHorizontal:16, marginBottom:8 }}>
            <View style={{ padding:12, borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, backgroundColor:'#fff', alignSelf:'center', minWidth:280 }}>
              <Text style={{ fontWeight:'700', marginBottom:4 }}>My Stats</Text>
              <Text style={{ color:'#374151' }}>Wins: {myStats?.wins ?? 0}</Text>
              <Text style={{ color:'#374151' }}>Fastest win: {myStats?.fastest_win_s ? `${myStats.fastest_win_s}s` : '-'}</Text>
              <View style={{ height:6 }} />
              <Text style={{ fontWeight:'700', marginBottom:4 }}>Wallet</Text>
              <Text style={{ color:'#111827' }}>Coins: {coins}</Text>
              <Text style={{ color:'#6b7280', marginTop:4, fontSize:12 }}>Entry fee (bot match): {appConfig?.entry_fee_coin ?? 0}</Text>
              <View style={{ height:8 }} />
              <Button title={`Claim Daily Bonus (+${appConfig?.daily_bonus_coin ?? 0})`} onPress={async () => {
                try {
                  if (!user?.id) return;
                  const res = await claimDailyBonusRPC({ userId: user.id });
                  if (res?.ok) {
                    setCoins((res.balance ?? (coins + (appConfig?.daily_bonus_coin || 0))));
                    Alert.alert('Bonus claimed', `+${res?.amount ?? appConfig?.daily_bonus_coin ?? 0} coins added`);
                  } else {
                    Alert.alert('Bonus', res?.error?.message || 'Already claimed today or unavailable');
                  }
                } catch (e) {
                  Alert.alert('Bonus', e.message || 'Failed to claim');
                }
              }} />
            </View>
          </View>
        )}
        <View style={{ gap:8, width:280 }}>
          <Text style={{ fontWeight:'600' }}>Your name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter display name"
            autoCapitalize="words"
            style={{ height:40, borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, paddingHorizontal:10, backgroundColor:'#fff', marginBottom:4 }}
          />
          <Button title={`Quick Match vs Bot (2P) — Fee ${appConfig?.entry_fee_coin ?? 0}`} onPress={() => {
            const fee = Number(appConfig?.entry_fee_coin || 0);
            if ((coins || 0) < fee) { Alert.alert('Not enough coins', `You need ${fee} coins to play.`); return; }
            navigation.navigate('CloneMatch', { mode: 'pass_and_play', players: 2, bot: true, aiDifficulty: appConfig?.ai_difficulty || 'normal', entryFee: fee });
          }} />
          <Button title="Create Local Match (2P)" onPress={() => navigation.navigate('CloneMatch', { mode: 'pass_and_play' })} />
          <Button title="Create Local Team Match (2v2)" onPress={() => navigation.navigate('CloneMatch', { mode: 'pass_and_play', players: 4, teams: true })} />
          <Button
            title="Create Online Match (2P)"
            onPress={async () => {
              try {
                const match = await createMatch({ creatorId: user?.id || null, playersCount: 2, mode: 'online' });
                await joinMatch({ matchId: match.id, playerId: user?.id || null, seat: 1, displayName: displayName || 'Player 1' });
                navigation.navigate('CloneMatch', { mode: 'online', matchId: match.id, seat: 1 });
              } catch (e) {
                Alert.alert('Error', e.message || 'Failed to create online match');
              }
            }}
          />
          <Button
            title="Create Online Team Match (2v2)"
            onPress={async () => {
              try {
                const match = await createMatch({ creatorId: user?.id || null, playersCount: 4, mode: 'online', metadata: { teams: true } });
                await joinMatch({ matchId: match.id, playerId: user?.id || null, seat: 1, displayName: displayName || 'Player 1' });
                navigation.navigate('CloneMatch', { mode: 'online', matchId: match.id, seat: 1, players: 4, teams: true });
              } catch (e) {
                Alert.alert('Error', e.message || 'Failed to create online team match');
              }
            }}
          />
        </View>
        <View style={{ height:12 }} />
        <View style={{ width:280 }}>
          <Text style={{ fontWeight:'600', marginBottom:6 }}>Join by Code</Text>
          <View style={{ flexDirection:'row', gap:8, alignItems:'center' }}>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Paste match code"
              autoCapitalize="none"
              autoCorrect={false}
              style={{ flex:1, height:40, borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, paddingHorizontal:10, backgroundColor:'#fff' }}
            />
            <Button title="Join" onPress={async () => {
              if (!code) return;
              try {
                await joinMatch({ matchId: code.trim(), playerId: user?.id || null, seat: 2, displayName: displayName || 'Player 2' });
                navigation.navigate('CloneMatch', { mode: 'online', matchId: code.trim(), seat: 2 });
              } catch (e) {
                Alert.alert('Error', e.message || 'Failed to join match');
              }
            }} />
          </View>
        </View>
      </View>
      <View style={{ height:16 }} />
      <View style={{ flex:1 }}>
        <Text style={{ fontSize:16, fontWeight:'600', marginLeft:16, marginBottom:8 }}>
          Open Online Matches (recent {recentOpenMatches.length})
        </Text>
        <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
          {recentOpenMatches.length === 0 ? (
            <Text style={{ color:'#6b7280', marginLeft:16 }}>No open matches. Create one above.</Text>
          ) : (
            recentOpenMatches.map((m) => (
              <View key={m.id} style={{ marginHorizontal:16, marginBottom:8, padding:12, borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, backgroundColor:'#fff' }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                  <View>
                    <Text style={{ fontWeight:'600' }}>{m.id.slice(0, 8)}...</Text>
                    <Text style={{ color:'#6b7280', fontSize:12 }}>{new Date(m.created_at).toLocaleString()}</Text>
                  </View>
                  <View style={{ flexDirection:'row', gap:8, alignItems:'center' }}>
                    <View style={{ paddingHorizontal:8, paddingVertical:4, borderRadius:12, backgroundColor:'#f3f4f6' }}>
                      <Text style={{ color:'#374151', fontSize:12 }}>
                        {Array.isArray(m.match_players) && m.match_players[0]?.count >= 2 ? 'P2 joined' : 'Waiting P2'}
                      </Text>
                    </View>
                    <Button
                      title="Copy"
                      onPress={() => {
                        try {
                          const code = String(m.id);
                          if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(code);
                            Alert.alert('Copied', 'Match code copied to clipboard');
                          } else {
                            Alert.alert('Match code', code);
                          }
                        } catch {
                          Alert.alert('Match code', String(m.id));
                        }
                      }}
                    />
                    <Button
                      title="Join as P2"
                      disabled={Array.isArray(m.match_players) && m.match_players[0]?.count >= 2}
                      onPress={async () => {
                        try {
                          await joinMatch({ matchId: m.id, playerId: user?.id || null, seat: 2, displayName: displayName || 'Player 2' });
                          navigation.navigate('CloneMatch', { mode: 'online', matchId: m.id, seat: 2, players: (m.players_count || 2), teams: !!m?.metadata?.teams });
                        } catch (e) {
                          Alert.alert('Error', e.message || 'Failed to join match');
                        }
                      }}
                    />
                    <Button
                      title="Join next"
                      onPress={async () => {
                        try {
                          const full = await getMatch(m.id);
                          const taken = new Set((full?.match_players || []).map(p => p.seat));
                          let seatToUse = 2;
                          for (const s of [2,3,4]) { if (!taken.has(s)) { seatToUse = s; break; } }
                          await joinMatch({ matchId: m.id, playerId: user?.id || null, seat: seatToUse, displayName: displayName || `Player ${seatToUse}` });
                          navigation.navigate('CloneMatch', { mode: 'online', matchId: m.id, seat: seatToUse, players: (full?.players_count || 2), teams: !!full?.metadata?.teams });
                        } catch (e) {
                          Alert.alert('Error', e.message || 'Failed to join next seat');
                        }
                      }}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height:24 }} />
        </ScrollView>
      </View>
    </View>
  );
}
