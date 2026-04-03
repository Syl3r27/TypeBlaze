// ── Auth ────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  email: string;
  stats: UserStats;
}

export interface UserStats {
  totalTests: number;
  totalTime: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
}

// ── Typing Test ─────────────────────────────────────────
export type TimerMode = '15' | '30' | '60' | '120';

export interface TestResult {
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  wordCount: number;
  mode: TimerMode;
  chars: CharStats;
}

export interface CharStats {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}

export type LetterState = 'pending' | 'correct' | 'incorrect' | 'extra';

export interface WordState {
  word: string;
  letters: { char: string; state: LetterState }[];
  typed: string;
  isActive: boolean;
  isCompleted: boolean;
}

// ── Multiplayer ──────────────────────────────────────────
export interface Player {
  id: string;
  socketId: string;
  username: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishTime?: number;
  position?: number;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  words: string[];
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  startTime?: number;
  maxPlayers: number;
  duration: number;
}

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: number;
}

// ── API ─────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
