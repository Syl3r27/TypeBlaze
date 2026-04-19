'use client';

interface TimerBarProps {
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
}

export function TimerBar({ timeLeft, totalTime, isRunning }: TimerBarProps) {
  const progress = (timeLeft / totalTime) * 100;
  const isLow = progress < 20;

  return (
    <div className="w-full h-2 bg-surface border-2 border-black overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ease-linear ${
          isLow ? 'bg-text-error' : 'bg-accent2'
        } ${!isRunning ? 'opacity-30' : ''}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
