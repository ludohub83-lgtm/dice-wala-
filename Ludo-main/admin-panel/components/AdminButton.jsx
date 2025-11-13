'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AdminButton({ item, onClick, badgeCount = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative w-full h-32 md:h-36 rounded-2xl
        bg-gradient-to-br ${item.gradient}
        shadow-lg hover:shadow-2xl
        transition-all duration-300
        overflow-hidden
        group
      `}
    >
      {/* Animated background overlay */}
      <motion.div
        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
        animate={{
          scale: isHovered ? 1.1 : 1,
          opacity: isHovered ? 0.1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 glass rounded-2xl" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <motion.div
            animate={{ rotate: isHovered ? [0, -10, 10, -10, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          {item.badge && badgeCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white/30 backdrop-blur-sm rounded-full px-2 py-1"
            >
              <span className="text-white text-xs font-bold">{badgeCount}</span>
            </motion.div>
          )}
        </div>
        <motion.p
          className="text-white font-bold text-sm md:text-base"
          animate={{ y: isHovered ? -2 : 0 }}
        >
          {item.label}
        </motion.p>
      </div>

      {/* Pulse effect for items with badges */}
      {item.badge && badgeCount > 0 && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-white/50"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
}

