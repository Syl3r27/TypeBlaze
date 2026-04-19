'use client';
import { useState, useEffect } from 'react';
import { RotateCcw, Home, Share2, TrendingUp, Target, Clock, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import type { TestResult } from '@/types';
import { cn } from '@/lib/utils';

interface ResultsScreenProps {
  result: TestResult;
  onRetry: () => void;
}

export function ResultsScreen({ result, onRetry }: ResultsScreenProps) {
  const [displayWpm, setDisplayWpm] = useState(0);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    const target = result.wpm;
    const duration = 900;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayWpm(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const animId = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(t); cancelAnimationFrame(animId); };
  }, [result.wpm]);

  const grade = getGrade(result.wpm, result.accuracy);

  const handleCopy = () => {
    navigator.clipboard?.writeText(`I just typed ${result.wpm} WPM with ${result.accuracy}% accuracy on TypeCraft! ⌨️`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Main result card */}
      <div className={cn('brutal-card p-8 text-center transition-all duration-500',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}>
        <div className="text-[10px] font-pixel text-text-secondary uppercase tracking-widest mb-5">TEST COMPLETE</div>
        {/* Grade badge */}
        <div className={cn('inline-flex items-center justify-center w-16 h-16 text-xl font-pixel border-[3px] border-black shadow-brutal-sm mb-5', grade.bgColor, grade.textColor)}>
          {grade.letter}
        </div>
        {/* WPM hero */}
        <div className="mb-6">
          <div className="text-6xl sm:text-8xl font-pixel text-accent tabular-nums leading-none">{displayWpm}</div>
          <div className="text-text-secondary font-pixel text-[8px] mt-3 uppercase tracking-widest">WORDS PER MINUTE</div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Accuracy" value={`${result.accuracy}%`} good={result.accuracy >= 95} bad={result.accuracy < 85} icon={<Target className="w-3.5 h-3.5" />} />
          <StatBox label="Duration" value={`${result.duration}s`} icon={<Clock className="w-3.5 h-3.5" />} />
          <StatBox label="Errors" value={result.errors.toString()} good={result.errors === 0} bad={result.errors > 10} icon={<AlertCircle className="w-3.5 h-3.5" />} />
        </div>
      </div>

      {/* Breakdown */}
      <div className={cn('brutal-card p-6 transition-all duration-500 delay-100',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}>
        <div className="flex items-center gap-2 text-[10px] font-pixel text-text-secondary uppercase tracking-widest mb-4">
          <TrendingUp className="w-3.5 h-3.5" />BREAKDOWN
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Detail label="Words typed" value={result.wordCount.toString()} />
          <Detail label="Correct chars" value={result.chars.correct.toString()} />
          <Detail label="Wrong chars" value={result.chars.incorrect.toString()} />
          <Detail label="Mode" value={`${result.mode}s`} />
        </div>
      </div>

      {/* Actions */}
      <div className={cn('flex items-center justify-center gap-3 transition-all duration-500 delay-200',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}>
        <button onClick={onRetry} className="btn-brutal flex items-center gap-2 px-6 py-3 bg-accent text-black font-pixel text-[10px]">
          <RotateCcw className="w-4 h-4" />RETRY
        </button>
        <Link href="/" className="btn-brutal flex items-center gap-2 px-5 py-3 bg-surface text-white font-pixel text-[10px]">
          <Home className="w-4 h-4" />HOME
        </Link>
        <button onClick={handleCopy} className="btn-brutal flex items-center gap-2 px-5 py-3 bg-surface text-text-secondary hover:text-white font-pixel text-[10px]" title="Copy result">
          {copied ? <Check className="w-4 h-4 text-text-success" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, good, bad, icon }: { label: string; value: string; good?: boolean; bad?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="bg-surface border-2 border-black p-3 text-center">
      <div className={cn('flex items-center justify-center mb-1.5',
        good ? 'text-text-success' : bad ? 'text-text-error' : 'text-text-secondary')}>{icon}</div>
      <div className={cn('text-xl font-pixel',
        good ? 'text-text-success' : bad ? 'text-text-error' : 'text-white')}>{value}</div>
      <div className="text-[8px] text-text-secondary mt-0.5 font-pixel">{label}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-pixel text-white">{value}</div>
      <div className="text-[8px] text-text-secondary font-pixel">{label}</div>
    </div>
  );
}

function getGrade(wpm: number, accuracy: number) {
  const score = wpm * (accuracy / 100);
  if (score >= 100) return { letter: 'S', bgColor: 'bg-accent/20', textColor: 'text-accent' };
  if (score >= 80)  return { letter: 'A', bgColor: 'bg-text-success/20', textColor: 'text-text-success' };
  if (score >= 60)  return { letter: 'B', bgColor: 'bg-accent2/20', textColor: 'text-accent2' };
  if (score >= 40)  return { letter: 'C', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400' };
  return              { letter: 'D', bgColor: 'bg-text-error/20', textColor: 'text-text-error' };
}
