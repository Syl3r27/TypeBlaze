'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, Zap, Target, Clock, BarChart3, User,
  TrendingUp, Calendar, RefreshCw, LogOut, ArrowLeft,
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

export default function ProfilePage() {
  const { user, token, isLoggedIn, logout } = useAuth();
  const { recentResults } = useStore();
  const router = useRouter();

  const [history, setHistory] = useState<HistoryResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'leaderboard'>('stats');

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/stats/history?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setHistory(data.results);
    } catch {}
    setLoading(false);
  }, [token]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API}/stats/leaderboard`);
      const data = await res.json();
      if (data.success) setLeaderboard(data.results);
    } catch {}
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchLeaderboard();
  }, [fetchHistory, fetchLeaderboard]);

  // Use server stats if logged in, else fall back to local recentResults
  const localResults = recentResults;
  const hasServerData = isLoggedIn && history.length > 0;

  // Compute stats from local results (guest fallback)
  const localStats = localResults.length > 0 ? {
    totalTests: localResults.length,
    bestWpm: Math.max(...localResults.map(r => r.wpm)),
    avgWpm: Math.round(localResults.reduce((a, r) => a + r.wpm, 0) / localResults.length),
    avgAccuracy: Math.round(localResults.reduce((a, r) => a + r.accuracy, 0) / localResults.length),
    totalTime: localResults.reduce((a, r) => a + r.duration, 0),
  } : null;

  const stats = isLoggedIn ? user?.stats : localStats;

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg hover:bg-[#242424] transition-colors text-[#646669] hover:text-[#d1d0c5]">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#d1d0c5]">
                {isLoggedIn ? user?.username : 'Guest Profile'}
              </h1>
              <p className="text-sm text-[#646669]">
                {isLoggedIn ? user?.email : 'Sign in to save your progress'}
              </p>
            </div>
          </div>
          {isLoggedIn && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#646669] hover:text-[#d1d0c5] hover:bg-[#242424] rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          )}
        </div>

        {/* Guest CTA */}
        {!isLoggedIn && (
          <div className="bg-[#1a1a1a] border border-[#e2b714]/20 rounded-2xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#d1d0c5] mb-0.5">Create a free account</p>
              <p className="text-xs text-[#646669]">Save your stats, track progress, appear on leaderboard</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-[#e2b714] text-[#0f0f0f] text-sm font-bold rounded-xl hover:bg-[#f0ca2d] transition-colors whitespace-nowrap"
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard icon={<Trophy className="w-4 h-4" />} label="Best WPM" value={stats.bestWpm?.toString() ?? '–'} accent />
            <StatCard icon={<Zap className="w-4 h-4" />} label="Avg WPM" value={stats.avgWpm?.toString() ?? '–'} />
            <StatCard icon={<Target className="w-4 h-4" />} label="Avg Accuracy" value={stats.avgAccuracy ? `${stats.avgAccuracy}%` : '–'} />
            <StatCard icon={<BarChart3 className="w-4 h-4" />} label="Tests Taken" value={stats.totalTests?.toString() ?? '–'} />
          </div>
        )}

        {!stats && !loading && (
          <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-10 text-center mb-6">
            <BarChart3 className="w-10 h-10 text-[#3a3a3c] mx-auto mb-3" />
            <p className="text-[#646669] text-sm">No tests yet. <Link href="/test" className="text-[#e2b714] hover:underline">Take your first test!</Link></p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1a1a] border border-white/8 rounded-xl p-1 mb-4">
          {(['stats', 'history', 'leaderboard'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all',
                activeTab === tab
                  ? 'bg-[#e2b714] text-[#0f0f0f]'
                  : 'text-[#646669] hover:text-[#d1d0c5]'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'stats' && (
          <StatsTab
            results={hasServerData ? history : localResults.map(r => ({
              _id: Math.random().toString(),
              wpm: r.wpm,
              accuracy: r.accuracy,
              errors: r.errors,
              duration: r.duration,
              mode: r.mode,
              wordCount: r.wordCount,
              createdAt: new Date().toISOString(),
            }))}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            results={hasServerData ? history : localResults.map(r => ({
              _id: Math.random().toString(),
              wpm: r.wpm,
              accuracy: r.accuracy,
              errors: r.errors,
              duration: r.duration,
              mode: r.mode,
              wordCount: r.wordCount,
              createdAt: new Date().toISOString(),
            }))}
            loading={loading}
            onRefresh={fetchHistory}
            isLoggedIn={isLoggedIn}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTab entries={leaderboard} currentUsername={user?.username} />
        )}
      </div>
    </main>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-4">
      <div className={cn('mb-2', accent ? 'text-[#e2b714]' : 'text-[#646669]')}>{icon}</div>
      <div className={cn('text-2xl font-mono font-bold', accent ? 'text-[#e2b714]' : 'text-[#d1d0c5]')}>
        {value}
      </div>
      <div className="text-xs text-[#646669] mt-0.5">{label}</div>
    </div>
  );
}

function StatsTab({ results }: { results: HistoryResult[] }) {
  if (results.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-10 text-center">
        <p className="text-[#646669] text-sm">Complete some tests to see your stats chart.</p>
      </div>
    );
  }

  const last10 = [...results].reverse().slice(0, 10);
  const maxWpm = Math.max(...last10.map(r => r.wpm), 1);

  return (
    <div className="space-y-4">
      {/* WPM trend chart */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-[#d1d0c5] mb-6">
          <TrendingUp className="w-4 h-4 text-[#e2b714]" />
          WPM over last {last10.length} tests
        </div>
        <div className="flex items-end gap-2 h-32">
          {last10.map((r, i) => {
            const pct = Math.max((r.wpm / maxWpm) * 100, 4);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="text-[10px] text-[#646669] opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {r.wpm}
                </div>
                <div
                  className="w-full rounded-t-md bg-[#e2b714]/80 hover:bg-[#e2b714] transition-colors cursor-default"
                  style={{ height: `${pct}%` }}
                  title={`${r.wpm} WPM`}
                />
                <div className="text-[10px] text-[#3a3a3c] font-mono">{r.mode}s</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accuracy trend */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-[#d1d0c5] mb-5">
          <Target className="w-4 h-4 text-[#e2b714]" />
          Accuracy trend
        </div>
        <div className="flex items-end gap-2 h-20">
          {last10.map((r, i) => {
            const pct = Math.max((r.accuracy / 100) * 100, 2);
            const color = r.accuracy >= 95 ? '#4caf79' : r.accuracy >= 85 ? '#e2b714' : '#ca4754';
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-mono" style={{ color }}>
                  {r.accuracy}%
                </div>
                <div
                  className="w-full rounded-t-md transition-colors cursor-default hover:brightness-110"
                  style={{ height: `${pct}%`, backgroundColor: color + 'cc' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Best WPM (recent)', value: `${Math.max(...last10.map(r => r.wpm))}` },
          { label: 'Avg accuracy', value: `${Math.round(last10.reduce((a, r) => a + r.accuracy, 0) / last10.length)}%` },
          { label: 'Total time', value: formatTime(last10.reduce((a, r) => a + r.duration, 0)) },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a1a] border border-white/8 rounded-xl p-4 text-center">
            <div className="text-xl font-mono font-bold text-[#d1d0c5]">{s.value}</div>
            <div className="text-xs text-[#646669] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({
  results, loading, onRefresh, isLoggedIn,
}: {
  results: HistoryResult[];
  loading: boolean;
  onRefresh: () => void;
  isLoggedIn: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-10 text-center">
        <div className="w-5 h-5 border-2 border-[#e2b714] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-10 text-center">
        <Clock className="w-8 h-8 text-[#3a3a3c] mx-auto mb-3" />
        <p className="text-[#646669] text-sm">No test history yet.</p>
        <Link href="/test" className="inline-block mt-3 text-sm text-[#e2b714] hover:underline">
          Take a test →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#646669]">{results.length} results</span>
        {isLoggedIn && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 text-xs text-[#646669] hover:text-[#d1d0c5] transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        )}
      </div>

      {results.map((r, i) => {
        const grade = r.wpm >= 80 ? 'S' : r.wpm >= 60 ? 'A' : r.wpm >= 40 ? 'B' : r.wpm >= 20 ? 'C' : 'D';
        const gradeColor = grade === 'S' ? 'text-[#e2b714]' : grade === 'A' ? 'text-green-400' : grade === 'B' ? 'text-blue-400' : 'text-[#646669]';

        return (
          <div key={r._id ?? i} className="bg-[#1a1a1a] border border-white/8 rounded-xl p-4 flex items-center gap-4">
            {/* Grade */}
            <div className={cn('text-xl font-mono font-bold w-8 text-center flex-shrink-0', gradeColor)}>
              {grade}
            </div>

            {/* WPM + accuracy */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-mono font-bold text-[#e2b714]">{r.wpm}</span>
                <span className="text-sm text-[#646669] font-mono">wpm</span>
                <span className="text-sm text-[#d1d0c5] font-mono">{r.accuracy}%</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#646669] mt-0.5 font-mono">
                <span>{r.mode}s mode</span>
                <span>·</span>
                <span>{r.wordCount} words</span>
                {r.errors > 0 && <><span>·</span><span className="text-[#ca4754]">{r.errors} errors</span></>}
              </div>
            </div>

            {/* Date */}
            <div className="text-xs text-[#3a3a3c] font-mono text-right flex-shrink-0">
              {formatDate(r.createdAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardTab({
  entries, currentUsername,
}: {
  entries: LeaderboardEntry[];
  currentUsername?: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-10 text-center">
        <Trophy className="w-8 h-8 text-[#3a3a3c] mx-auto mb-3" />
        <p className="text-[#646669] text-sm">No scores yet. Be the first!</p>
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-2">
      {entries.map((e, i) => {
        const isMe = e.userId?.username === currentUsername;
        return (
          <div
            key={e._id}
            className={cn(
              'flex items-center gap-4 bg-[#1a1a1a] border rounded-xl px-4 py-3',
              isMe ? 'border-[#e2b714]/40 bg-[#e2b714]/5' : 'border-white/8'
            )}
          >
            {/* Rank */}
            <div className="w-8 text-center flex-shrink-0 text-lg">
              {i < 3 ? medals[i] : <span className="text-sm font-mono text-[#646669]">#{i + 1}</span>}
            </div>

            {/* Username */}
            <div className={cn('flex-1 font-medium', isMe ? 'text-[#e2b714]' : 'text-[#d1d0c5]')}>
              {e.userId?.username ?? 'Anonymous'}
              {isMe && <span className="text-xs text-[#646669] ml-1.5">(you)</span>}
            </div>

            {/* WPM */}
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-[#e2b714]">{e.wpm}</div>
              <div className="text-xs text-[#646669] font-mono">{e.accuracy}% acc</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
