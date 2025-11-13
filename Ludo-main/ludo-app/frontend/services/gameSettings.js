import axios from 'axios';
import { getApiBase } from './api';

const api = axios.create({
  baseURL: getApiBase(),
});

// Get game settings from admin panel
export const getGameSettings = async () => {
  try {
    const response = await api.get('/api/admin/game-settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching game settings:', error);
    // Return default settings if API fails
    return {
      minEntryFee: 10,
      maxEntryFee: 10000,
      commissionRate: 10,
      minWithdraw: 100,
      maxWithdraw: 50000,
      referralBonus: 50,
      signupBonus: 25,
      maxPlayersPerGame: 4,
      gameTimeout: 30,
      autoMatchmaking: true,
      maintenanceMode: false,
      allowNewRegistrations: true,
      minAppVersion: '1.0.0',
    };
  }
};

// Check maintenance status
export const checkMaintenanceStatus = async () => {
  try {
    const response = await api.get('/api/admin/maintenance-status');
    return response.data;
  } catch (error) {
    console.error('Error checking maintenance status:', error);
    return {
      maintenanceMode: false,
      minAppVersion: '1.0.0',
    };
  }
};

// Check if app version is supported
export const isAppVersionSupported = (currentVersion, minVersion) => {
  const current = currentVersion.split('.').map(Number);
  const min = minVersion.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (current[i] > min[i]) return true;
    if (current[i] < min[i]) return false;
  }
  return true;
};

export default {
  getGameSettings,
  checkMaintenanceStatus,
  isAppVersionSupported,
};
