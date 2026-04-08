'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import type { LetterState, WordState, TestResult, TimerMode } from '@/types';
import { calculateWPM, calculateAccuracy } from '@/lib/utils';
import { generateWords } from '@/lib/words';

interface UseTypingEngineProps {
  timerMode: TimerMode;
  externalWords?: string[];
  onComplete?: (result: TestResult) => void;
}

function makeFreshWordStates(words: string[]): WordState[] {
  return words.map((word, i) => ({
    word,
    letters: word.split('').map(char => ({ char, state: 'pending' as LetterState })),
    typed: '',
    isActive: i === 0,
    isCompleted: false,
  }));
}

function applyTyping(prev: WordState[], idx: number, typed: string): WordState[] {
  const next = prev.slice();
  const target = prev[idx]?.word ?? '';
  const base = target.split('').map((char, i) => ({
    char,
    state: (i < typed.length ? (typed[i] === char ? 'correct' : 'incorrect') : 'pending') as LetterState,
  }));
  const extra = typed.length > target.length
    ? typed.slice(target.length).split('').map(char => ({ char, state: 'extra' as LetterState }))
    : [];
  next[idx] = { ...prev[idx], typed, letters: [...base, ...extra] };
  return next;
}

function commitWord(prev: WordState[], idx: number, typed: string): WordState[] {
  const next = prev.slice();
  const target = prev[idx]?.word ?? '';
  const completed = target.split('').map((char, i) => ({
    char,
    state: (i < typed.length ? (typed[i] === char ? 'correct' : 'incorrect') : 'incorrect') as LetterState,
  }));
  if (typed.length > target.length) {
    typed.slice(target.length).split('').forEach(char =>
      completed.push({ char, state: 'extra' as LetterState })
    );
  }
  next[idx] = { ...prev[idx], typed, isActive: false, isCompleted: true, letters: completed };
  const ni = idx + 1;
  if (ni < next.length) {
    const w = next[ni].word;
    next[ni] = {
      word: w,
      letters: w.split('').map(char => ({ char, state: 'pending' as LetterState })),
      typed: '',
      isActive: true,
      isCompleted: false,
    };
  }
  return next;
}

export function useTypingEngine({ timerMode, externalWords, onComplete }: UseTypingEngineProps) {
  const totalSeconds = parseInt(timerMode);
  const [words, setWords]               = useState<string[]>(() => externalWords ?? generateWords(120));
  const [wordStates, setWordStates]     = useState<WordState[]>(() => makeFreshWordStates(externalWords ?? generateWords(120)));
  const [currentWordIndex, setCWI]      = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [timeLeft, setTimeLeft]         = useState(totalSeconds);
  const [isRunning, setIsRunning]       = useState(false);
  const [isFinished, setIsFinished]     = useState(false);
  const [wpm, setWpm]                   = useState(0);
  const [accuracy, setAccuracy]         = useState(100);

  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef  = useRef(0);
  const correctRef    = useRef(0);
  const totalRef      = useRef(0);
  const errorsRef     = useRef(0);
  const wordIdxRef    = useRef(0);
  const finishedRef   = useRef(false);
  const runningRef    = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const wordsRef      = useRef(words);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { wordsRef.current = words; }, [words]);

  const finishTest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    runningRef.current  = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const elapsed  = Math.max((Date.now() - startTimeRef.current) / 1000, 0.1);
    const finalWpm = calculateWPM(correctRef.current, elapsed);
    const finalAcc = calculateAccuracy(correctRef.current, totalRef.current);
    setIsFinished(true);
    setIsRunning(false);
    onCompleteRef.current?.({
      wpm: finalWpm, accuracy: finalAcc, errors: errorsRef.current,
      duration: Math.round(elapsed), wordCount: wordIdxRef.current, mode: timerMode,
      chars: { correct: correctRef.current, incorrect: errorsRef.current, extra: 0, missed: 0 },
    });
  }, [timerMode]);

  const startTimer = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed   = (Date.now() - startTimeRef.current) / 1000;
      const remaining = totalSeconds - Math.floor(elapsed);
      setWpm(calculateWPM(correctRef.current, elapsed));
      setAccuracy(calculateAccuracy(correctRef.current, totalRef.current));
      setTimeLeft(remaining <= 0 ? 0 : remaining);
      if (remaining <= 0) finishTest();
    }, 100);
  }, [totalSeconds, finishTest]);

  // Advance word — called by both space key and mobile input logic
  const advanceWord = useCallback((typed: string) => {
    if (typed.length === 0) return;
    const idx        = wordIdxRef.current;
    const targetWord = wordsRef.current[idx];
    if (!targetWord) return;

    let correct = 0;
    const len = Math.min(typed.length, targetWord.length);
    for (let i = 0; i < len; i++) {
      if (typed[i] === targetWord[i]) correct++;
      else errorsRef.current++;
    }
    correctRef.current += correct + 1;
    totalRef.current   += typed.length + 1;

    const nextIdx      = idx + 1;
    wordIdxRef.current = nextIdx;
    setWordStates(prev => commitWord(prev, idx, typed));
    setCWI(nextIdx);
    setCurrentInput('');
  }, []);

  // ── onKeyDown: handles Space + Tab (works on desktop, partial on mobile) ──
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (finishedRef.current) return;
    if (e.key === ' ') {
      e.preventDefault();
      const typed = (e.target as HTMLInputElement).value.trimEnd();
      if (!runningRef.current && typed.length > 0) startTimer();
      advanceWord(typed);
    }
  }, [startTimer, advanceWord]);

  // ── onChange: handles all character input INCLUDING space on mobile ──
  const handleChange = useCallback((value: string) => {
    if (finishedRef.current) return;

    // Mobile virtual keyboards often send space through onChange, not onKeyDown
    if (value.endsWith(' ')) {
      const typed = value.slice(0, -1).trimStart(); // strip leading space too
      if (!runningRef.current && typed.length > 0) startTimer();
      advanceWord(typed);
      return;
    }

    if (!runningRef.current && value.length > 0) startTimer();

    const idx        = wordIdxRef.current;
    const targetWord = wordsRef.current[idx];
    if (!targetWord) return;

    setCurrentInput(value);
    setWordStates(prev => applyTyping(prev, idx, value));
  }, [startTimer, advanceWord]);

  const reset = useCallback((newWords?: string[]) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    correctRef.current  = 0;
    totalRef.current    = 0;
    errorsRef.current   = 0;
    wordIdxRef.current  = 0;
    finishedRef.current = false;
    runningRef.current  = false;
    const w = newWords ?? (externalWords ?? generateWords(120));
    wordsRef.current = w;
    setWords(w);
    setWordStates(makeFreshWordStates(w));
    setCWI(0);
    setCurrentInput('');
    setTimeLeft(totalSeconds);
    setIsRunning(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
  }, [externalWords, totalSeconds]);

  const progress = Math.min(Math.round((currentWordIndex / words.length) * 100), 100);

  return {
    words, wordStates, currentWordIndex, currentInput,
    handleKeyDown, handleChange,
    timeLeft, isRunning, isFinished, wpm, accuracy, progress,
    reset, finishTest,
  };
}
