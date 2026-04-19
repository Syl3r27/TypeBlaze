'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy, Zap, Target, BarChart3,
  TrendingUp, Clock, RefreshCw, LogOut, ArrowLeft,
  Keyboard, ChevronDown,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface HistoryResult {
  _id: string; wpm: number; accuracy: number; errors: number;
  duration: number; mode: string; wordCount: number; createdAt: string;
}
interface LeaderboardEntry {
  _id: string; wpm: number; accuracy: number;
  userId?: { username: string }; createdAt: string;
}

function buildHeatmapData(results: HistoryResult[]): Map<string, number> {
  const map = new Map<string, number>();
  results.forEach(r => {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return map;
}

function getHeatColor(count: number, max: number): string {
  if (count === 0) return '#222240';
  const pct = count / Math.max(max, 1);
  if (pct < 0.25) return '#3D1050';
  if (pct < 0.5) return '#7A1080';
  if (pct < 0.75) return '#CC2090';
  return '#FF2D95';
}

function getLast12MonthsWeeks() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() - 364);
  startDay.setDate(startDay.getDate() - startDay.getDay());
  const weeks: Date[][] = [];
  let cur = new Date(startDay);
  while (cur <= end) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) { week.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    weeks.push(week);
  }
  return weeks;
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ProfilePage() {
  const { user, token, isLoggedIn, logout } = useAuth();
  const { recentResults } = useStore();
  const [history, setHistory] = useState<HistoryResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'leaderboard'>('stats');

  const fetchHistory = useCallback(async () => {
    if (!token) return; setLoading(true);
    try { const res = await fetch(`${API}/stats/history?limit=100`, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); if (data.success) setHistory(data.results); } catch {}
    setLoading(false);
  }, [token]);

  const fetchLeaderboard = useCallback(async () => {
    try { const res = await fetch(`${API}/stats/leaderboard`); const data = await res.json(); if (data.success) setLeaderboard(data.results); } catch {}
  }, []);

  useEffect(() => { fetchHistory(); fetchLeaderboard(); }, [fetchHistory, fetchLeaderboard]);

  const allResults: HistoryResult[] = useMemo(() => {
    if (isLoggedIn && history.length > 0) return history;
    return recentResults.map((r, i) => ({ _id: String(i), wpm: r.wpm, accuracy: r.accuracy, errors: r.errors, duration: r.duration, mode: r.mode, wordCount: r.wordCount, createdAt: new Date().toISOString() }));
  }, [isLoggedIn, history, recentResults]);

  const stats = useMemo(() => {
    const src = isLoggedIn ? user?.stats : (
      allResults.length > 0 ? { totalTests: allResults.length, bestWpm: Math.max(...allResults.map(r => r.wpm)), avgWpm: Math.round(allResults.reduce((a, r) => a + r.wpm, 0) / allResults.length), avgAccuracy: Math.round(allResults.reduce((a, r) => a + r.accuracy, 0) / allResults.length), totalTime: allResults.reduce((a, r) => a + r.duration, 0) } : null
    );
    return src;
  }, [isLoggedIn, user, allResults]);

  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 text-text-secondary hover:text-white hover:bg-surface transition-colors border-2 border-black">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 border-[3px] border-accent flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="font-pixel text-sm text-white">{isLoggedIn ? user?.username : 'GUEST'}</h1>
                <p className="text-xs text-text-secondary">{isLoggedIn ? user?.email : 'Playing as guest · sign in to save progress'}</p>
              </div>
            </div>
          </div>
          {isLoggedIn && (
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-surface transition-colors border-2 border-black">
              <LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline font-pixel text-[8px]">SIGN OUT</span>
            </button>
          )}
        </div>

        {!isLoggedIn && (
          <div className="brutal-card-pink p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="font-pixel text-[10px] text-white mb-0.5">CREATE A FREE ACCOUNT</p>
              <p className="text-sm text-text-secondary">Save stats permanently, appear on the global leaderboard</p>
            </div>
            <Link href="/" className="btn-brutal px-5 py-2.5 bg-accent text-black font-pixel text-[8px] whitespace-nowrap">SIGN UP FREE</Link>
          </div>
        )}

        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard icon={<Trophy className="w-4 h-4" />} label="BEST WPM" value={String(stats.bestWpm ?? 0)} gold />
            <StatCard icon={<Zap className="w-4 h-4" />} label="AVG WPM" value={String(stats.avgWpm ?? 0)} />
            <StatCard icon={<Target className="w-4 h-4" />} label="ACCURACY" value={`${stats.avgAccuracy ?? 0}%`} />
            <StatCard icon={<BarChart3 className="w-4 h-4" />} label="TESTS" value={String(stats.totalTests ?? 0)} />
          </div>
        ) : !loading && (
          <div className="brutal-card p-10 text-center mb-6">
            <BarChart3 className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">No tests yet. <Link href="/test" className="text-accent hover:underline">Take your first test →</Link></p>
          </div>
        )}

        {allResults.length > 0 && <ActivityHeatmap results={allResults} />}

        <div className="flex gap-1 bg-surface border-[3px] border-black p-1 mb-4">
          {(['stats', 'history', 'leaderboard'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={cn('flex-1 py-2 font-pixel text-[8px] uppercase transition-all',
                activeTab === t ? 'bg-accent text-black shadow-brutal-sm' : 'text-text-secondary hover:text-white')}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && <StatsTab results={allResults} />}
        {activeTab === 'history' && <HistoryTab results={allResults} loading={loading} onRefresh={fetchHistory} isLoggedIn={isLoggedIn} />}
        {activeTab === 'leaderboard' && <LeaderboardTab entries={leaderboard} currentUsername={user?.username} />}
      </div>
    </main>
  );
}

