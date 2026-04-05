'use client';
import { useEffect, useRef } from 'react';
import type { WordState } from '@/types';
import { cn } from '@/lib/utils';

interface WordDisplayProps {
  wordStates: WordState[];
  currentWordIndex: number;
  currentInput: string;
}

export function WordDisplay({ wordStates, currentWordIndex, currentInput }: WordDisplayProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Keep the active word in the first two visible rows
  useEffect(() => {
    const container = containerRef.current;
    const active    = activeWordRef.current;
    if (!container || !active) return;
    // Each row ≈ 42px (font 24px × line-height 1.75) + 12px gap = 54px
    const ROW = 54;
    if (active.offsetTop > ROW * 1.5) {
      container.scrollTop = active.offsetTop - ROW;
    }
  }, [currentWordIndex]);

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden"
      style={{ height: '108px' }}
    >
      <div className="flex flex-wrap gap-x-3 gap-y-3">
        {wordStates.map((ws, wordIndex) => {
          const isActive = wordIndex === currentWordIndex;
          const isPast   = wordIndex < currentWordIndex;

          return (
            <Word
              key={wordIndex}
              ref={isActive ? activeWordRef : null}
              ws={ws}
              isActive={isActive}
              isPast={isPast}
              typedLength={isActive ? currentInput.length : (ws.isCompleted ? ws.typed.length : 0)}
            />
          );
        })}
      </div>

      {/* Soft fade at the bottom to hide the third-row peek */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
        style={{ background: 'linear-gradient(transparent, #0f0f0f)' }}
      />
    </div>
  );
}

// ── Word component ─────────────────────────────────────────────

interface WordProps {
  ws: WordState;
  isActive: boolean;
  isPast: boolean;
  typedLength: number;
}

import { forwardRef } from 'react';

const Word = forwardRef<HTMLSpanElement, WordProps>(function Word(
  { ws, isActive, isPast, typedLength },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        'relative font-mono text-2xl',
        isActive
          ? 'after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[2px] after:rounded-full after:bg-[#e2b714]/30'
          : ''
      )}
      style={{ lineHeight: '1.75', letterSpacing: '0.01em' }}
    >
      {ws.letters.map((letter, i) => (
        <span
          key={i}
          style={{
            color:
              letter.state === 'correct'   ? '#d1d0c5' :
              letter.state === 'incorrect' ? '#ca4754' :
              letter.state === 'extra'     ? '#ca4754' :
              // pending
              isPast ? '#ca4754' : isActive ? '#646669' : '#3a3a3c',
            opacity: letter.state === 'extra' ? 0.6 : 1,
            textDecoration: letter.state === 'incorrect' ? 'underline' : 'none',
            textDecorationColor: '#ca4754',
            textUnderlineOffset: '3px',
          }}
        >
          {letter.char}
        </span>
      ))}

      {/* Caret — only on active word, positioned via ch units (works perfectly for monospace) */}
      {isActive && (
        <span
          className="absolute bg-[#e2b714] animate-caret-blink"
          style={{
            width: '2px',
            top: '10%',
            height: '80%',
            borderRadius: '1px',
            // ch units are exact for monospace: 1ch = width of '0'
            left: `${typedLength}ch`,
          }}
        />
      )}
    </span>
  );
});
