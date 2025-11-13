'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  RefreshCw,
  DollarSign,
  Percent,
  Users,
  Clock,
  Trophy,
  Shield,
  Zap,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getGameSettings,
  updateGameSettings,
  toggleGameMaintenance,
} from '@/lib/api';

export default function GameControlModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
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
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getGameSettings();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load game settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateGameSettings(settings);
      toast.success('Game settings updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      const newMode = !settings.maintenanceMode;
      await toggleGameMaintenance(newMode);
      setSettings({ ...settings, maintenanceMode: newMode });
      toast.success(
        newMode ? 'Maintenance mode enabled' : 'Maintenance mode disabled'
      );
    } catch (error) {
      toast.error('Failed to toggle maintenance mode');
    }
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Game Control</h2>
                <p className="text-gray-400 text-sm">
                  Manage game settings and configurations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Maintenance Mode Toggle */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Maintenance Mode
                      </h3>
                      <p className="text-sm text-gray-400">
                        Disable game access for maintenance
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    className={`relative w-16 h-8 rounded-full transition-colors ${
                      settings.maintenanceMode
                        ? 'bg-orange-500'
                        : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{
                        x: settings.maintenanceMode ? 32 : 4,
                      }}
                      className="absolute top-1 w-6 h-6 bg-white rounded-full"
                    />
                  </button>
                </div>
              </div>

              {/* Entry Fee Settings */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-white">
                    Entry Fee Settings
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Minimum Entry Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.minEntryFee}
                      onChange={(e) =>
                        handleChange('minEntryFee', Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Maximum Entry Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.maxEntryFee}
                      onChange={(e) =>
                        handleChange('maxEntryFee', Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Commission & Fees */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Percent className="w-6 h-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white">
                    Commission & Fees
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.commissionRate}
                      onChange={(e) =>
                        handleChange('commissionRate', Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Signup Bonus (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.signupBonus}
                      onChange={(e) =>
                        handleChange('signupBonus', Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Withdrawal Settings */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-white">
                    Withdrawal Settings
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Minimum Withdrawal (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.minWithdraw}
                      onChange={(e) =>
                        handleChange('minWithdraw', Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Maximum Withdrawal (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.maxWithdraw}
                      onChange={(e) =>
                        handleChange('maxWithdraw', Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>
              </div>

              {/* Game Settings */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-semibold text-white">
                    Game Settings
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Max Players Per Game
                    </label>
                    <input
                      type="number"
                      value={settings.maxPlayersPerGame}
                      onChange={(e) =>
                        handleChange(
                          'maxPlayersPerGame',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Game Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.gameTimeout}
                      onChange={(e) =>
                        handleChange('gameTimeout', Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Referral Bonus (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.referralBonus}
                      onChange={(e) =>
                        handleChange('referralBonus', Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Minimum App Version
                    </label>
                    <input
                      type="text"
                      value={settings.minAppVersion}
                      onChange={(e) =>
                        handleChange('minAppVersion', e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-white">
                    Feature Toggles
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Auto Matchmaking</span>
                    <button
                      onClick={() =>
                        handleChange('autoMatchmaking', !settings.autoMatchmaking)
                      }
                      className={`relative w-16 h-8 rounded-full transition-colors ${
                        settings.autoMatchmaking ? 'bg-cyan-500' : 'bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{
                          x: settings.autoMatchmaking ? 32 : 4,
                        }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full"
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Allow New Registrations</span>
                    <button
                      onClick={() =>
                        handleChange(
                          'allowNewRegistrations',
                          !settings.allowNewRegistrations
                        )
                      }
                      className={`relative w-16 h-8 rounded-full transition-colors ${
                        settings.allowNewRegistrations
                          ? 'bg-cyan-500'
                          : 'bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{
                          x: settings.allowNewRegistrations ? 32 : 4,
                        }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
