/**
 * Integration Example
 * Shows how to integrate the game logic with your existing UI
 */

import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { useGameLogic } from '../hooks/useGameLogic';
import { useGameRoom } from '../hooks/useGameRoom';

// ============================================
// EXAMPLE 1: Simple Integration
// ============================================

export function SimpleGameExample({ gameId, playerId }) {
  const {
    gameState,
    isMyTurn,
    validMoves,
    rollDice,
    playMove,
  } = useGameLogic(gameId, playerId);

  if (!gameState) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Current Turn: {gameState.players[gameState.currentPlayerIndex].name}</Text>
      <Text>Dice: {gameState.diceValue || 'Not rolled'}</Text>
      
      {isMyTurn && gameState.canRollDice && (
        <Button title="Roll Dice" onPress={rollDice} />
      )}
      
      {isMyTurn && validMoves.length > 0 && (
        <View>
          <Text>Select a token to move:</Text>
          {validMoves.map(tokenIndex => (
            <Button
              key={tokenIndex}
              title={`Move Token ${tokenIndex + 1}`}
              onPress={() => playMove(tokenIndex)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================
// EXAMPLE 2: With Your Existing Board Component
// ============================================

export function IntegratedBoardExample({ gameId, playerId, YourBoardComponent }) {
  const {
    gameState,
    isMyTurn,
    validMoves,
    currentPlayer,
    rollDice,
    playMove,
  } = useGameLogic(gameId, playerId);

  if (!gameState) return null;

  // Map game state to your board's expected props
  const boardProps = {
    // Player data
    players: gameState.players.map(p => ({
      color: p.color,
      name: p.name,
      tokens: p.tokens,
      isActive: p.id === currentPlayer?.id,
    })),
    
    // Dice
    diceValue: gameState.diceValue,
    canRollDice: isMyTurn && gameState.canRollDice,
    
    // Interaction
    onDiceRoll: rollDice,
    onTokenClick: (tokenIndex) => {
      if (validMoves.includes(tokenIndex)) {
        playMove(tokenIndex);
      }
    },
    
    // Highlighting
    highlightedTokens: validMoves,
    currentTurn: gameState.currentPlayerIndex,
  };

  return <YourBoardComponent {...boardProps} />;
}

// ============================================
// EXAMPLE 3: Complete Flow with Lobby
// ============================================

export function CompleteGameFlow({ currentUser }) {
  const [gameId, setGameId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  
  const {
    availableRooms,
    createRoom,
    joinRoom,
    startGameInRoom,
    loadAvailableRooms,
  } = useGameRoom();

  // Step 1: Lobby
  if (!roomId && !gameId) {
    return (
      <View>
        <Button
          title="Create Room"
          onPress={async () => {
            const result = await createRoom(
              { id: currentUser.uid, name: currentUser.displayName },
              4,
              0
            );
            if (result.success) setRoomId(result.roomId);
          }}
        />
        
        <Button title="Refresh Rooms" onPress={loadAvailableRooms} />
        
        {availableRooms.map(room => (
          <Button
            key={room.id}
            title={`Join ${room.hostName}'s room`}
            onPress={async () => {
              const result = await joinRoom(room.id, {
                id: currentUser.uid,
                name: currentUser.displayName,
              });
              if (result.success) setRoomId(room.id);
            }}
          />
        ))}
      </View>
    );
  }

  // Step 2: Waiting Room
  if (roomId && !gameId) {
    return (
      <View>
        <Text>Waiting for players...</Text>
        <Button
          title="Start Game"
          onPress={async () => {
            const result = await startGameInRoom(roomId);
            if (result.success) setGameId(result.gameId);
          }}
        />
      </View>
    );
  }

  // Step 3: Game
  return (
    <SimpleGameExample
      gameId={gameId}
      playerId={currentUser.uid}
    />
  );
}

// ============================================
// EXAMPLE 4: Using with Existing Ludo King Board
// ============================================

export function LudoKingIntegration({ gameId, playerId }) {
  const {
    gameState,
    isMyTurn,
    validMoves,
    rollDice,
    playMove,
  } = useGameLogic(gameId, playerId);

  // Assuming you have LudoKingBoard component
  // Import your existing board: import LudoKingBoard from './components/LudoKingBoard';
  
  if (!gameState) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Your existing Ludo King board */}
      {/* 
      <LudoKingBoard
        gameState={{
          players: gameState.players,
          currentPlayer: gameState.currentPlayerIndex,
          diceValue: gameState.diceValue,
        }}
        onTokenPress={(playerIndex, tokenIndex) => {
          // Only allow if it's my turn and valid move
          if (isMyTurn && validMoves.includes(tokenIndex)) {
            playMove(tokenIndex);
          }
        }}
        onDicePress={() => {
          if (isMyTurn && gameState.canRollDice) {
            rollDice();
          }
        }}
        highlightTokens={validMoves}
        myPlayerIndex={gameState.players.findIndex(p => p.id === playerId)}
      />
      */}
      
      {/* Or use the provided GameBoard */}
      {/* <GameBoard gameState={gameState} onTokenPress={playMove} myPlayerIndex={...} /> */}
    </View>
  );
}

// ============================================
// EXAMPLE 5: Minimal Hook Usage
// ============================================

export function MinimalExample() {
  const [gameId] = useState('your-game-id');
  const [playerId] = useState('your-player-id');
  
  const game = useGameLogic(gameId, playerId);

  return (
    <View>
      {/* Access game state */}
      <Text>Turn: {game.gameState?.currentPlayerIndex}</Text>
      <Text>Dice: {game.gameState?.diceValue}</Text>
      
      {/* Roll dice */}
      {game.isMyTurn && (
        <Button title="Roll" onPress={game.rollDice} />
      )}
      
      {/* Move tokens */}
      {game.validMoves.map(i => (
        <Button key={i} title={`Token ${i}`} onPress={() => game.playMove(i)} />
      ))}
    </View>
  );
}

// ============================================
// EXAMPLE 6: With State Management (Redux/Context)
// ============================================

export function WithStateManagement({ gameId, playerId }) {
  const game = useGameLogic(gameId, playerId);
  
  // Sync with your state management
  React.useEffect(() => {
    if (game.gameState) {
      // Dispatch to Redux
      // dispatch(updateGameState(game.gameState));
      
      // Or update Context
      // setGlobalGameState(game.gameState);
    }
  }, [game.gameState]);

  return null; // Your components read from global state
}

// ============================================
// USAGE IN YOUR APP
// ============================================

/*

// In your App.js or navigation:

import GameLobby from './components/GameLobby';
import MultiplayerGameScreen from './screens/MultiplayerGameScreen';

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Lobby" component={GameLobby} />
        <Stack.Screen name="Game" component={MultiplayerGameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// In your HomeScreen:

function HomeScreen({ navigation }) {
  const currentUser = auth.currentUser;
  
  return (
    <Button
      title="Play Ludo"
      onPress={() => navigation.navigate('Lobby', { currentUser })}
    />
  );
}

*/
