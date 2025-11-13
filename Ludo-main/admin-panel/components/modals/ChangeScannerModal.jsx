'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, QrCode } from 'lucide-react';
import { getPaymentQRCode, updatePaymentQRCode } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ChangeScannerModal({ onClose }) {
  const [qrData, setQrData] = useState({ upiId: '', qrImageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    try {
      setLoading(true);
      const data = await getPaymentQRCode();
      setQrData(data || { upiId: '', qrImageUrl: '' });
      setUpiId(data?.upiId || '');
      setQrImageUrl(data?.qrImageUrl || '');
    } catch (error) {
      toast.error('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!upiId.trim()) {
      toast.error('UPI ID is required');
      return;
    }

    try {
      setSaving(true);
      await updatePaymentQRCode({ upiId, qrImageUrl });
      toast.success('QR code updated successfully');
      loadQRCode();
    } catch (error) {
      toast.error('Failed to update QR code');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-3xl p-6 max-w-2xl w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Change Scanner / QR Code</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-white">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 mb-2">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="vishesh@upi"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-2">QR Code Image URL</label>
                <input
                  type="url"
                  value={qrImageUrl}
                  onChange={(e) => setQrImageUrl(e.target.value)}
                  placeholder="https://example.com/qr-code.png"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              {qrData.qrImageUrl && (
                <div className="flex justify-center">
                  <img
                    src={qrData.qrImageUrl}
                    alt="QR Code"
                    className="w-48 h-48 object-contain rounded-lg bg-white/10 p-4"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !upiId.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition"
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

