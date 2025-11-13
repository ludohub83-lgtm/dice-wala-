'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, User, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, rejected

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from Firebase/Supabase
      // For now, show sample data
      const sampleData = [
        {
          id: '1',
          userId: 'user123',
          username: 'Player1',
          amount: 500,
          transactionId: 'TXN123456',
          status: 'approved',
          date: new Date().toISOString(),
          type: 'deposit'
        },
        {
          id: '2',
          userId: 'user456',
          username: 'Player2',
          amount: 1000,
          transactionId: 'TXN789012',
          status: 'rejected',
          date: new Date(Date.now() - 86400000).toISOString(),
          type: 'withdrawal'
        }
      ];
      
      const filtered = filter === 'all' 
        ? sampleData 
        : sampleData.filter(item => item.status === filter);
      
      setHistory(filtered);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-white mb-2">Payment History</h1>
            <p className="text-gray-300">View all payment transactions</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 mb-6"
        >
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Rejected
            </button>
          </div>
        </motion.div>

        {/* History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="glass rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/70">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-white/70">No payment history found</p>
            </div>
          ) : (
            history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      item.status === 'approved' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {item.status === 'approved' ? (
                        <CheckCircle className="text-green-400" size={24} />
                      ) : (
                        <XCircle className="text-red-400" size={24} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User size={16} className="text-white/60" />
                        <span className="text-white font-medium">{item.username}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar size={14} />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={16} className="text-white/60" />
                      <span className="text-white font-bold text-lg">₹{item.amount}</span>
                    </div>
                    <div className="text-sm text-white/60">
                      {item.transactionId}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
