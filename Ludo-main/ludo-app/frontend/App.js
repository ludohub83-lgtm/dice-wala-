import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme, Platform, LogBox } from 'react-native';

// Suppress ALL logs to prevent Expo update error from showing
LogBox.ignoreAllLogs(true);

// Also suppress specific patterns
LogBox.ignoreLogs([
  'Uncaught Error: java.io.IOException: Failed to download remote update',
  'Failed to download remote update',
  'expo-updates',
  'IOException',
  'remote update',
]);

// Disable console errors for update issues
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Failed to download remote update') ||
     args[0].includes('expo-updates') ||
     args[0].includes('java.io.IOException') ||
     args[0].includes('IOException') ||
     args[0].includes('remote update'))
  ) {
    return;
  }
  originalError(...args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Failed to download remote update') ||
     args[0].includes('expo-updates') ||
     args[0].includes('IOException'))
  ) {
    return;
  }
  originalWarn(...args);
};

// Global error handler
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    if (
      error &&
      error.message &&
      (error.message.includes('Failed to download remote update') ||
       error.message.includes('IOException') ||
       error.message.includes('expo-updates'))
    ) {
      console.log('Suppressed Expo update error');
      return;
    }
    originalHandler(error, isFatal);
  });
}
import ErrorBoundary from './ErrorBoundary';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import WalletScreen from './screens/WalletScreen';
import UploadPayment from './screens/UploadPayment';
import ManualPaymentScreen from './screens/ManualPaymentScreen';
import PaymentRequestScreen from './screens/PaymentRequestScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import AdminScreen from './screens/AdminScreen';
import AdminDashboard from './screens/AdminDashboard';
import WithdrawScreen from './screens/WithdrawScreen';
import SupportScreen from './screens/SupportScreen';
import SocialScreen from './screens/SocialScreen';
import EventScreen from './screens/EventScreen';
import InventoryScreen from './screens/InventoryScreen';
import StoreScreen from './screens/StoreScreen';
import HistoryDetailScreen from './screens/HistoryDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import TournamentScreen from './screens/TournamentScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import ProfileScreen from './screens/ProfileScreen';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme, MD3DarkTheme as DarkTheme } from 'react-native-paper';

const lightTheme = {
  ...DefaultTheme,
  roundness: 14,
  animation: { scale: 1.05 },
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563eb', // Ludo King blue
    secondary: '#22c55e', // Ludo King green
    tertiary: '#ef4444', // Ludo King red
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceVariant: '#e8edf6',
    outline: '#c7d2fe',
    onPrimary: '#ffffff',
    onSecondary: '#111827',
    error: '#ef4444',
    warning: '#fbbf24', // Ludo King yellow
  },
};

const darkTheme = {
  ...DarkTheme,
  roundness: 14,
  animation: { scale: 1.05 },
  colors: {
    ...DarkTheme.colors,
    primary: '#3b82f6', // Lighter Ludo King blue
    secondary: '#34d399', // Lighter Ludo King green
    tertiary: '#f87171', // Lighter Ludo King red
    background: '#0b1220',
    surface: '#0f172a',
    surfaceVariant: '#111827',
    outline: '#3b82f6',
    onPrimary: '#0b1220',
    error: '#f87171',
    warning: '#fbbf24', // Ludo King yellow
  },
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  const handleLogout = () => {
    setUser(null);
  };
  if (Platform.OS === 'web') {
    // Load global web CSS once
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./web/global.css');
    } catch (e) {
      console.warn('CSS not loaded:', e);
    }
  }

  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator>
          {!user ? (
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {() => <LoginScreen onLogin={setUser} />}
            </Stack.Screen>
          ) : (
            [
              (
                <Stack.Screen key="Home" name="Home" options={{ title: 'Dice Wala' }}>
                  {(props) => <HomeScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Wallet" name="Wallet" options={{ title: 'Wallet' }}>
                  {(props) => <WalletScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="UploadPayment" name="UploadPayment" options={{ title: 'Add Coins' }}>
                  {(props) => <UploadPayment {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="ManualPayment" name="ManualPayment" options={{ title: 'Add Coins (Manual Payment)' }}>
                  {(props) => <ManualPaymentScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="PaymentRequest" name="PaymentRequest" options={{ title: 'Add Coins (Payment Request)' }}>
                  {(props) => <PaymentRequestScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Lobby" name="Lobby" options={{ title: 'Lobby' }}>
                  {(props) => <LobbyScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Game" name="Game" options={{ title: 'Match' }}>
                  {(props) => <GameScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Withdraw" name="Withdraw" options={{ title: 'Withdraw' }}>
                  {(props) => <WithdrawScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Support" name="Support" options={{ title: 'Support' }}>
                  {(props) => <SupportScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Social" name="Social" options={{ title: 'Social' }}>
                  {(props) => <SocialScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Event" name="Event" options={{ title: 'Event' }}>
                  {(props) => <EventScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Leaderboard" name="Leaderboard" options={{ title: 'Leaderboard' }}>
                  {(props) => <LeaderboardScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Tournament" name="Tournament" options={{ title: 'Tournament' }}>
                  {(props) => <TournamentScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Inventory" name="Inventory" options={{ title: 'Inventory' }}>
                  {(props) => <InventoryScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Store" name="Store" options={{ title: 'Store' }}>
                  {(props) => <StoreScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="HistoryDetail" name="HistoryDetail" options={{ title: 'Match Details' }}>
                  {(props) => <HistoryDetailScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Settings" name="Settings" options={{ title: 'Settings' }}>
                  {(props) => <SettingsScreen {...props} user={user} onLogout={handleLogout} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Transactions" name="Transactions" options={{ title: 'Transaction History' }}>
                  {(props) => <TransactionsScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Profile" name="Profile" options={{ title: 'My Profile' }}>
                  {(props) => <ProfileScreen {...props} user={user} />}
                </Stack.Screen>
              ),
              (
                <Stack.Screen key="Admin" name="Admin" options={{ title: 'Admin Panel' }}>
                  {(props) => <AdminScreen {...props} user={user} navigation={props.navigation} />}
                </Stack.Screen>
              ),
            ]
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
    </ErrorBoundary>
  );
}
