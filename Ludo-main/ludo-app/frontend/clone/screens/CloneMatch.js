import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Button, Dimensions } from 'react-native';
import Board from '../components/Board';
import Token from '../components/Token';
import Dice from '../components/Dice';
import { initialState, moveToken, anyMovesAvailable, movableTokens, playerWon, indexToXY, TRACK_LENGTH, rollDice } from '../utils/gameLogic';
import { chooseMove } from '../utils/ai';
import { postTurn, postTurnIdempotent, subscribeTurns, setMatchStatus, finishMatch, subscribePlayers, createMatch, joinMatch, getMatch, subscribeMatch, updateMatchMetadata, upsertUserStats, spendCoins, addCoins } from '../services/matchService';
import { Alert } from 'react-native';

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'];
const TOKEN_IMAGES = [
  require('../assets/redpiece.png'),
  require('../assets/greenpiece.png'),
  require('../assets/bluepiece.png'),
  require('../assets/yellowpiece.png'),
];

export default function CloneMatch({ route, navigation, user }) {
  const { width, height } = Dimensions.get('window');
  const shortest = Math.min(width, height);
  const boardSize = Math.max(260, Math.floor(shortest * 0.9));
  const mode = route?.params?.mode || 'pass_and_play';
  const matchId = route?.params?.matchId || null;
  const seat = route?.params?.seat || 1; // 1-based seat index if provided
  const playersParam = route?.params?.players || 2;
  const teams = !!route?.params?.teams; // local 2v2
  const isOnline = mode === 'online' && matchId;
  const botSeat = 2;
  const isBotMatch = !isOnline && (route?.params?.bot === true);
  const aiDifficulty = route?.params?.aiDifficulty || 'normal';
  const entryFee = Number(route?.params?.entryFee || 0);
  const [state, setState] = useState(() => initialState(playersParam, 2));
  const [pendingRoll, setPendingRoll] = useState(null); // number | null
  const [lastRoll, setLastRoll] = useState(null);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  const seqRef = useRef(0);
  const unsubRef = useRef(null);
  const [capturePos, setCapturePos] = useState(null); // linear index for flash overlay
  const finishedRef = useRef(false);
  const [shake, setShake] = useState({ p: -1, t: -1, tick: 0 });
  const [isRolling, setIsRolling] = useState(false);
  const [matchMeta, setMatchMeta] = useState({});
  const [playerNames, setPlayerNames] = useState(() => ['Player 1', isBotMatch ? 'Bot' : 'Player 2']);
  const startTimeRef = useRef(Date.now());
  const current = state.current;
  const playerColor = COLORS[current % COLORS.length];
  const isBothReady = !isOnline || ((matchMeta?.ready_p1 === true) && (matchMeta?.ready_p2 === true));
  const myReady = !isOnline || ((seat === 1 && matchMeta?.ready_p1 === true) || (seat === 2 && matchMeta?.ready_p2 === true));
  const waitingForOpponent = isOnline && seat === 1 && seqRef.current === 0 && lastRoll == null;
  const isMyTurn = !isOnline || ((seat - 1) === current);

  const onRolled = (roll) => {
    if (isOnline && !isMyTurn) return;
    if (isRolling) return;
    setIsRolling(true);
    setLastRoll(roll);
    // handle six rules: extra turn and three-sixes penalty
    if (roll === 6) {
      if (consecutiveSixes === 2) {
        // third six: forfeit turn, no move
        setConsecutiveSixes(0);
        setPendingRoll(null);
        setState((s) => ({ ...s, current: (s.current + 1) % s.players }));
        return;
      } else {
        setConsecutiveSixes((c) => c + 1);
      }
    } else {
      if (consecutiveSixes !== 0) setConsecutiveSixes(0);
    }
    // Find first movable token for current player
    if (!anyMovesAvailable(state, current, roll)) {
      // no moves: pass turn
      setConsecutiveSixes(0);
      setState((s) => ({ ...s, current: (s.current + 1) % s.players }));
      return;
    }
    const options = movableTokens(state, current, roll);
    if (options.length <= 1) {
      const tokenIndex = options.length === 1 ? options[0] : 0;
      setState((s) => {
        const before = s;
        const ns = moveToken(s, current, tokenIndex, roll);
        if (ns.current !== s.current) setConsecutiveSixes(0);
        // detect capture
        try {
          const afterTok = ns.tokens[current][tokenIndex];
          const landed = afterTok.pos;
          if (landed >= 0 && landed < TRACK_LENGTH) {
            for (let op = 0; op < ns.players; op++) {
              if (op === current) continue;
              for (let tt = 0; tt < ns.tokensPerPlayer; tt++) {
                const prev = before.tokens[op][tt].pos;
                const now = ns.tokens[op][tt].pos;
                if (prev === landed && now === -1) {
                  setCapturePos(landed);
                  setTimeout(() => setCapturePos(null), 450);
                  setShake({ p: current, t: tokenIndex, tick: Date.now() });
                }
              }
            }
          }
        } catch {}
        // online posting
        if (isOnline && matchId) {
          const seq = ++seqRef.current;
          postTurnWithRetry({ matchId, seq, playerId: null, roll, move: { tokenIndex }, state: ns });
        }
        return ns;
      });
      setPendingRoll(null);
      setIsRolling(false);
    } else {
      // wait for user to pick a token
      setPendingRoll(roll);
      setIsRolling(false);
    }
  };

  const tokens = useMemo(() => state.tokens, [state.tokens]);
  const stackedOffsets = useMemo(() => {
    // For each player, compute per-token local index among tokens sharing same position
    return tokens.map((row) => {
      const map = new Map();
      row.forEach((tok, idx) => {
        const key = tok.pos;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(idx);
      });
      const offsets = Array(row.length).fill(0);
      for (const arr of map.values()) {
        arr.forEach((tIdx, i) => { offsets[tIdx] = i; });
      }
      return offsets;
    });
  }, [tokens]);
  const stackedCounts = useMemo(() => {
    return tokens.map((row) => {
      const map = new Map();
      row.forEach((tok) => {
        const key = tok.pos;
        map.set(key, (map.get(key) || 0) + 1);
      });
      return row.map((tok) => map.get(tok.pos) || 1);
    });
  }, [tokens]);
  const winner = useMemo(() => {
    if (teams && state.players === 4) return null; // use teamWinner below
    for (let p = 0; p < state.players; p++) {
      if (playerWon(state, p)) return p;
    }
    return null;
  }, [state, teams]);
  const teamWinner = useMemo(() => {
    if (!teams || state.players !== 4) return null;
    const tA = playerWon(state, 0) && playerWon(state, 2);
    const tB = playerWon(state, 1) && playerWon(state, 3);
    if (tA) return 0; // Team A: P1+P3
    if (tB) return 1; // Team B: P2+P4
    return null;
  }, [state, teams]);
  const overallWin = winner != null || teamWinner != null;
  // Finish match once when a winner appears
  useEffect(() => {
    if (!overallWin) return;
    if (finishedRef.current) return;
    finishedRef.current = true;
    // Mark server match finished (online, non-team)
    if (isOnline && matchId) {
      try { finishMatch({ matchId, winnerPlayerId: null, result: { winner, teamWinner, turns: seqRef.current } }); } catch {}
    }
    // Update per-user stats only for non-team (2P) matches
    if (!teams) {
      try {
        const mySeat = seat;
        if (user?.id && winner != null && (winner + 1) === mySeat) {
          const secs = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
          const displayName = playerNames[winner] || null;
          upsertUserStats({ userId: user.id, displayName, winsDelta: 1, capturesDelta: 0, fastestWinS: secs });
          // Payout coins if local bot match
          if (isBotMatch && entryFee > 0) {
            (async () => {
              try { await addCoins({ userId: user.id, delta: entryFee * 2 }); } catch {}
            })();
          }
        }
      } catch {}
    }
  }, [overallWin, winner, teamWinner, isOnline, matchId]);
  const selectableSet = useMemo(() => {
    if (pendingRoll == null) return new Set();
    if (isOnline && !isBothReady) return new Set();
    if (isOnline && !isMyTurn) return new Set();
    return new Set(movableTokens(state, current, pendingRoll));
  }, [state, current, pendingRoll, isOnline, isMyTurn, isBothReady]);

  // Entry fee deduction for local bot match (once)
  const chargedRef = useRef(false);
  useEffect(() => {
    if (!isBotMatch) return;
    if (chargedRef.current) return;
    if (!user?.id) return;
    const fee = entryFee;
    if (!(fee > 0)) { chargedRef.current = true; return; }
    chargedRef.current = true;
    (async () => {
      try { await spendCoins({ userId: user.id, amount: fee }); } catch {}
    })();
  }, [isBotMatch, user?.id, entryFee]);

  // Bot turn automation (local only, transparent)
  const aiActingRef = useRef(false);
  useEffect(() => {
    if (!isBotMatch) return;
    if (overallWin) return;
    if (!isBothReady) return;
    const myTurnIsBot = current === (botSeat - 1);
    if (!myTurnIsBot) { aiActingRef.current = false; return; }
    if (aiActingRef.current) return;
    aiActingRef.current = true;
    // Simulate AI roll and move
    const doAI = async () => {
      const roll = rollDice();
      // Reuse onRolled to update state and pendingRoll
      onRolled(roll);
      // Wait a tick for state/pendingRoll
      setTimeout(() => {
        try {
          if (!anyMovesAvailable(state, current, roll)) { aiActingRef.current = false; return; }
          const choice = chooseMove(state, current, roll, aiDifficulty);
          if (choice != null && selectableSet.has(choice)) {
            onSelectToken(choice);
          } else if (selectableSet.size > 0) {
            const fallback = Array.from(selectableSet)[0];
            onSelectToken(fallback);
          }
        } finally {
          // Allow next AI action on next turn
          setTimeout(() => { aiActingRef.current = false; }, 250);
        }
      }, 350);
    };
    // Small delay for UX
    const id = setTimeout(doAI, 450);
    return () => clearTimeout(id);
  }, [isBotMatch, current, isBothReady, overallWin, state, selectableSet, aiDifficulty]);

  const onSelectToken = (tIdx) => {
    if (pendingRoll == null) return;
    if (!selectableSet.has(tIdx)) return;
    const roll = pendingRoll;
    setState((s) => {
      const before = s;
      const ns = moveToken(s, current, tIdx, roll);
      if (ns.current !== s.current) setConsecutiveSixes(0);
      // detect capture
      try {
        const afterTok = ns.tokens[current][tIdx];
        const landed = afterTok.pos;
        if (landed >= 0 && landed < TRACK_LENGTH) {
          for (let op = 0; op < ns.players; op++) {
            if (op === current) continue;
            for (let tt = 0; tt < ns.tokensPerPlayer; tt++) {
              const prev = before.tokens[op][tt].pos;
              const now = ns.tokens[op][tt].pos;
              if (prev === landed && now === -1) {
                setCapturePos(landed);
                setTimeout(() => setCapturePos(null), 450);
                setShake({ p: current, t: tIdx, tick: Date.now() });
              }
            }
          }
        }
      } catch {}
      if (isOnline && matchId) {
        const seq = ++seqRef.current;
        postTurnWithRetry({ matchId, seq, playerId: null, roll, move: { tokenIndex: tIdx }, state: ns });
      }
      return ns;
    });
    setPendingRoll(null);
  };

  // Online subscription
  useEffect(() => {
    if (!isOnline || !matchId) return;
    // cleanup prior subs
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    // Preload latest snapshot and match info (names + metadata)
    (async () => {
      try {
        const m = await getMatch(matchId);
        const turns = Array.isArray(m?.match_turns) ? m.match_turns : [];
        // sort by seq ascending
        turns.sort((a,b) => (a.seq||0) - (b.seq||0));
        const last = turns[turns.length - 1];
        if (last?.state) {
          setState(last.state);
          setLastRoll(last.roll ?? null);
          setPendingRoll(null);
          setConsecutiveSixes(0);
          if (typeof last.seq === 'number') seqRef.current = last.seq;
        }
        // player names by seat if available
        try {
          const mp = Array.isArray(m?.match_players) ? m.match_players : [];
          const names = ['Player 1', 'Player 2'];
          mp.forEach((row) => {
            if (row?.seat && row.seat >=1 && row.seat <= 4) {
              if (row.seat <= 2 && row.display_name) names[row.seat - 1] = row.display_name;
            }
          });
          setPlayerNames(names);
        } catch {}
        if (m?.metadata) setMatchMeta(m.metadata || {});
      } catch {}
      // then subscribe
      const unsubTurns = subscribeTurns(matchId, (turn) => {
        try {
          if (turn?.state) {
            setState(turn.state);
            setLastRoll(turn.roll ?? null);
            setPendingRoll(null);
            setConsecutiveSixes(0);
            if (typeof turn.seq === 'number' && turn.seq > seqRef.current) seqRef.current = turn.seq;
          }
        } catch {}
      });
      const unsubPlayers = subscribePlayers(matchId, (payload) => {
        if (payload?.eventType === 'INSERT' || payload?.eventType === 'UPDATE') {
          try { if (seat === 1) Alert.alert('Opponent joined', 'Player 2 has joined the match.'); } catch {}
        }
      });
      const unsubMatch = subscribeMatch(matchId, (row) => {
        if (row?.metadata) setMatchMeta(row.metadata);
      });
      unsubRef.current = () => { try { unsubTurns(); } catch {} try { unsubPlayers(); } catch {} try { unsubMatch(); } catch {} };
    })();
    return () => {
      try { unsubRef.current && unsubRef.current(); } catch {}
      unsubRef.current = null;
    };
  }, [isOnline, matchId]);

  // Idempotent post with retry/backoff
  const postTurnWithRetry = (payload) => {
    let attempts = 0;
    const max = 3;
    const tryOnce = async () => {
      try {
        await postTurnIdempotent(payload);
      } catch (e) {
        attempts += 1;
        if (attempts < max) {
          const delay = 300 * attempts * attempts; // 300ms, 1200ms, 2700ms
          setTimeout(tryOnce, delay);
        }
      }
    };
    tryOnce();
  };

  const remainingFor = (p) => {
    return state.tokens[p].filter((t) => !t.finished).length;
  };

  return (
    <View style={{ flex:1, alignItems:'center', paddingTop:16 }}>
      {/* HUD */}
      <View style={{ width:'100%', paddingHorizontal:16, marginBottom:8 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <View style={{ width:14, height:14, borderRadius:7, backgroundColor: playerColor }} />
            <Text style={{ fontSize:16, fontWeight:'700' }}>{isOnline ? (playerNames[current] || `Player ${current + 1}`) : `Player ${current + 1}`}</Text>
          </View>
          <View style={{ flexDirection:'row', alignItems:'center' }}>
            {isOnline && (
              <>
                <Button title="Share" onPress={() => {
                  try {
                    const code = String(matchId);
                    if (navigator?.clipboard?.writeText) {
                      navigator.clipboard.writeText(code);
                      Alert.alert('Copied', 'Match code copied to clipboard');
                    } else {
                      Alert.alert('Match code', code);
                    }
                  } catch {
                    Alert.alert('Match code', String(matchId));
                  }
                }} />
                <View style={{ width:8 }} />
                <Button title="Leave" onPress={async () => {
                  try { if (matchId) await setMatchStatus({ matchId, status: 'finished' }); } catch {}
                }} />
              </>
            )}
            <View style={{ width:8 }} />
            <Text style={{ color:'#374151' }}>Last roll: {lastRoll ?? '-'}</Text>
          </View>
        </View>
        {isOnline && (
          <Text style={{ color:'#6b7280', marginTop:4 }}>Match: {String(matchId).slice(0,8)}…  •  Turns: {seqRef.current}</Text>
        )}
        <View style={{ height:6 }} />
        <View style={{ flexDirection:'row', justifyContent:'space-around' }}>
          {Array.from({ length: state.players }).map((_, p) => (
            <Text key={`rem-${p}`} style={{ color:'#4b5563' }}>
              {(isOnline ? (playerNames[p] || `P${p + 1}`) : `P${p + 1}`)}: {remainingFor(p)} left
            </Text>
          ))}
        </View>
        {isOnline && !isBothReady && (
          <View style={{ marginTop:8, padding:10, borderRadius:8, backgroundColor:'#fff7ed', borderWidth:1, borderColor:'#fed7aa' }}>
            <Text style={{ color:'#9a3412', marginBottom:6, fontWeight:'600' }}>Ready up to start</Text>
            <View style={{ flexDirection:'row', gap:8, alignItems:'center' }}>
              <Text style={{ color: matchMeta?.ready_p1 ? '#16a34a' : '#9ca3af' }}>P1: {playerNames[0]} {matchMeta?.ready_p1 ? '✓' : ''}</Text>
              <Text style={{ color: matchMeta?.ready_p2 ? '#16a34a' : '#9ca3af' }}>P2: {playerNames[1]} {matchMeta?.ready_p2 ? '✓' : ''}</Text>
              {!myReady && (
                <Button title="I'm Ready" onPress={async () => {
                  try {
                    const patch = { ...(matchMeta || {}) };
                    if (seat === 1) patch.ready_p1 = true; else patch.ready_p2 = true;
                    await updateMatchMetadata({ matchId, patch });
                    setMatchMeta(patch);
                  } catch {}
                }} />
              )}
            </View>
          </View>
        )}
      </View>
      <Board size={boardSize}>
        {/* capture flash overlay */}
        {capturePos != null && (() => {
          const { x, y } = indexToXY(capturePos, 0);
          const r = Math.max(22, Math.floor(boardSize / 12));
          return (
            <View key="cap" style={{ position:'absolute', left:x*boardSize - r/2, top:y*boardSize - r/2, width:r, height:r, borderRadius:r/2, backgroundColor:'rgba(239,68,68,0.35)', borderWidth:2, borderColor:'#ef4444' }} />
          );
        })()}
        {tokens.map((row, pIdx) =>
          row.map((tok, tIdx) => (
            <Token
              key={`p${pIdx}t${tIdx}`}
              pos={tok.pos}
              color={COLORS[pIdx % COLORS.length]}
              boardSize={boardSize}
              offset={stackedOffsets[pIdx]?.[tIdx] ?? tIdx}
              playerIndex={pIdx}
              imageSource={TOKEN_IMAGES[pIdx % TOKEN_IMAGES.length]}
              stackCount={stackedCounts[pIdx]?.[tIdx] ?? 1}
              isTurn={pIdx === current}
              shakeKey={shake.p === pIdx && shake.t === tIdx ? shake.tick : 0}
              onPress={pIdx === current && selectableSet.has(tIdx) ? () => onSelectToken(tIdx) : undefined}
              selectable={pIdx === current && selectableSet.has(tIdx)}
            />
          ))
        )}
      </Board>
      <View style={{ height:16 }} />
      {(!overallWin) ? (
        waitingForOpponent ? (
          <View style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, backgroundColor:'#fef9c3', borderWidth:1, borderColor:'#fde68a' }}>
            <Text style={{ color:'#92400e', fontWeight:'600' }}>Waiting for opponent to join...</Text>
          </View>
        ) : (
          !isBothReady ? (
            <View style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, backgroundColor:'#fff7ed', borderWidth:1, borderColor:'#fed7aa' }}>
              <Text style={{ color:'#9a3412', fontWeight:'600' }}>Waiting for players to Ready…</Text>
            </View>
          ) : isOnline && !isMyTurn ? (
            <View style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, backgroundColor:'#e0e7ff', borderWidth:1, borderColor:'#c7d2fe' }}>
              <Text style={{ color:'#1e40af', fontWeight:'600' }}>Opponent's turn...</Text>
            </View>
          ) : (
            <Dice onRolled={onRolled} rollValue={lastRoll} spinKey={seqRef.current} size={Math.max(52, Math.floor(boardSize * 0.2))} />
          )
        )
      ) : (
        <View style={{ alignItems:'center' }}>
          {winner != null ? (
            <Text style={{ fontSize:18, fontWeight:'700', marginBottom:8 }}>Player {winner + 1} Wins!</Text>
          ) : (
            <Text style={{ fontSize:18, fontWeight:'700', marginBottom:8 }}>Team {teamWinner === 0 ? 'A (P1+P3)' : 'B (P2+P4)'} Wins!</Text>
          )}
          {isOnline && (
            <Text style={{ color:'#6b7280', marginBottom:8 }}>Match: {String(matchId).slice(0,8)}…  •  Turns: {seqRef.current}</Text>
          )}
          <View style={{ flexDirection:'row', gap:12 }}>
            <Button title="Play Again" onPress={() => { setState(initialState(state.players, state.tokensPerPlayer)); setPendingRoll(null); setLastRoll(null); setConsecutiveSixes(0); }} />
            {!!navigation && <Button title="Back to Lobby" onPress={() => navigation.goBack()} />}
            {!!navigation && <Button title="View Results" onPress={() => navigation.navigate('CloneResults', { winner, matchId, turns: seqRef.current })} />}
            {!!navigation && (
              <Button title="Rematch" onPress={async () => {
                try {
                  if (isOnline) {
                    const m = await createMatch({ playersCount: 2, mode: 'online' });
                    await joinMatch({ matchId: m.id, playerId: null, seat, displayName: `Player ${seat}` });
                    navigation.replace('CloneMatch', { mode: 'online', matchId: m.id, seat });
                  } else {
                    setState(initialState(state.players, state.tokensPerPlayer));
                    setPendingRoll(null); setLastRoll(null); setConsecutiveSixes(0);
                  }
                } catch (e) {}
              }} />
            )}
          </View>
        </View>
      )}
      <View style={{ height:8 }} />
      <Text style={{ color:'#374151', textAlign:'center', paddingHorizontal:16 }}>
        {winner == null
          ? (pendingRoll == null
              ? `Player ${current + 1}: tap ROLL.`
              : `Player ${current + 1}: choose a token to move ${pendingRoll}.`)
          : 'Tap Play Again to restart the match.'}
      </Text>
    </View>
  );
}
