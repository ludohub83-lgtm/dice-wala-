/**
 * Game Navigator
 * Ready-to-use navigation setup for Ludo game
 * 
 * Usage:
 * 1. Import this in your main App.js
 * 2. Add GameNavigator to your stack
 * 3. Navigate to 'GameLobby' from anywhere
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GameLobby from '../components/GameLobby';
import MultiplayerGameScreen from '../screens/MultiplayerGameScreen';

const Stack = createStackNavigator();

export default function GameNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="GameLobby"
        component={GameLobby}
        options={{
          title: 'Ludo Game Lobby',
          headerLeft: null, // Remove back button on lobby
        }}
      />
      <Stack.Screen
        name="MultiplayerGame"
        component={MultiplayerGameScreen}
        options={{
          title: 'Ludo Game',
          headerLeft: null, // Prevent going back during game
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Alternative: Add screens to existing navigator
 * 
 * In your App.js:
 * 
 * import GameLobby from './components/GameLobby';
 * import MultiplayerGameScreen from './screens/MultiplayerGameScreen';
 * 
 * <Stack.Navigator>
 *   {/* Your existing screens *\/}
 *   <Stack.Screen name="GameLobby" component={GameLobby} />
 *   <Stack.Screen name="MultiplayerGame" component={MultiplayerGameScreen} />
 * </Stack.Navigator>
 * 
 * Then navigate from anywhere:
 * navigation.navigate('GameLobby', { currentUser: auth.currentUser });
 */

/**
 * Example: Add to Tab Navigator
 * 
 * import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
 * import GameNavigator from './navigation/GameNavigator';
 * 
 * const Tab = createBottomTabNavigator();
 * 
 * <Tab.Navigator>
 *   <Tab.Screen name="Home" component={HomeScreen} />
 *   <Tab.Screen name="Game" component={GameNavigator} />
 *   <Tab.Screen name="Profile" component={ProfileScreen} />
 * </Tab.Navigator>
 */
