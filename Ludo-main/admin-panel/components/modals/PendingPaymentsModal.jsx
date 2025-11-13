'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import {
  fetchPendingPayments,
  fetchPaymentRequests,
  approvePayment,
  rejectPayment,
  verifyPaymentRequest,
} from '@/lib/api';
import toast from 'react-hot-toast';

export default function PendingPaymentsModal({ onClose }) {
  const [payments, setPayments] = useState([]);
  const [manualPayments, setManualPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('regular');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const [regular, manual] = await Promise.all([
        fetchPendingPayments(),
        fetchPaymentRequests('Pending'),
      ]);
      setPayments(regular || []);
      setManualPayments(manual || []);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, isManual = false) => {
    try {
      if (isManual) {
        await verifyPaymentRequest(id, true);
      } else {
        await approvePayment(id);
      }
      toast.success('Payment approved');
      loadPayments();
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  const handleReject = async (id, isManual = false, markAsFake = false) => {
    try {
      if (isManual) {
        await verifyPaymentRequest(id, false);
      } else {
        await rejectPayment(id, markAsFake);
      }
      toast.success(markAsFake ? 'Marked as fake' : 'Payment rejected');
      loadPayments();
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  const displayPayments = activeTab === 'regular' ? payments : manualPayments;
  const isManual = activeTab === 'manual';

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
          className="glass rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Pending Payments</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('regular')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'regular'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/70'
              }`}
            >
              Regular ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'manual'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/70'
              }`}
            >
              Manual ({manualPayments.length})
            </button>
          </div>

          {/* Payments List */}
          {loading ? (
            <div className="text-center py-8 text-white">Loading...</div>
          ) : displayPayments.length === 0 ? (
            <div className="text-center py-8 text-white/70">No pending payments</div>
          ) : (
            <div className="space-y-4">
              {displayPayments.map((payment) => (
                <motion.div
                  key={payment.id || payment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-4 bg-white/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">
                        User: {payment.user_id || payment.userId}
                      </p>
                      <p className="text-white/70 text-sm">
                        Txn ID: {payment.transaction_id || payment.transactionId}
                      </p>
                      <p className="text-white font-bold text-lg mt-1">
                        ₹{payment.amount || 0}
                      </p>
                    </div>
                    {(payment.screenshot_url || payment.screenshotPath) && (
                      <img
                        src={payment.screenshot_url || payment.screenshotPath}
                        alt="Screenshot"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(payment.id || payment._id, isManual)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition"
                    >
                      <Check className="w-4 h-4 inline mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(payment.id || payment._id, isManual, false)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition"
                    >
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Reject
                    </button>
                    {!isManual && (
                      <button
                        onClick={() => handleReject(payment.id || payment._id, false, true)}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition"
                      >
                        <AlertCircle className="w-4 h-4 inline mr-2" />
                        Fake
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

