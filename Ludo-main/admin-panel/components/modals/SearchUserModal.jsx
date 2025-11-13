'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User } from 'lucide-react';
import { searchUser } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SearchUserModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setSearching(true);
      const data = await searchUser(query);
      setResults(data || []);
      if (data.length === 0) {
        toast.info('No users found');
      }
    } catch (error) {
      toast.error('Failed to search users');
      setResults([]);
    } finally {
      setSearching(false);
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
            <h2 className="text-2xl font-bold text-white">Search User</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by email, username, or ID"
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              <Search className="w-5 h-5 inline mr-2" />
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((user, index) => (
                <motion.div
                  key={user.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-xl p-4 bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-8 h-8 text-white/70" />
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {user.email || user.id || 'Unknown'}
                      </p>
                      <p className="text-white/70 text-sm">
                        Coins: {user.coins || 0} | ID: {user.id || 'N/A'}
                      </p>
                    </div>
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

