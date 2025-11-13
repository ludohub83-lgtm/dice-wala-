'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Users, DollarSign, Activity, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from Firebase/Supabase
      // Sample data for now
      setStats({
        totalRevenue: 125000,
        totalUsers: 1250,
        activeUsers: 850,
        totalTransactions: 3420,
        avgTransactionValue: 365,
        growthRate: 12.5,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Report exported successfully!');
  };

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-6 hover:bg-white/10 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full bg-gradient-to-r ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
        {change && (
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
                <p className="text-gray-300">Track performance and insights</p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Download size={20} />
                Export Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* Time Range Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 mb-6"
        >
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === 'week'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === 'month'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === 'year'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              This Year
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {loading ? (
          <div className="glass rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading analytics...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              change={stats.growthRate}
              color="from-green-500 to-emerald-600"
            />
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers.toLocaleString()}
              change={8.2}
              color="from-blue-500 to-cyan-600"
            />
            <StatCard
              icon={Activity}
              label="Active Users"
              value={stats.activeUsers.toLocaleString()}
              change={5.7}
              color="from-purple-500 to-pink-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Transactions"
              value={stats.totalTransactions.toLocaleString()}
              change={15.3}
              color="from-orange-500 to-red-600"
            />
            <StatCard
              icon={DollarSign}
              label="Avg Transaction"
              value={`₹${stats.avgTransactionValue}`}
              change={3.1}
              color="from-teal-500 to-green-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Growth Rate"
              value={`${stats.growthRate}%`}
              change={stats.growthRate}
              color="from-indigo-500 to-purple-600"
            />
          </motion.div>
        )}

        {/* Charts Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 glass rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Revenue Trend</h2>
          <div className="h-64 flex items-center justify-center text-white/60">
            <p>Chart visualization coming soon...</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
