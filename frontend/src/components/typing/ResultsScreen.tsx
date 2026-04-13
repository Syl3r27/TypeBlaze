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
  // Animate WPM counter up from 0
  const [displayWpm, setDisplayWpm] = useState(0);
  const [copied, setCopied] = useState(false);
  // Staggered card visibility — no GSAP dependency
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Tiny delay so CSS transition fires on mount
    const t = requestAnimationFrame(() => setVisible(true));

    // Count-up animation for WPM
    const target = result.wpm;
    const duration = 900; // ms
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayWpm(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(t);
      cancelAnimationFrame(animId);
    };
  }, [result.wpm]);

  const grade = getGrade(result.wpm, result.accuracy);

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `I just typed ${result.wpm} WPM with ${result.accuracy}% accuracy on TypeCraft! ⌨️`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">

      {/* Main result card */}
      <div
        className={cn(
          'bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 text-center transition-all duration-500',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
      >
        <div className="text-xs font-mono text-[#D4B5A0] uppercase tracking-widest mb-5">
          Test Complete
        </div>

        {/* Grade badge */}
        <div
          className={cn(
            'inline-flex items-center justify-center w-14 h-14 rounded-xl text-xl font-bold mb-5',
            grade.bgColor, grade.textColor
          )}
        >
          {grade.letter}
        </div>

        {/* WPM hero */}
        <div className="mb-6">
          <div className="text-8xl font-mono font-bold text-[#CA5995] tabular-nums leading-none">
            {displayWpm}
          </div>
          <div className="text-[#D4B5A0] font-mono text-sm mt-2 uppercase tracking-widest">
            words per minute
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox
            label="Accuracy"
            value={`${result.accuracy}%`}
            good={result.accuracy >= 95}
            bad={result.accuracy < 85}
            icon={<Target className="w-3.5 h-3.5" />}
          />
          <StatBox
            label="Duration"
            value={`${result.duration}s`}
            icon={<Clock className="w-3.5 h-3.5" />}
          />
          <StatBox
            label="Errors"
            value={result.errors.toString()}
            good={result.errors === 0}
            bad={result.errors > 10}
            icon={<AlertCircle className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div
        className={cn(
          'bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 transition-all duration-500 delay-100',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
      >
        <div className="flex items-center gap-2 text-xs font-mono text-[#D4B5A0] uppercase tracking-widest mb-4">
          <TrendingUp className="w-3.5 h-3.5" />
          Breakdown
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Detail label="Words typed" value={result.wordCount.toString()} />
          <Detail label="Correct chars" value={result.chars.correct.toString()} />
          <Detail label="Wrong chars" value={result.chars.incorrect.toString()} />
          <Detail label="Mode" value={`${result.mode}s`} />
        </div>
      </div>

      {/* Actions */}
      <div
        className={cn(
          'flex items-center justify-center gap-3 transition-all duration-500 delay-200',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
      >
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-[#CA5995] text-[#2A2A2A] font-bold rounded-xl hover:bg-[#D4709A] transition-colors shadow-lg shadow-[#CA5995]/20"
        >
          <RotateCcw className="w-4 h-4" />
          Retry
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-3 bg-[#1a252f] border border-white/8 text-[#FFF1D3] font-medium rounded-xl hover:bg-[#22303f] transition-colors"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-3 bg-[#1a252f] border border-white/8 text-[#D4B5A0] hover:text-[#FFF1D3] font-medium rounded-xl hover:bg-[#22303f] transition-colors"
          title="Copy result"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function StatBox({
  label, value, good, bad, icon,
}: {
  label: string;
  value: string;
  good?: boolean;
  bad?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-[#1a252f] rounded-xl p-3 text-center">
      <div className={cn(
        'flex items-center justify-center mb-1.5',
        good ? 'text-green-400' : bad ? 'text-[#9a6a7a]' : 'text-[#D4B5A0]'
      )}>
        {icon}
      </div>
      <div className={cn(
        'text-xl font-mono font-bold',
        good ? 'text-green-400' : bad ? 'text-[#9a6a7a]' : 'text-[#FFF1D3]'
      )}>
        {value}
      </div>
      <div className="text-xs text-[#D4B5A0] mt-0.5">{label}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-mono font-semibold text-[#FFF1D3]">{value}</div>
      <div className="text-xs text-[#D4B5A0]">{label}</div>
    </div>
  );
}

function getGrade(wpm: number, accuracy: number) {
  const score = wpm * (accuracy / 100);
  if (score >= 100) return { letter: 'S', bgColor: 'bg-[#CA5995]/20', textColor: 'text-[#CA5995]' };
  if (score >= 80)  return { letter: 'A', bgColor: 'bg-green-500/20',  textColor: 'text-green-400'  };
  if (score >= 60)  return { letter: 'B', bgColor: 'bg-blue-500/20',   textColor: 'text-blue-400'   };
  if (score >= 40)  return { letter: 'C', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400' };
  return              { letter: 'D', bgColor: 'bg-red-500/20',    textColor: 'text-red-400'    };
}
