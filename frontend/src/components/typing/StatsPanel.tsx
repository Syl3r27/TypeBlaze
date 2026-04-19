'use client';
import { cn } from '@/lib/utils';

interface StatsPanelProps {
  wpm: number;
  accuracy: number;
  timeLeft: number;
  isRunning: boolean;
  errors?: number;
}

export function StatsPanel({ wpm, accuracy, timeLeft, isRunning, errors = 0 }: StatsPanelProps) {
  return (
    <div className="flex items-center gap-6 sm:gap-10">
      <StatItem value={wpm.toString()} label="WPM" highlight={wpm > 80} muted={!isRunning} />
      <StatItem value={`${accuracy}%`} label="ACC" highlight={accuracy >= 98} error={accuracy < 90 && isRunning} muted={!isRunning} />
      <StatItem value={timeLeft.toString()} label="SEC" muted={!isRunning} pulsing={timeLeft <= 5 && isRunning} />
      {errors > 0 && <StatItem value={errors.toString()} label="ERR" error muted={!isRunning} />}
    </div>
  );
}

function StatItem({ value, label, highlight, error, muted, pulsing }: {
  value: string; label: string; highlight?: boolean; error?: boolean; muted?: boolean; pulsing?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={cn(
        'text-3xl sm:text-4xl font-pixel tabular-nums transition-colors duration-200',
        highlight && 'text-accent2',
        error && 'text-text-error',
        !highlight && !error && (muted ? 'text-text-tertiary' : 'text-white'),
        pulsing && 'animate-pulse text-text-error'
      )}>
        {value}
      </div>
      <div className="text-[8px] text-text-tertiary font-pixel uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
