import { supabase } from '../../services/supabase';

// --- App config (admin controlled) ---
export async function getAppConfig() {
  const { data, error } = await supabase
    .from('app_config')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) return { ai_difficulty: 'normal', entry_fee_coin: 0, daily_bonus_coin: 0, bot_fill_ratio: 0 };
  return data || { ai_difficulty: 'normal', entry_fee_coin: 0, daily_bonus_coin: 0, bot_fill_ratio: 0 };
}

// Prefer RPCs for atomicity when available on the backend
export async function updateCoinsRPC({ userId, delta }) {
  if (!userId || !Number.isFinite(delta)) return { ok: false };
  const { data, error } = await supabase.rpc('rpc_update_coins', { p_user_id: userId, p_delta: Math.trunc(delta) });
  if (error) return { ok: false, error };
  return { ok: true, balance: data };
}

export async function claimDailyBonusRPC({ userId }) {
  if (!userId) return { ok: false };
  const { data, error } = await supabase.rpc('rpc_claim_daily_bonus', { p_user_id: userId });
  if (error) return { ok: false, error };
  return { ok: true, amount: data?.amount, balance: data?.balance };
}

// --- Virtual coins ---
export async function getCoinsBalance(userId) {
  if (!userId) return 0;
  const { data, error } = await supabase
    .from('coins_balances')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return 0;
  return data?.balance ?? 0;
}

export async function addCoins({ userId, delta }) {
  if (!userId || !Number.isFinite(delta)) return 0;
  // Read current balance
  const { data: ex } = await supabase.from('coins_balances').select('balance').eq('user_id', userId).maybeSingle();
  if (!ex) {
    const { data } = await supabase
      .from('coins_balances')
      .insert({ user_id: userId, balance: Math.max(0, Math.floor(delta)) })
      .select()
      .single();
    return data?.balance ?? Math.max(0, Math.floor(delta));
  } else {
    const newBal = Math.max(0, Math.floor((ex.balance || 0) + delta));
    const { data } = await supabase
      .from('coins_balances')
      .update({ balance: newBal })
      .eq('user_id', userId)
      .select()
      .single();
    return data?.balance ?? newBal;
  }
}

export async function spendCoins({ userId, amount }) {
  if (!userId || !Number.isFinite(amount) || amount <= 0) return { ok: false, balance: 0 };
  // Read current balance then decrement if sufficient
  const { data: ex } = await supabase.from('coins_balances').select('balance').eq('user_id', userId).maybeSingle();
  const bal = ex?.balance ?? 0;
  if (bal < amount) return { ok: false, balance: bal };
  const newBal = bal - amount;
  const { data } = await supabase
    .from('coins_balances')
    .update({ balance: newBal })
    .eq('user_id', userId)
    .select()
    .single();
  return { ok: true, balance: data?.balance ?? newBal };
}

export async function createMatch({ creatorId, playersCount = 2, mode = 'pass_and_play', metadata = {} }) {
  const { data, error } = await supabase
    .from('matches')
    .insert([{ creator_id: creatorId || null, status: 'open', players_count: playersCount, mode, metadata }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserStats(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function upsertUserStats({ userId, displayName, winsDelta = 0, capturesDelta = 0, fastestWinS = null }) {
  if (!userId) return null;
  // Try to update existing row; if none, insert
  // Update: increment wins/captures, optionally set fastest if better or null
  const { data: existing } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!existing) {
    const { data, error } = await supabase
      .from('user_stats')
      .upsert([{ user_id: userId, display_name: displayName || null, wins: winsDelta, captures: capturesDelta, fastest_win_s: fastestWinS }], { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const payload = {
      wins: (existing.wins || 0) + winsDelta,
      captures: (existing.captures || 0) + capturesDelta,
      display_name: displayName || existing.display_name || null,
    };
    if (typeof fastestWinS === 'number') {
      const prev = existing.fastest_win_s;
      if (prev == null || fastestWinS < prev) payload.fastest_win_s = fastestWinS;
    }
    const { data, error } = await supabase
      .from('user_stats')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export function subscribePlayers(matchId, onChange) {
  const channel = supabase
    .channel(`players_${matchId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'match_players', filter: `match_id=eq.${matchId}` }, (payload) => {
      onChange?.(payload);
    })
    .subscribe();
  return () => {
    try { supabase.removeChannel(channel); } catch {}
  };
}

export function subscribeOpenMatches(onChange) {
  const channel = supabase
    .channel('matches_open')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, async (payload) => {
      try {
        // Re-fetch open online matches on any change
        const rows = await listOpenMatches({ limit: 30 });
        onChange?.(rows);
      } catch {}
    })
    .subscribe();
  return () => {
    try { supabase.removeChannel(channel); } catch {}
  };
}

export async function joinMatch({ matchId, playerId, seat = null, displayName = null }) {
  const { data, error } = await supabase
    .from('match_players')
    .insert([{ match_id: matchId, player_id: playerId || null, seat, display_name: displayName }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMatch(matchId) {
  const { data, error } = await supabase
    .from('matches')
    .select('*, match_players(*), match_turns(*)')
    .eq('id', matchId)
    .single();
  if (error) throw error;
  return data;
}

export async function listOpenMatches({ limit = 20 } = {}) {
  const { data, error } = await supabase
    .from('matches')
    .select('id, status, players_count, mode, created_at, match_players(count)')
    .eq('status', 'open')
    .eq('mode', 'online')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function postTurn({ matchId, seq, playerId, roll, move, state }) {
  const { data, error } = await supabase
    .from('match_turns')
    .insert([{ match_id: matchId, seq, player_id: playerId || null, roll, move, state }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function postTurnIdempotent({ matchId, seq, playerId, roll, move, state }) {
  const { data, error } = await supabase
    .from('match_turns')
    .upsert([{ match_id: matchId, seq, player_id: playerId || '00000000-0000-0000-0000-000000000000', roll, move, state }], { onConflict: 'match_id,seq' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeTurns(matchId, onInsert) {
  const channel = supabase
    .channel(`turns_${matchId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_turns', filter: `match_id=eq.${matchId}` }, (payload) => {
      onInsert?.(payload.new);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function setMatchStatus({ matchId, status }) {
  const { data, error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', matchId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function finishMatch({ matchId, winnerPlayerId, result = {} }) {
  const { data, error } = await supabase
    .from('matches')
    .update({ status: 'finished', winner_player_id: winnerPlayerId || null, result })
    .eq('id', matchId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMatchMetadata({ matchId, patch }) {
  const { data, error } = await supabase
    .from('matches')
    .update({ metadata: patch })
    .eq('id', matchId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeMatch(matchId, onChange) {
  const channel = supabase
    .channel(`match_${matchId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, (payload) => {
      onChange?.(payload?.new);
    })
    .subscribe();
  return () => {
    try { supabase.removeChannel(channel); } catch {}
  };
}
