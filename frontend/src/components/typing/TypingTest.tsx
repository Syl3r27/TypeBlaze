'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store/useStore';
import { WordDisplay } from './WordDisplay';
import { StatsPanel } from './StatsPanel';
import { TimerBar } from './TimerBar';
import { ResultsScreen } from './ResultsScreen';
import type { TimerMode, TestResult } from '@/types';
import { cn } from '@/lib/utils';

const TIMER_MODES: TimerMode[] = ['15', '30', '60', '120'];

interface TypingTestProps {
  onProgressUpdate?: (progress: number, wpm: number, accuracy: number) => void;
  externalWords?: string[];
  hideSettings?: boolean;
}

export function TypingTest({ onProgressUpdate, externalWords, hideSettings }: TypingTestProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { timerMode, setTimerMode, addResult } = useStore();
  const { saveResult } = useAuth();
  const [isFocused, setIsFocused] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const handleComplete = useCallback(
    (r: TestResult) => {
      setResult(r);
      addResult(r);
      saveResult({ wpm: r.wpm, accuracy: r.accuracy, errors: r.errors, duration: r.duration, mode: r.mode, wordCount: r.wordCount }).catch(() => {});
    },
    [saveResult, addResult]
  );

  const { wordStates, currentWordIndex, currentInput, handleKeyDown, handleChange, timeLeft, isRunning, isFinished, wpm, accuracy, progress, reset } = useTypingEngine({
    timerMode, externalWords, onComplete: handleComplete,
  });

  useEffect(() => {
    if (onProgressUpdate && isRunning) { onProgressUpdate(progress, wpm, accuracy); }
  }, [progress, wpm, accuracy, isRunning, onProgressUpdate]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleRetry = useCallback(() => {
    setResult(null); reset(); setTimeout(() => inputRef.current?.focus(), 50);
  }, [reset]);

  const handleModeChange = useCallback((mode: TimerMode) => {
    setTimerMode(mode); setResult(null); reset(); setTimeout(() => inputRef.current?.focus(), 50);
  }, [setTimerMode, reset]);

  if (result) return <ResultsScreen result={result} onRetry={handleRetry} />;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Mode selector */}
      {!hideSettings && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1 bg-surface border-[3px] border-black p-1">
            {TIMER_MODES.map((mode) => (
              <button key={mode} onClick={() => handleModeChange(mode)}
                className={cn('px-4 py-1.5 text-xs font-pixel transition-all duration-150',
                  timerMode === mode ? 'bg-accent text-black shadow-brutal-sm' : 'text-text-secondary hover:text-white')}>
                {mode}S
              </button>
            ))}
          </div>
          <button onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-accent hover:bg-surface transition-colors border-2 border-black"
            title="Restart (Tab)">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-pixel text-[8px]">RESTART</span>
          </button>
        </div>
      )}

      <div className="mb-6"><StatsPanel wpm={wpm} accuracy={accuracy} timeLeft={timeLeft} isRunning={isRunning} errors={wordStates.filter((w) => w.isCompleted && w.letters.some((l) => l.state === 'incorrect')).length} /></div>
      <div className="mb-6"><TimerBar timeLeft={timeLeft} totalTime={parseInt(timerMode)} isRunning={isRunning} /></div>

      {/* Word display */}
      <div className="brutal-card p-6 sm:p-8 cursor-text mb-4 relative" onClick={() => inputRef.current?.focus()}>
        {!isFocused && (
          <div className="absolute inset-0 bg-bg/70 flex items-center justify-center z-10">
            <span className="text-text-secondary text-[10px] font-pixel px-4 py-2 bg-surface border-[3px] border-black shadow-brutal-sm">
              CLICK TO START TYPING
            </span>
          </div>
        )}
        <WordDisplay wordStates={wordStates} currentWordIndex={currentWordIndex} currentInput={currentInput} />
      </div>

      <input ref={inputRef} type="text" value={currentInput} onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Tab') { e.preventDefault(); handleRetry(); return; } handleKeyDown(e); }}
        onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
        className="sr-only" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" aria-label="Typing input" tabIndex={0} />

      <div className="text-center mt-4">
        <span className="text-[8px] text-text-tertiary font-pixel">
          PRESS{' '}<kbd className="px-2 py-1 bg-surface text-text-secondary border-2 border-black shadow-brutal-sm font-pixel text-[8px]">TAB</kbd>{' '}TO RESTART
        </span>
      </div>
    </div>
  );
}
