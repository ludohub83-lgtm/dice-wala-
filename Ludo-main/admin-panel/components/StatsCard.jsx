'use client';

import { motion } from 'framer-motion';

export default function StatsCard({ label, value, color, loading = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        glass rounded-2xl p-6
        bg-gradient-to-br ${color}
        shadow-xl hover:shadow-2xl
        transition-shadow duration-300
      `}
    >
      <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-white/20 rounded animate-pulse" />
      ) : (
        <motion.p
          className="text-white text-3xl md:text-4xl font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          {value}
        </motion.p>
      )}
    </motion.div>
  );
}

