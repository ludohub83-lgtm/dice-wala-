'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminDashboard from '@/components/AdminDashboard';
import { getAdminStats } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Home() {
  const [stats, setStats] = useState({
    pendingPayments: 0,
    pendingManualPayments: 0,
    pendingWithdraws: 0,
    totalNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load stats');
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative z-10">
        <AdminDashboard stats={stats} loading={loading} onRefresh={loadStats} />
      </div>
    </main>
  );
}

