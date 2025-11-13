'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, TrendingUp, Trophy, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get users
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('stats.totalMatches', 'desc'),
        limit(100)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setUsers(usersData);
      
      // Calculate stats
      const totalUsers = usersData.length;
      const totalMatches = usersData.reduce((sum, user) => sum + (user.stats?.totalMatches || 0), 0);
      const activeUsers = usersData.filter(user => {
        const lastActive = user.lastActive?.toDate?.();
        if (!lastActive) return false;
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return lastActive > dayAgo;
      }).length;
      
      setStats({ totalUsers, totalMatches, activeUsers });
      
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-purple-400" size={32} />
              <h1 className="text-3xl font-bold text-white">Users & Statistics</h1>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-400" size={24} />
                  <div>
                    <p className="text-white/60 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Target className="text-green-400" size={24} />
                  <div>
                    <p className="text-white/60 text-sm">Total Matches</p>
                    <p className="text-2xl font-bold text-white">{stats.totalMatches}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-orange-400" size={24} />
                  <div>
                    <p className="text-white/60 text-sm">Active (24h)</p>
                    <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">All Users</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-white/40 mb-4" size={48} />
              <p className="text-white/60">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/80 font-medium">User</th>
                    <th className="text-center py-3 px-4 text-white/80 font-medium">Matches</th>
                    <th className="text-center py-3 px-4 text-white/80 font-medium">Wins</th>
                    <th className="text-center py-3 px-4 text-white/80 font-medium">Losses</th>
                    <th className="text-center py-3 px-4 text-white/80 font-medium">Win Rate</th>
                    <th className="text-center py-3 px-4 text-white/80 font-medium">Streak</th>
                    <th className="text-right py-3 px-4 text-white/80 font-medium">Coins</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {user.displayName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.displayName || 'Unknown'}</p>
                            <p className="text-white/60 text-sm">{user.email || user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-white">
                        {user.stats?.totalMatches || 0}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-green-400 font-medium">
                          {user.stats?.wins || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-red-400 font-medium">
                          {user.stats?.losses || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-medium ${
                          (user.stats?.winRate || 0) >= 50 ? 'text-green-400' : 'text-orange-400'
                        }`}>
                          {user.stats?.winRate || 0}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Trophy className="text-yellow-400" size={16} />
                          <span className="text-white font-medium">
                            {user.stats?.currentStreak || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-yellow-400 font-bold">
                          {user.coins || 0}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
