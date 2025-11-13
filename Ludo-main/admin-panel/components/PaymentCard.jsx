"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function PaymentCard({ item, onApprove, onFake }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow rounded-lg p-4 border hover:shadow-md transition"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">User: {item.user_id}</div>
          <div className="text-sm text-gray-600">Txn: {item.transaction_id}</div>
          <div className="text-sm text-gray-600">Amount: ₹{item.amount}</div>
          <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</div>
        </div>
        {item.screenshot_url ? (
          <img src={item.screenshot_url} alt="screenshot" className="w-40 h-28 object-contain rounded border" />
        ) : null}
      </div>
      <div className="flex gap-3 mt-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onApprove}
          className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          ✅ Approve
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onFake}
          className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          ❌ Fake
        </motion.button>
      </div>
    </motion.div>
  );
}
