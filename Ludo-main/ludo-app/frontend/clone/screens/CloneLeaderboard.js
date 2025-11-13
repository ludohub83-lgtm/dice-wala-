import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Button } from 'react-native';
import { supabase } from '../../services/supabase';

export default function CloneLeaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [range, setRange] = useState('all'); // 'all' | '7d'

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, status, result, created_at, match_players(seat, display_name)')
        .eq('status', 'finished')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      const cutoff = range === '7d' ? (Date.now() - 7 * 24 * 60 * 60 * 1000) : 0;
      const wins = new Map();
      for (const m of data || []) {
        if (cutoff) {
          const t = new Date(m.created_at).getTime();
          if (isFinite(t) && t < cutoff) continue;
        }
        const winnerSeat = typeof m?.result?.winner === 'number' ? m.result.winner + 1 : null;
        if (!winnerSeat) continue;
        const mp = Array.isArray(m?.match_players) ? m.match_players : [];
        const winnerRow = mp.find((p) => p.seat === winnerSeat);
        const name = winnerRow?.display_name || `Player ${winnerSeat}`;
        wins.set(name, (wins.get(name) || 0) + 1);
      }
      const list = Array.from(wins.entries())
        .map(([name, winCount]) => ({ name, winCount }))
        .sort((a, b) => b.winCount - a.winCount)
        .slice(0, 50);
      setRows(list);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [range]);

  return (
    <View style={{ flex:1 }}>
      <View style={{ alignItems:'center', paddingVertical:16 }}>
        <Text style={{ fontSize:22, fontWeight:'800' }}>Leaderboard</Text>
        <Text style={{ color:'#6b7280' }}>Top winners ({range === '7d' ? 'last 7 days' : 'all time'})</Text>
        <View style={{ marginTop:8, flexDirection:'row', gap:8 }}>
          <Button title="All-time" onPress={() => setRange('all')} />
          <Button title="7 days" onPress={() => setRange('7d')} />
        </View>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        {rows.length === 0 ? (
          <Text style={{ color:'#6b7280', textAlign:'center' }}>No results yet.</Text>
        ) : (
          rows.map((r, idx) => (
            <View key={`${r.name}-${idx}`} style={{ marginHorizontal:16, marginBottom:8, padding:12, borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, backgroundColor:'#fff', flexDirection:'row', justifyContent:'space-between' }}>
              <Text style={{ fontWeight:'700' }}>{idx + 1}. {r.name}</Text>
              <Text style={{ color:'#374151' }}>{r.winCount} wins</Text>
            </View>
          ))
        )}
        <View style={{ height:24 }} />
      </ScrollView>
    </View>
  );
}
