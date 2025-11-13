/**
 * Game Lobby Component
 * Room creation and joining interface
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useGameRoom, useRoomSubscription } from '../hooks/useGameRoom';

export default function GameLobby({ currentUser, onGameStart }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  
  const {
    availableRooms,
    loading,
    error,
    createRoom,
    joinRoom,
    startGameInRoom,
    loadAvailableRooms,
  } = useGameRoom();

  const { room: currentRoom } = useRoomSubscription(selectedRoom);

  useEffect(() => {
    loadAvailableRooms();
    const interval = setInterval(loadAvailableRooms, 5000);
    return () => clearInterval(interval);
  }, [loadAvailableRooms]);

  const handleCreateRoom = async () => {
    setCreatingRoom(true);
    const result = await createRoom(
      { id: currentUser.uid, name: currentUser.displayName || 'Player' },
      4,
      0
    );
    
    if (result.success) {
      setSelectedRoom(result.roomId);
    }
    setCreatingRoom(false);
  };

  const handleJoinRoom = async (roomId) => {
    const result = await joinRoom(roomId, {
      id: currentUser.uid,
      name: currentUser.displayName || 'Player',
    });
    
    if (result.success) {
      setSelectedRoom(roomId);
    }
  };

  const handleStartGame = async () => {
    if (!selectedRoom) return;
    
    const result = await startGameInRoom(selectedRoom);
    if (result.success) {
      onGameStart(result.gameId);
    }
  };

  if (selectedRoom && currentRoom) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game Room</Text>
        <Text style={styles.subtitle}>
          Players: {currentRoom.players?.length || 0}/{currentRoom.maxPlayers}
        </Text>
        
        <View style={styles.playersList}>
          {currentRoom.players?.map((player, index) => (
            <View key={player.id} style={styles.playerItem}>
              <View style={[styles.colorDot, { backgroundColor: ['red', 'green', 'yellow', 'blue'][index] }]} />
              <Text style={styles.playerName}>{player.name}</Text>
              {player.id === currentRoom.hostId && <Text style={styles.hostBadge}>HOST</Text>}
            </View>
          ))}
        </View>

        {currentRoom.hostId === currentUser.uid && (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStartGame}
            disabled={currentRoom.players?.length < 2}
          >
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.leaveButton]}
          onPress={() => setSelectedRoom(null)}
        >
          <Text style={styles.buttonText}>Leave Room</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ludo Game Lobby</Text>
      
      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={handleCreateRoom}
        disabled={creatingRoom}
      >
        {creatingRoom ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create New Room</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.subtitle}>Available Rooms</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={availableRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomItem}
              onPress={() => handleJoinRoom(item.id)}
            >
              <View style={styles.roomInfo}>
                <Text style={styles.roomHost}>{item.hostName}'s Room</Text>
                <Text style={styles.roomPlayers}>
                  {item.players?.length || 0}/{item.maxPlayers} Players
                </Text>
              </View>
              <Text style={styles.joinText}>JOIN</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No rooms available. Create one!</Text>
          }
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    marginVertical: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  roomInfo: {
    flex: 1,
  },
  roomHost: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomPlayers: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5,
  },
  joinText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playersList: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  hostBadge: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginTop: 10,
  },
});
