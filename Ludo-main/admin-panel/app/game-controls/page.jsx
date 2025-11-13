"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function GameControlsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({
    ai_difficulty: 'normal',
    game_difficulty: 'normal', // Add game difficulty control
    entry_fee_coin: 0,
    daily_bonus_coin: 0,
    bot_fill_ratio: 0,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/app-config', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load');
        if (mounted) setForm({
          ai_difficulty: data.ai_difficulty || 'normal',
          game_difficulty: data.game_difficulty || data.ai_difficulty || 'normal',
          entry_fee_coin: Number(data.entry_fee_coin || 0),
          daily_bonus_coin: Number(data.daily_bonus_coin || 0),
          bot_fill_ratio: Number(data.bot_fill_ratio || 0),
        });
      } catch (e) {
        setError(e.message || 'Failed to load config');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const save = async () => {
    setSaving(true); setError(""); setOk("");
    try {
      const res = await fetch('/api/app-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_difficulty: form.ai_difficulty,
          game_difficulty: form.game_difficulty,
          entry_fee_coin: Number(form.entry_fee_coin || 0),
          daily_bonus_coin: Number(form.daily_bonus_coin || 0),
          bot_fill_ratio: Number(form.bot_fill_ratio || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Save failed');
      setOk('Saved');
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-3xl font-bold text-white">Game Controls</h1>
        </div>
      {loading ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="text-white">Loading game settings...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="glass-card rounded-2xl p-4 bg-red-500/20 border border-red-500/50">
              <div className="text-red-300 text-sm font-semibold">{error}</div>
            </div>
          )}
          {ok && (
            <div className="glass-card rounded-2xl p-4 bg-green-500/20 border border-green-500/50">
              <div className="text-green-300 text-sm font-semibold">✓ {ok} successfully!</div>
            </div>
          )}

          {/* AI Difficulty */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-2">AI Difficulty</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
              value={form.ai_difficulty}
              onChange={(e) => setForm((f) => ({ ...f, ai_difficulty: e.target.value }))}
            >
              <option value="easy" className="bg-slate-800">Easy</option>
              <option value="normal" className="bg-slate-800">Normal</option>
              <option value="hard" className="bg-slate-800">Hard</option>
              <option value="expert" className="bg-slate-800">Expert</option>
            </select>
            <p className="text-xs text-gray-400 mt-2">Controls AI opponent behavior and difficulty</p>
          </div>

          {/* Game Difficulty */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-2">Game Difficulty (Overall)</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
              value={form.game_difficulty}
              onChange={(e) => setForm((f) => ({ ...f, game_difficulty: e.target.value }))}
            >
              <option value="easy" className="bg-slate-800">Easy - More forgiving, lower rewards</option>
              <option value="normal" className="bg-slate-800">Normal - Balanced gameplay</option>
              <option value="hard" className="bg-slate-800">Hard - Challenging, higher rewards</option>
              <option value="expert" className="bg-slate-800">Expert - Very challenging, best rewards</option>
            </select>
            <p className="text-xs text-gray-400 mt-2">
              Controls overall game difficulty affecting dice rolls, capture chances, and win bonuses
            </p>
          </div>

          {/* Entry Fee */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-2">Entry Fee (coins)</label>
            <input 
              type="number" 
              min="0"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-green-500" 
              value={form.entry_fee_coin}
              onChange={(e) => setForm((f) => ({ ...f, entry_fee_coin: Number(e.target.value || 0) }))} 
            />
            <p className="text-xs text-gray-400 mt-2">Default entry fee for online games</p>
          </div>

          {/* Daily Bonus */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-2">Daily Bonus (coins)</label>
            <input 
              type="number" 
              min="0"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-green-500" 
              value={form.daily_bonus_coin}
              onChange={(e) => setForm((f) => ({ ...f, daily_bonus_coin: Number(e.target.value || 0) }))} 
            />
            <p className="text-xs text-gray-400 mt-2">Coins given to users daily as bonus</p>
          </div>

          {/* Bot Fill Ratio */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-2">Bot Fill Ratio (%)</label>
            <input 
              type="number" 
              min={0} 
              max={100} 
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500" 
              value={form.bot_fill_ratio}
              onChange={(e) => setForm((f) => ({ ...f, bot_fill_ratio: Math.min(100, Math.max(0, Number(e.target.value || 0))) }))} 
            />
            <p className="text-xs text-gray-400 mt-2">Percentage of games that will be filled with bots if players are waiting</p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button 
              disabled={saving} 
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50" 
              onClick={save}
            >
              {saving ? 'Saving…' : '💾 Save Settings'}
            </button>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
