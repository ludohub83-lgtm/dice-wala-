"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import NextDynamic from 'next/dynamic';
import PaymentCard from '../../components/PaymentCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function PaymentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // Temporarily disable admin gate: make page visible without security
  const [authLoading, setAuthLoading] = useState(false);
  const [allowed, setAllowed] = useState(true);

  // Build-safe env guard
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
      .from('payment_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    if (!supabase) return;
    const { error: e1 } = await supabase.from('payment_requests').update({ status: 'approved' }).eq('id', id);
    if (!e1) {
      await fetch((process.env.NEXT_PUBLIC_BACKEND_BASE || '') + '/api/updateCoins', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_request_id: id })
      });
      await load();
    }
  };

  const markFake = async (id) => {
    if (!supabase) return;
    await supabase.from('payment_requests').update({ status: 'fake' }).eq('id', id);
    await load();
  };

  if (!hasEnv || !supabase) {
    return (
      <div className="p-6 text-orange-700">
        <div className="font-semibold mb-2">Payments disabled: Supabase env not configured.</div>
        <div className="text-sm">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project and redeploy.</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Payment Requests</h1>
      {loading && <div>Loading...</div>}
      <div className="grid gap-4">
        {items.map((it) => (
          <PaymentCard key={it.id} item={it} onApprove={() => approve(it.id)} onFake={() => markFake(it.id)} />
        ))}
        {!loading && items.length === 0 && (
          <div className="text-gray-500">No pending requests</div>
        )}
      </div>
    </div>
  );
}

export default NextDynamic(() => Promise.resolve(PaymentsPage), { ssr: false });
