'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Bell, Shield, Palette, Database, Megaphone, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    autoApprove: false,
    maintenanceMode: false,
    maxWithdrawal: 10000,
    minDeposit: 100,
    theme: 'dark',
  });
  const [saving, setSaving] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    version: '',
    title: '',
    message: '',
    features: '',
    isForced: false,
  });
  const [sending, setSending] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: Save to Firebase/Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendUpdate = async () => {
    if (!updateData.version || !updateData.title || !updateData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      
      // Push update notification to Firebase
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'appUpdates'), {
        version: updateData.version,
        title: updateData.title,
        message: updateData.message,
        features: updateData.features.split('\n').filter(f => f.trim()),
        isForced: updateData.isForced,
        timestamp: Date.now(),
        createdAt: serverTimestamp(),
      });

      toast.success('Update notification sent to all users!');
      setShowUpdateModal(false);
      setUpdateData({
        version: '',
        title: '',
        message: '',
        features: '',
        isForced: false,
      });
    } catch (error) {
      console.error('Error sending update:', error);
      toast.error('Failed to send update notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <div className="glass rounded-2xl p-6 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-300">Configure admin panel settings</p>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-sm text-white/60">Receive push notifications for new requests</p>
                </div>
                <button
                  onClick={() => handleToggle('notifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Alerts</p>
                  <p className="text-sm text-white/60">Receive email notifications</p>
                </div>
                <button
                  onClick={() => handleToggle('emailAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailAlerts ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-green-400" size={24} />
              <h2 className="text-xl font-bold text-white">Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Auto Approve Payments</p>
                  <p className="text-sm text-white/60">Automatically approve verified payments</p>
                </div>
                <button
                  onClick={() => handleToggle('autoApprove')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoApprove ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoApprove ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Maintenance Mode</p>
                  <p className="text-sm text-white/60">Disable user access temporarily</p>
                </div>
                <button
                  onClick={() => handleToggle('maintenanceMode')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Limits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-blue-400" size={24} />
              <h2 className="text-xl font-bold text-white">Transaction Limits</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Maximum Withdrawal Amount
                </label>
                <input
                  type="number"
                  value={settings.maxWithdrawal}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxWithdrawal: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">
                  Minimum Deposit Amount
                </label>
                <input
                  type="number"
                  value={settings.minDeposit}
                  onChange={(e) => setSettings(prev => ({ ...prev, minDeposit: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Push Update Notification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Megaphone className="text-orange-400" size={24} />
              <h2 className="text-xl font-bold text-white">Push Update Notification</h2>
            </div>
            
            <p className="text-white/60 mb-4">
              Send update notification to all users. They will see a popup in the app.
            </p>
            
            <button
              onClick={() => setShowUpdateModal(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white font-bold hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Send Update Notification
            </button>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full glass rounded-xl p-4 text-white font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Settings
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Update Notification Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Push Update Notification</h2>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Version Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2.0.0"
                  value={updateData.version}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, version: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Update Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., New Features & Bug Fixes"
                  value={updateData.title}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Update Message *
                </label>
                <textarea
                  placeholder="Describe what's new in this update..."
                  value={updateData.message}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  New Features (one per line)
                </label>
                <textarea
                  placeholder="New board design&#10;Improved performance&#10;Bug fixes"
                  value={updateData.features}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, features: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                <input
                  type="checkbox"
                  id="forceUpdate"
                  checked={updateData.isForced}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, isForced: e.target.checked }))}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="forceUpdate" className="text-white font-medium cursor-pointer">
                  Force Update (Users must update to continue)
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-6 py-3 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendUpdate}
                  disabled={sending}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send to All Users
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
