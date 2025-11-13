'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { fetchPaymentRequests } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VerifiedPaymentsModal({ onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await fetchPaymentRequests('Approved');
      setPayments(data || []);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
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
          className="glass rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Verified Payments</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-white">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-white/70">No verified payments</div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-4 bg-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        User: {payment.user_id}
                      </p>
                      <p className="text-white/70 text-sm">
                        Txn ID: {payment.transaction_id}
                      </p>
                      <p className="text-white font-bold text-lg mt-1">
                        ₹{payment.amount || 0}
                      </p>
                      <p className="text-green-400 text-sm mt-1">
                        Verified: {new Date(payment.verified_at || payment.created_at).toLocaleString()}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
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