function ActivityHeatmap({ results }: { results: HistoryResult[] }) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const heatData = useMemo(() => buildHeatmapData(results), [results]);
  const weeks = useMemo(() => getLast12MonthsWeeks(), []);
  const maxCount = useMemo(() => Math.max(...Array.from(heatData.values()), 1), [heatData]);
  const total = useMemo(() => results.length, [results]);
  const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const months: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => { const m = week[0].getMonth(); if (m !== lastMonth) { months.push({ label: week[0].toLocaleString('en', { month: 'short' }), col: wi }); lastMonth = m; } });

  return (
    <div className="brutal-card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-pixel text-white">ACTIVITY</span>
          <span className="text-[8px] text-text-secondary font-pixel">{total} TESTS</span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] text-text-secondary font-pixel">
          <span>LESS</span>
          {['#222240', '#3D1050', '#7A1080', '#CC2090', '#FF2D95'].map(c => (
            <span key={c} className="w-2.5 h-2.5 inline-block border border-black" style={{ backgroundColor: c }} />
          ))}
          <span>MORE</span>
        </div>
      </div>
      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: `${weeks.length * 13}px` }}>
          <div className="flex mb-1" style={{ paddingLeft: '28px' }}>
            {weeks.map((_, wi) => { const m = months.find(m => m.col === wi); return (<div key={wi} style={{ width: '13px', flexShrink: 0 }} className="text-[9px] text-text-secondary font-mono overflow-visible whitespace-nowrap">{m ? m.label : ''}</div>); })}
          </div>
          <div className="flex gap-0">
            <div className="flex flex-col mr-1" style={{ width: '24px' }}>
              {DAYS.map((d, i) => (<div key={i} style={{ height: '11px', marginBottom: '2px' }} className="text-[9px] text-text-secondary font-mono flex items-center justify-end pr-1">{d}</div>))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ marginRight: '2px' }}>
                {week.map((day, di) => {
                  const key = isoDate(day); const count = heatData.get(key) ?? 0; const color = getHeatColor(count, maxCount); const isFuture = day > new Date();
                  return (<div key={di} style={{ width: '11px', height: '11px', marginBottom: '2px', backgroundColor: isFuture ? 'transparent' : color, opacity: isFuture ? 0 : 1, cursor: count > 0 ? 'pointer' : 'default', border: isFuture ? 'none' : '1px solid #000' }}
                    onMouseEnter={e => { if (count > 0 || !isFuture) { const rect = (e.target as HTMLElement).getBoundingClientRect(); setTooltip({ date: key, count, x: rect.left, y: rect.top }); } }}
                    onMouseLeave={() => setTooltip(null)} />);
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {tooltip && (
        <div className="fixed z-50 pointer-events-none bg-surface border-2 border-black px-2.5 py-1.5 text-[8px] font-pixel text-white shadow-brutal-sm"
          style={{ left: tooltip.x, top: tooltip.y - 40 }}>
          {tooltip.count === 0 ? `No tests · ${tooltip.date}` : `${tooltip.count} test${tooltip.count > 1 ? 's' : ''} · ${tooltip.date}`}
        </div>
      )}
      <p className="text-[8px] text-text-tertiary font-pixel mt-3 text-center">ACTIVITY DATA IS BASED ON LOCAL TIME</p>
    </div>
  );
}

function StatsTab({ results }: { results: HistoryResult[] }) {
  if (results.length === 0) return (<div className="brutal-card p-10 text-center"><p className="text-text-secondary text-sm">Complete some tests to see your charts.</p></div>);
  const last20 = [...results].slice(0, 20).reverse();
  const maxWpm = Math.max(...last20.map(r => r.wpm), 1);

  return (
    <div className="space-y-4">
      <div className="brutal-card p-6">
        <div className="flex items-center gap-2 text-[10px] font-pixel text-white mb-5"><TrendingUp className="w-4 h-4 text-accent" />WPM — LAST {last20.length} TESTS</div>
        <div className="flex items-end gap-1.5 h-28">
          {last20.map((r, i) => { const pct = Math.max((r.wpm / maxWpm) * 100, 3); return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface border-2 border-black px-1.5 py-0.5 text-[8px] font-pixel text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">{r.wpm} WPM</div>
              <div className="w-full hover:bg-accent transition-colors border-t-2 border-black" style={{ height: `${pct}%`, backgroundColor: '#FF2D9599' }} />
            </div>); })}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          {last20.map((r, i) => (<div key={i} className="flex-1 text-center text-[8px] text-text-tertiary font-pixel">{i === 0 ? 'OLD' : i === last20.length - 1 ? 'NEW' : ''}</div>))}
        </div>
      </div>

      <div className="brutal-card p-6">
        <div className="flex items-center gap-2 text-[10px] font-pixel text-white mb-5"><Target className="w-4 h-4 text-accent2" />ACCURACY TREND</div>
        <div className="flex items-end gap-1.5 h-20">
          {last20.map((r, i) => { const pct = Math.max(r.accuracy, 2); const color = r.accuracy >= 95 ? '#39FF14' : r.accuracy >= 85 ? '#00E5FF' : '#FF3333'; return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface border-2 border-black px-1.5 py-0.5 text-[8px] font-pixel text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">{r.accuracy}%</div>
              <div className="w-full border-t-2 border-black" style={{ height: `${pct}%`, backgroundColor: color + 'bb' }} />
            </div>); })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Best (recent)', value: `${Math.max(...last20.map(r => r.wpm))} wpm` },
          { label: 'Avg accuracy', value: `${Math.round(last20.reduce((a,r) => a + r.accuracy, 0) / last20.length)}%` },
          { label: 'Total time', value: formatTime(last20.reduce((a,r) => a + r.duration, 0)) },
        ].map(s => (
          <div key={s.label} className="brutal-card p-4 text-center">
            <div className="text-lg font-pixel text-white">{s.value}</div>
            <div className="text-[8px] text-text-secondary mt-0.5 font-pixel">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({ results, loading, onRefresh, isLoggedIn }: { results: HistoryResult[]; loading: boolean; onRefresh: () => void; isLoggedIn: boolean; }) {
  if (loading) return (<div className="brutal-card p-12 flex justify-center"><div className="w-5 h-5 border-[3px] border-accent border-t-transparent animate-spin" /></div>);
  if (results.length === 0) return (
    <div className="brutal-card p-10 text-center">
      <Clock className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
      <p className="text-text-secondary text-sm">No history yet.</p>
      <Link href="/test" className="inline-block mt-3 text-sm text-accent hover:underline">Take a test →</Link>
    </div>
  );
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[8px] text-text-secondary font-pixel">{results.length} RESULTS</span>
        {isLoggedIn && (<button onClick={onRefresh} className="flex items-center gap-1 text-[8px] text-text-secondary hover:text-white transition-colors font-pixel"><RefreshCw className="w-3 h-3" /> REFRESH</button>)}
      </div>
      {results.map((r, i) => {
        const grade = r.wpm >= 80 ? 'S' : r.wpm >= 60 ? 'A' : r.wpm >= 40 ? 'B' : r.wpm >= 20 ? 'C' : 'D';
        const gradeColor = grade === 'S' ? '#FF2D95' : grade === 'A' ? '#39FF14' : grade === 'B' ? '#00E5FF' : '#C0A0FF';
        return (
          <div key={r._id || i} className="brutal-card p-4 flex items-center gap-4 transition-colors hover:shadow-brutal-lg">
            <div className="text-lg font-pixel w-7 text-center flex-shrink-0" style={{ color: gradeColor }}>{grade}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-pixel text-accent">{r.wpm}</span>
                <span className="text-[8px] text-text-secondary font-pixel">WPM</span>
                <span className="text-[8px] text-white font-pixel">{r.accuracy}%</span>
              </div>
              <div className="flex items-center gap-2 text-[8px] text-text-secondary mt-0.5 font-pixel flex-wrap">
                <span>{r.mode}S</span><span className="text-text-tertiary">·</span><span>{r.wordCount} WORDS</span>
                {r.errors > 0 && <><span className="text-text-tertiary">·</span><span className="text-text-error">{r.errors} ERR</span></>}
              </div>
            </div>
            <div className="text-[8px] text-text-tertiary font-pixel flex-shrink-0">{formatDate(r.createdAt)}</div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardTab({ entries, currentUsername }: { entries: LeaderboardEntry[]; currentUsername?: string }) {
  if (entries.length === 0) return (
    <div className="brutal-card p-10 text-center">
      <Trophy className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
      <p className="text-text-secondary text-sm">No scores yet. Be the first!</p>
    </div>
  );
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="space-y-2">
      {entries.map((e, i) => {
        const isMe = e.userId?.username === currentUsername;
        return (
          <div key={e._id} className={cn('flex items-center gap-4 p-3 border-2 border-black transition-colors',
            isMe ? 'bg-accent/10 border-accent' : 'bg-surface')}>
            <div className="w-8 text-center flex-shrink-0">
              {i < 3 ? <span className="text-lg">{medals[i]}</span> : <span className="text-[8px] font-pixel text-text-secondary">#{i+1}</span>}
            </div>
            <div className={cn('flex-1 font-medium', isMe ? 'text-accent' : 'text-white')}>
              {e.userId?.username ?? 'Anonymous'}
              {isMe && <span className="text-[8px] text-text-secondary font-pixel ml-1">(YOU)</span>}
            </div>
            <div className="text-right">
              <div className="font-pixel text-sm text-accent">{e.wpm}</div>
              <div className="text-[8px] text-text-secondary font-pixel">{e.accuracy}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon, label, value, gold }: { icon: React.ReactNode; label: string; value: string; gold?: boolean }) {
  return (
    <div className={cn('p-4 border-[3px] border-black', gold ? 'bg-accent/10 border-accent shadow-brutal-accent' : 'bg-surface shadow-brutal')}>
      <div className={cn('mb-2', gold ? 'text-accent' : 'text-text-secondary')}>{icon}</div>
      <div className={cn('text-xl font-pixel', gold ? 'text-accent' : 'text-white')}>{value}</div>
      <div className="text-[8px] text-text-secondary mt-0.5 font-pixel">{label}</div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso); const now = new Date();
  const m = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(s: number): string {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
