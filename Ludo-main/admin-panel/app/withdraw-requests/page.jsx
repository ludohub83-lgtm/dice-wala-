"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function WithdrawRequestsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasEnv = Boolean(SUPABASE_URL && SUPABASE_ANON);
  const supabase = useMemo(() => {
    if (!hasEnv) return null;
    try { return createClient(SUPABASE_URL, SUPABASE_ANON); } catch { return null; }
  }, [hasEnv, SUPABASE_URL, SUPABASE_ANON]);

  const load = async () => {
    setLoading(true);
    if (!supabase) { setItems([]); setLoading(false); return; }
    const { data } = await supabase
      .from('withdraw_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    if (!supabase) return;
    await supabase.from('withdraw_requests').update({ status: 'approved' }).eq('id', id);
    await load();
  };

  const markFake = async (id) => {
    if (!supabase) return;
    await supabase.from('withdraw_requests').update({ status: 'fake' }).eq('id', id);
    await load();
  };

  if (!hasEnv || !supabase) {
    return (
      <div className="p-6 text-orange-700">
        <div className="font-semibold mb-2">Withdraws disabled: Supabase env not configured.</div>
        <div className="text-sm">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project and redeploy.</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Withdraw Requests</h1>
      {loading && <div>Loading...</div>}
      <div className="grid gap-4">
        {items.map((it) => (
          <div key={it.id} className="bg-white shadow rounded-lg p-4 border">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">User: {it.user_id}</div>
                <div className="text-sm text-gray-600">Amount: ₹{it.amount}</div>
                {it.method && <div className="text-sm text-gray-600">Method: {it.method}</div>}
                <div className="text-xs text-gray-500">{new Date(it.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={() => approve(it.id)} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">✅ Approve</button>
              <button onClick={() => markFake(it.id)} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">❌ Fake</button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="text-gray-500">No pending withdraw requests</div>
        )}
      </div>
    </div>
  );
}
