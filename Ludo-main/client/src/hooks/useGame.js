/**
 * useGame Hook
 * Manages game state and provides methods for game actions
 * Subscribes to Firestore and calls Cloud Functions
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebaseConfig';

export function useGame(gameId, myPlayerId) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Subscribe to game document
  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const gameRef = doc(db, 'games', gameId);

    const unsubscribe = onSnapshot(
      gameRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const gameData = snapshot.data();
          setGame({ id: snapshot.id, ...gameData });
          setError(null);
        } else {
          setError('Game not found');
          setGame(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Game subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [gameId]);

  // Derived state
  const isMyTurn = useCallback(() => {
    if (!game || !myPlayerId) return false;
    const currentPlayer = game.players[game.turnIndex];
    return currentPlayer?.id === myPlayerId;
  }, [game, myPlayerId]);

  const availableMoves = useCallback(() => {
    if (!game || !myPlayerId || !game.availableMoves) return [];
    return game.availableMoves[myPlayerId] || [];
  }, [game, myPlayerId]);

  const myPlayer = useCallback(() => {
    if (!game || !myPlayerId) return null;
    return game.players.find(p => p.id === myPlayerId);
  }, [game, myPlayerId]);

  // Create game
  const createGame = useCallback(async (playerName, settings = {}) => {
    setActionLoading(true);
    setError(null);

    try {
      const createGameFn = httpsCallable(functions, 'createGame');
      const result = await createGameFn({ playerName, settings });

      if (result.data.success) {
        return { success: true, gameId: result.data.gameId };
      } else {
        throw new Error('Failed to create game');
      }
    } catch (err) {
      console.error('Create game error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Join game
  const joinGame = useCallback(async (gameIdToJoin, playerName) => {
    setActionLoading(true);
    setError(null);

    try {
      const joinGameFn = httpsCallable(functions, 'joinGame');
      const result = await joinGameFn({ gameId: gameIdToJoin, playerName });

      if (result.data.success) {
        return { success: true };
      } else {
        throw new Error('Failed to join game');
      }
    } catch (err) {
      console.error('Join game error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Start game
  const startGame = useCallback(async () => {
    if (!gameId) return { success: false, error: 'No game ID' };

    setActionLoading(true);
    setError(null);

    try {
      const startGameFn = httpsCallable(functions, 'startGame');
      const result = await startGameFn({ gameId });

      if (result.data.success) {
        return { success: true };
      } else {
        throw new Error('Failed to start game');
      }
    } catch (err) {
      console.error('Start game error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [gameId]);

  // Roll dice - calls Cloud Function for authoritative RNG
  const rollDice = useCallback(async () => {
    if (!gameId) return { success: false, error: 'No game ID' };
    if (!isMyTurn()) return { success: false, error: 'Not your turn' };

    setActionLoading(true);
    setError(null);

    try {
      const rollDiceFn = httpsCallable(functions, 'rollDice');
      const result = await rollDiceFn({ gameId });

      if (result.data.success) {
        return {
          success: true,
          dice: result.data.dice,
          availableMoves: result.data.availableMoves,
          turnAdvanced: result.data.turnAdvanced,
        };
      } else {
        throw new Error('Failed to roll dice');
      }
    } catch (err) {
      console.error('Roll dice error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [gameId, isMyTurn]);

  // Play move - calls Cloud Function for authoritative validation
  const playMove = useCallback(async (tokenIndex) => {
    if (!gameId) return { success: false, error: 'No game ID' };
    if (!isMyTurn()) return { success: false, error: 'Not your turn' };

    setActionLoading(true);
    setError(null);

    try {
      const playMoveFn = httpsCallable(functions, 'playMove');
      const result = await playMoveFn({ gameId, tokenIndex });

      if (result.data.success) {
        return {
          success: true,
          captured: result.data.captured,
          extraTurn: result.data.extraTurn,
          winnerIds: result.data.winnerIds,
        };
      } else {
        throw new Error('Failed to play move');
      }
    } catch (err) {
      console.error('Play move error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [gameId, isMyTurn]);

  return {
    // State
    game,
    loading,
    error,
    actionLoading,

    // Derived state
    isMyTurn: isMyTurn(),
    availableMoves: availableMoves(),
    myPlayer: myPlayer(),
    myPlayerId,

    // Actions
    createGame,
    joinGame,
    startGame,
    rollDice,
    playMove,
  };
}

export default useGame;
