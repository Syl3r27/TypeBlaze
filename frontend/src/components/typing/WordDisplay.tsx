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

  useEffect(() => {
    const container = containerRef.current;
    const active    = activeWordRef.current;
    if (!container || !active) return;
    const ROW = 54;
    if (active.offsetTop > ROW * 1.5) {
      container.scrollTop = active.offsetTop - ROW;
    }
  }, [currentWordIndex]);

  return (
    <div ref={containerRef} className="relative select-none overflow-hidden" style={{ height: '108px' }}>
      <div className="flex flex-wrap gap-x-3 gap-y-3">
        {wordStates.map((ws, wordIndex) => {
          const isActive = wordIndex === currentWordIndex;
          const isPast   = wordIndex < currentWordIndex;
          return (
            <Word key={wordIndex} ref={isActive ? activeWordRef : null}
              ws={ws} isActive={isActive} isPast={isPast}
              typedLength={isActive ? currentInput.length : (ws.isCompleted ? ws.typed.length : 0)} />
          );
        })}
      </div>
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
        style={{ background: 'linear-gradient(transparent, #222240)' }} />
    </div>
  );
}

interface WordProps {
  ws: WordState;
  isActive: boolean;
  isPast: boolean;
  typedLength: number;
}

import { forwardRef } from 'react';

const Word = forwardRef<HTMLSpanElement, WordProps>(function Word(
  { ws, isActive, isPast, typedLength }, ref
) {
  return (
    <span ref={ref}
      className={cn('relative font-mono text-2xl',
        isActive ? 'after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[3px] after:bg-accent/40' : ''
      )}
      style={{ lineHeight: '1.75', letterSpacing: '0.01em' }}>
      {ws.letters.map((letter, i) => (
        <span key={i} style={{
          color:
            letter.state === 'correct'   ? '#FFFFFF' :
            letter.state === 'incorrect' ? '#FF3333' :
            letter.state === 'extra'     ? '#FF3333' :
            isPast ? '#FF3333' : isActive ? '#C0A0FF' : '#6E6E88',
          opacity: letter.state === 'extra' ? 0.6 : 1,
          textDecoration: letter.state === 'incorrect' ? 'underline' : 'none',
          textDecorationColor: '#FF3333',
          textUnderlineOffset: '3px',
        }}>
          {letter.char}
        </span>
      ))}
      {isActive && (
        <span className="absolute bg-accent animate-caret-blink"
          style={{ width: '3px', top: '10%', height: '80%', left: `${typedLength}ch` }} />
      )}
    </span>
  );
});
