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
  _id: string;
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  mode: string;
  wordCount: number;
  createdAt: string;
}

interface LeaderboardEntry {
  _id: string;
  wpm: number;
  accuracy: number;
  userId?: { username: string };
  createdAt: string;
}

// ── Heatmap helpers ────────────────────────────────────────────

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
  if (count === 0) return '#1a1a1a';
  const pct = count / Math.max(max, 1);
  if (pct < 0.25) return '#3d3000';
  if (pct < 0.5)  return '#7a6000';
  if (pct < 0.75) return '#b38c00';
  return '#e2b714';
}

function getLast12MonthsWeeks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);

  // Align to Sunday
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() - 364);
  startDay.setDate(startDay.getDate() - startDay.getDay()); // go back to Sunday

  const weeks: Date[][] = [];
  let cur = new Date(startDay);

  while (cur <= end) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Page ────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, token, isLoggedIn, logout } = useAuth();
  const { recentResults } = useStore();

  const [history, setHistory]         = useState<HistoryResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading]         = useState(false);
  const [activeTab, setActiveTab]     = useState<'stats' | 'history' | 'leaderboard'>('stats');

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/stats/history?limit=100`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setHistory(data.results);
    } catch {}
    setLoading(false);
  }, [token]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/stats/leaderboard`);
      const data = await res.json();
      if (data.success) setLeaderboard(data.results);
    } catch {}
  }, []);

  useEffect(() => { fetchHistory(); fetchLeaderboard(); }, [fetchHistory, fetchLeaderboard]);

  // Normalise to a common shape
  const allResults: HistoryResult[] = useMemo(() => {
    if (isLoggedIn && history.length > 0) return history;
    return recentResults.map((r, i) => ({
      _id: String(i),
      wpm: r.wpm,
      accuracy: r.accuracy,
      errors: r.errors,
      duration: r.duration,
      mode: r.mode,
      wordCount: r.wordCount,
      createdAt: new Date().toISOString(),
    }));
  }, [isLoggedIn, history, recentResults]);

  const stats = useMemo(() => {
    const src = isLoggedIn ? user?.stats : (
      allResults.length > 0 ? {
        totalTests:   allResults.length,
        bestWpm:      Math.max(...allResults.map(r => r.wpm)),
        avgWpm:       Math.round(allResults.reduce((a, r) => a + r.wpm, 0) / allResults.length),
        avgAccuracy:  Math.round(allResults.reduce((a, r) => a + r.accuracy, 0) / allResults.length),
        totalTime:    allResults.reduce((a, r) => a + r.duration, 0),
      } : null
    );
    return src;
  }, [isLoggedIn, user, allResults]);

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg text-[#646669] hover:text-[#d1d0c5] hover:bg-[#242424] transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e2b714]/10 border border-[#e2b714]/20 flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-[#e2b714]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#d1d0c5]">
                  {isLoggedIn ? user?.username : 'Guest'}
                </h1>
                <p className="text-xs text-[#646669]">
                  {isLoggedIn ? user?.email : 'Playing as guest · sign in to save progress'}
                </p>
              </div>
            </div>
          </div>
          {isLoggedIn && (
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#646669] hover:text-[#d1d0c5] hover:bg-[#242424] rounded-lg transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </div>

        {/* ── Guest CTA ── */}
        {!isLoggedIn && (
          <div className="bg-[#1a1a1a] border border-[#e2b714]/20 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="font-semibold text-[#d1d0c5] mb-0.5">Create a free account</p>
              <p className="text-sm text-[#646669]">Save stats permanently, appear on the global leaderboard</p>
            </div>
            <Link href="/" className="px-5 py-2.5 bg-[#e2b714] text-[#0f0f0f] text-sm font-bold rounded-xl hover:bg-[#f0ca2d] transition-colors whitespace-nowrap">
              Sign Up Free
            </Link>
          </div>
        )}

        {/* ── Stat cards ── */}
        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard icon={<Trophy className="w-4 h-4" />}  label="Best WPM"   value={String(stats.bestWpm  ?? 0)} gold />
            <StatCard icon={<Zap className="w-4 h-4" />}     label="Avg WPM"    value={String(stats.avgWpm   ?? 0)} />
            <StatCard icon={<Target className="w-4 h-4" />}  label="Accuracy"   value={`${stats.avgAccuracy ?? 0}%`} />
            <StatCard icon={<BarChart3 className="w-4 h-4"/>} label="Tests"     value={String(stats.totalTests ?? 0)} />
          </div>
        ) : !loading && (
          <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-10 text-center mb-6">
            <BarChart3 className="w-10 h-10 text-[#3a3a3c] mx-auto mb-3" />
            <p className="text-[#646669] text-sm">
              No tests yet.{' '}
              <Link href="/test" className="text-[#e2b714] hover:underline">Take your first test →</Link>
            </p>
          </div>
        )}

        {/* ── Activity heatmap ── */}
        {allResults.length > 0 && (
          <ActivityHeatmap results={allResults} />
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-[#171717] border border-white/5 rounded-xl p-1 mb-4">
          {(['stats', 'history', 'leaderboard'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all',
                activeTab === t ? 'bg-[#e2b714] text-[#0f0f0f] shadow' : 'text-[#646669] hover:text-[#d1d0c5]'
              )}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'stats'       && <StatsTab       results={allResults} />}
        {activeTab === 'history'     && <HistoryTab     results={allResults} loading={loading} onRefresh={fetchHistory} isLoggedIn={isLoggedIn} />}
        {activeTab === 'leaderboard' && <LeaderboardTab entries={leaderboard} currentUsername={user?.username} />}
      </div>
    </main>
  );
}

// ── Activity Heatmap ────────────────────────────────────────────

function ActivityHeatmap({ results }: { results: HistoryResult[] }) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const heatData = useMemo(() => buildHeatmapData(results), [results]);
  const weeks    = useMemo(() => getLast12MonthsWeeks(), []);
  const maxCount = useMemo(() => Math.max(...Array.from(heatData.values()), 1), [heatData]);
  const total    = useMemo(() => results.length, [results]);

  const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const months: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const m = week[0].getMonth();
    if (m !== lastMonth) {
      months.push({ label: week[0].toLocaleString('en', { month: 'short' }), col: wi });
      lastMonth = m;
    }
  });

  return (
    <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#d1d0c5]">Activity</span>
          <span className="text-xs text-[#646669] font-mono">{total} tests in the last year</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#646669]">
          <span>less</span>
          {['#1a1a1a', '#3d3000', '#7a6000', '#b38c00', '#e2b714'].map(c => (
            <span key={c} className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: c }} />
          ))}
          <span>more</span>
        </div>
      </div>

      {/* Grid wrapper — horizontally scrollable on mobile */}
      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: `${weeks.length * 13}px` }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: '28px' }}>
            {weeks.map((_, wi) => {
              const m = months.find(m => m.col === wi);
              return (
                <div key={wi} style={{ width: '13px', flexShrink: 0 }}
                  className="text-[9px] text-[#646669] font-mono overflow-visible whitespace-nowrap">
                  {m ? m.label : ''}
                </div>
              );
            })}
          </div>

          {/* Day rows */}
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col mr-1" style={{ width: '24px' }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{ height: '11px', marginBottom: '2px' }}
                  className="text-[9px] text-[#646669] font-mono flex items-center justify-end pr-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ marginRight: '2px' }}>
                {week.map((day, di) => {
                  const key   = isoDate(day);
                  const count = heatData.get(key) ?? 0;
                  const color = getHeatColor(count, maxCount);
                  const isFuture = day > new Date();
                  return (
                    <div
                      key={di}
                      style={{
                        width: '11px', height: '11px', marginBottom: '2px',
                        backgroundColor: isFuture ? 'transparent' : color,
                        borderRadius: '2px',
                        opacity: isFuture ? 0 : 1,
                        cursor: count > 0 ? 'pointer' : 'default',
                      }}
                      onMouseEnter={e => {
                        if (count > 0 || !isFuture) {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({ date: key, count, x: rect.left, y: rect.top });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-[#242424] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#d1d0c5] shadow-xl"
          style={{ left: tooltip.x, top: tooltip.y - 40 }}
        >
          {tooltip.count === 0
            ? `No tests · ${tooltip.date}`
            : `${tooltip.count} test${tooltip.count > 1 ? 's' : ''} · ${tooltip.date}`}
        </div>
      )}

      <p className="text-[10px] text-[#3a3a3c] font-mono mt-3 text-center">
        Activity data is based on local time
      </p>
    </div>
  );
}

// ── Stats Tab ───────────────────────────────────────────────────

function StatsTab({ results }: { results: HistoryResult[] }) {
  if (results.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-10 text-center">
        <p className="text-[#646669] text-sm">Complete some tests to see your charts.</p>
      </div>
    );
  }

  const last20  = [...results].slice(0, 20).reverse();
  const maxWpm  = Math.max(...last20.map(r => r.wpm), 1);

  return (
    <div className="space-y-4">
      {/* WPM chart */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-[#d1d0c5] mb-5">
          <TrendingUp className="w-4 h-4 text-[#e2b714]" />
          WPM — last {last20.length} tests
        </div>
        <div className="flex items-end gap-1.5 h-28">
          {last20.map((r, i) => {
            const pct = Math.max((r.wpm / maxWpm) * 100, 3);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Hover tooltip */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#242424] border border-white/10 rounded-md px-1.5 py-0.5 text-[10px] font-mono text-[#d1d0c5] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {r.wpm} wpm
                </div>
                <div
                  className="w-full rounded-t bg-[#e2b714]/60 hover:bg-[#e2b714] transition-colors"
                  style={{ height: `${pct}%` }}
                />
              </div>
            );
          })}
        </div>
        {/* X-axis labels */}
        <div className="flex items-center gap-1.5 mt-2">
          {last20.map((r, i) => (
            <div key={i} className="flex-1 text-center text-[9px] text-[#3a3a3c] font-mono">
              {i === 0 ? 'oldest' : i === last20.length - 1 ? 'latest' : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy chart */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-[#d1d0c5] mb-5">
          <Target className="w-4 h-4 text-[#e2b714]" />
          Accuracy trend
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {last20.map((r, i) => {
            const pct   = Math.max(r.accuracy, 2);
            const color = r.accuracy >= 95 ? '#4caf79' : r.accuracy >= 85 ? '#e2b714' : '#ca4754';
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#242424] border border-white/10 rounded-md px-1.5 py-0.5 text-[10px] font-mono text-[#d1d0c5] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {r.accuracy}%
                </div>
                <div
                  className="w-full rounded-t"
                  style={{ height: `${pct}%`, backgroundColor: color + 'bb' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Best (recent)', value: `${Math.max(...last20.map(r => r.wpm))} wpm` },
          { label: 'Avg accuracy',  value: `${Math.round(last20.reduce((a,r) => a + r.accuracy, 0) / last20.length)}%` },
          { label: 'Total time',    value: formatTime(last20.reduce((a,r) => a + r.duration, 0)) },
        ].map(s => (
          <div key={s.label} className="bg-[#171717] border border-white/5 rounded-xl p-4 text-center">
            <div className="text-lg font-mono font-bold text-[#d1d0c5]">{s.value}</div>
            <div className="text-xs text-[#646669] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── History Tab ─────────────────────────────────────────────────

function HistoryTab({ results, loading, onRefresh, isLoggedIn }: {
  results: HistoryResult[]; loading: boolean; onRefresh: () => void; isLoggedIn: boolean;
}) {
  if (loading) return (
    <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-12 flex justify-center">
      <div className="w-5 h-5 border-2 border-[#e2b714] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (results.length === 0) return (
    <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-10 text-center">
      <Clock className="w-8 h-8 text-[#3a3a3c] mx-auto mb-3" />
      <p className="text-[#646669] text-sm">No history yet.</p>
      <Link href="/test" className="inline-block mt-3 text-sm text-[#e2b714] hover:underline">Take a test →</Link>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-[#646669] font-mono">{results.length} results</span>
        {isLoggedIn && (
          <button onClick={onRefresh} className="flex items-center gap-1 text-xs text-[#646669] hover:text-[#d1d0c5] transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        )}
      </div>

      {results.map((r, i) => {
        const grade      = r.wpm >= 80 ? 'S' : r.wpm >= 60 ? 'A' : r.wpm >= 40 ? 'B' : r.wpm >= 20 ? 'C' : 'D';
        const gradeColor = grade === 'S' ? '#e2b714' : grade === 'A' ? '#4caf79' : grade === 'B' ? '#5c8ee2' : '#646669';
        return (
          <div key={r._id || i}
            className="bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center gap-4 transition-colors">
            <div className="text-lg font-mono font-bold w-7 text-center flex-shrink-0" style={{ color: gradeColor }}>
              {grade}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-mono font-bold text-[#e2b714]">{r.wpm}</span>
                <span className="text-sm text-[#646669] font-mono">wpm</span>
                <span className="text-sm text-[#d1d0c5] font-mono">{r.accuracy}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#646669] mt-0.5 font-mono flex-wrap">
                <span>{r.mode}s</span>
                <span className="text-[#3a3a3c]">·</span>
                <span>{r.wordCount} words</span>
                {r.errors > 0 && <><span className="text-[#3a3a3c]">·</span><span className="text-[#ca4754]">{r.errors} err</span></>}
              </div>
            </div>
            <div className="text-xs text-[#3a3a3c] font-mono flex-shrink-0">{formatDate(r.createdAt)}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Leaderboard Tab ─────────────────────────────────────────────

function LeaderboardTab({ entries, currentUsername }: { entries: LeaderboardEntry[]; currentUsername?: string }) {
  if (entries.length === 0) return (
    <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-10 text-center">
      <Trophy className="w-8 h-8 text-[#3a3a3c] mx-auto mb-3" />
      <p className="text-[#646669] text-sm">No scores yet. Be the first!</p>
    </div>
  );

  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="space-y-2">
      {entries.map((e, i) => {
        const isMe = e.userId?.username === currentUsername;
        return (
          <div key={e._id}
            className={cn(
              'flex items-center gap-4 rounded-xl px-4 py-3 border transition-colors',
              isMe ? 'bg-[#e2b714]/8 border-[#e2b714]/30' : 'bg-[#1a1a1a] border-white/5 hover:border-white/10'
            )}>
            <div className="w-8 text-center flex-shrink-0">
              {i < 3 ? <span className="text-lg">{medals[i]}</span>
                      : <span className="text-sm font-mono text-[#646669]">#{i+1}</span>}
            </div>
            <div className={cn('flex-1 font-medium', isMe ? 'text-[#e2b714]' : 'text-[#d1d0c5]')}>
              {e.userId?.username ?? 'Anonymous'}
              {isMe && <span className="text-xs text-[#646669] ml-1">(you)</span>}
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-[#e2b714]">{e.wpm}</div>
              <div className="text-xs text-[#646669] font-mono">{e.accuracy}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────────

function StatCard({ icon, label, value, gold }: { icon: React.ReactNode; label: string; value: string; gold?: boolean }) {
  return (
    <div className={cn(
      'rounded-xl p-4 border',
      gold ? 'bg-[#e2b714]/8 border-[#e2b714]/20' : 'bg-[#1a1a1a] border-white/5'
    )}>
      <div className={cn('mb-2', gold ? 'text-[#e2b714]' : 'text-[#646669]')}>{icon}</div>
      <div className={cn('text-2xl font-mono font-bold', gold ? 'text-[#e2b714]' : 'text-[#d1d0c5]')}>
        {value}
      </div>
      <div className="text-xs text-[#646669] mt-0.5">{label}</div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
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
