'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import type { LetterState, WordState, TestResult, TimerMode } from '@/types';
import { calculateWPM, calculateAccuracy } from '@/lib/utils';
import { generateWords } from '@/lib/words';

interface UseTypingEngineProps {
  timerMode: TimerMode;
  externalWords?: string[];           // multiplayer passes a fixed set
  onComplete?: (result: TestResult) => void;
}

// ── pure helpers (no hooks) ──────────────────────────────────────

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
  const next = prev.slice(); // shallow copy — only mutate the one slot
  const target = prev[idx].word;

  const base = target.split('').map((char, i) => ({
    char,
    state: (i < typed.length
      ? typed[i] === char ? 'correct' : 'incorrect'
      : 'pending') as LetterState,
  }));
  const extra = typed.length > target.length
    ? typed.slice(target.length).split('').map(char => ({ char, state: 'extra' as LetterState }))
    : [];

  next[idx] = { ...prev[idx], typed, letters: [...base, ...extra] };
  return next;
}

function commitWord(prev: WordState[], idx: number, typed: string): WordState[] {
  const next = prev.slice();
  const target = prev[idx].word;

  // Freeze completed word
  const completedLetters = target.split('').map((char, i) => ({
    char,
    state: (i < typed.length
      ? typed[i] === char ? 'correct' : 'incorrect'
      : 'incorrect') as LetterState,
  }));
  if (typed.length > target.length) {
    typed.slice(target.length).split('').forEach(char =>
      completedLetters.push({ char, state: 'extra' as LetterState })
    );
  }

  next[idx] = { ...prev[idx], typed, isActive: false, isCompleted: true, letters: completedLetters };

  // Reset next word to pristine pending state
  const nextIdx = idx + 1;
  if (nextIdx < next.length) {
    const w = next[nextIdx].word;
    next[nextIdx] = {
      word: w,
      letters: w.split('').map(char => ({ char, state: 'pending' as LetterState })),
      typed: '',
      isActive: true,
      isCompleted: false,
    };
  }

  return next;
}

// ── hook ─────────────────────────────────────────────────────────

export function useTypingEngine({ timerMode, externalWords, onComplete }: UseTypingEngineProps) {
  const totalSeconds = parseInt(timerMode);

  // Words live INSIDE the engine so reset is always coherent
  const [words, setWords] = useState<string[]>(() => externalWords ?? generateWords(120));

  const [wordStates, setWordStates] = useState<WordState[]>(() => makeFreshWordStates(words));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput]         = useState('');
  const [timeLeft, setTimeLeft]                 = useState(totalSeconds);
  const [isRunning, setIsRunning]               = useState(false);
  const [isFinished, setIsFinished]             = useState(false);
  const [wpm, setWpm]                           = useState(0);
  const [accuracy, setAccuracy]                 = useState(100);

  // Refs that are always current — safe inside setInterval
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef    = useRef(0);
  const correctRef      = useRef(0);
  const totalRef        = useRef(0);
  const errorsRef       = useRef(0);
  const wordIdxRef      = useRef(0);
  const isFinishedRef   = useRef(false);
  const isRunningRef    = useRef(false);
  const onCompleteRef   = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  // Keep a ref to words so callbacks never read stale closure
  const wordsRef = useRef(words);
  useEffect(() => { wordsRef.current = words; }, [words]);

  // ── finish ────────────────────────────────────────────────────
  const finishTest = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    isRunningRef.current  = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const elapsed  = Math.max((Date.now() - startTimeRef.current) / 1000, 0.1);
    const finalWpm = calculateWPM(correctRef.current, elapsed);
    const finalAcc = calculateAccuracy(correctRef.current, totalRef.current);

    setIsFinished(true);
    setIsRunning(false);

    onCompleteRef.current?.({
      wpm: finalWpm,
      accuracy: finalAcc,
      errors: errorsRef.current,
      duration: Math.round(elapsed),
      wordCount: wordIdxRef.current,
      mode: timerMode,
      chars: {
        correct: correctRef.current,
        incorrect: errorsRef.current,
        extra: 0,
        missed: 0,
      },
    });
  }, [timerMode]);

  // ── timer ─────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setIsRunning(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed    = (Date.now() - startTimeRef.current) / 1000;
      const remaining  = totalSeconds - Math.floor(elapsed);
      setWpm(calculateWPM(correctRef.current, elapsed));
      setAccuracy(calculateAccuracy(correctRef.current, totalRef.current));
      setTimeLeft(remaining <= 0 ? 0 : remaining);
      if (remaining <= 0) finishTest();
    }, 100);
  }, [totalSeconds, finishTest]);

  // ── onKeyDown — handles Space separately from onChange ────────
  //    This is the KEY FIX: space never reaches currentInput.
  //    onChange only sees real characters + backspace.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinishedRef.current) return;

    if (e.key === ' ') {
      e.preventDefault(); // stop space going into the input at all

      const typed = (e.target as HTMLInputElement).value;
      if (typed.length === 0) return; // nothing typed yet, ignore space

      if (!isRunningRef.current) startTimer();

      const idx        = wordIdxRef.current;
      const targetWord = wordsRef.current[idx];
      if (!targetWord) return;

      // Score
      let correct = 0;
      const len = Math.min(typed.length, targetWord.length);
      for (let i = 0; i < len; i++) {
        if (typed[i] === targetWord[i]) correct++;
        else errorsRef.current++;
      }
      correctRef.current += correct + 1; // +1 for the space
      totalRef.current   += typed.length + 1;

      const nextIdx      = idx + 1;
      wordIdxRef.current = nextIdx;

      // Update all three pieces of state in one synchronous pass
      setWordStates(prev => commitWord(prev, idx, typed));
      setCurrentWordIndex(nextIdx);
      setCurrentInput('');
    }
  }, [startTimer]);

  // ── onChange — only regular characters & backspace ────────────
  const handleChange = useCallback((value: string) => {
    if (isFinishedRef.current) return;
    if (!isRunningRef.current && value.length > 0) startTimer();

    const idx        = wordIdxRef.current;
    const targetWord = wordsRef.current[idx];
    if (!targetWord) return;

    setCurrentInput(value);
    setWordStates(prev => applyTyping(prev, idx, value));
  }, [startTimer]);

  // ── reset ─────────────────────────────────────────────────────
  const reset = useCallback((newWords?: string[]) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    correctRef.current    = 0;
    totalRef.current      = 0;
    errorsRef.current     = 0;
    wordIdxRef.current    = 0;
    isFinishedRef.current = false;
    isRunningRef.current  = false;

    const w = newWords ?? (externalWords ?? generateWords(120));
    wordsRef.current = w;
    setWords(w);
    setWordStates(makeFreshWordStates(w));
    setCurrentWordIndex(0);
    setCurrentInput('');
    setTimeLeft(totalSeconds);
    setIsRunning(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
  }, [externalWords, totalSeconds]);

  const progress = Math.min(Math.round((currentWordIndex / words.length) * 100), 100);

  return {
    words,
    wordStates,
    currentWordIndex,
    currentInput,
    handleKeyDown,
    handleChange,
    timeLeft,
    isRunning,
    isFinished,
    wpm,
    accuracy,
    progress,
    reset,
    finishTest,
  };
}
