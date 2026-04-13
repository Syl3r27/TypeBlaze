'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { RoomLobby } from '@/components/multiplayer/RoomLobby';
import { RaceTrack } from '@/components/multiplayer/RaceTrack';
import { Leaderboard } from '@/components/multiplayer/Leaderboard';
import { TypingTest } from '@/components/typing/TypingTest';
import { useSocket } from '@/hooks/useSocket';
import type { Room, Player } from '@/types';
import { generateGuestUsername } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Users, Zap, Trophy } from 'lucide-react';

type Phase = 'lobby' | 'countdown' | 'racing' | 'finished';

export default function MultiplayerPage() {
  const [phase, setPhase]       = useState<Phase>('lobby');
  const [room, setRoom]         = useState<Room | null>(null);
  const [players, setPlayers]   = useState<Player[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError]       = useState('');
  const [socketId, setSocketId] = useState('');
  const [username, setUsername] = useState(() => generateGuestUsername());
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { createRoom, joinRoom, startGame, sendProgress, leaveRoom } = useSocket({
    onRoomCreated: (r) => {
      setRoom(r); setPlayers(r.players); setError('');
      import('@/lib/socket').then(({ getSocket }) => setSocketId(getSocket().id || ''));
    },
    onRoomJoined: (r) => {
      setRoom(r); setPlayers(r.players); setError('');
      import('@/lib/socket').then(({ getSocket }) => setSocketId(getSocket().id || ''));
    },
    onRoomError:    (msg) => setError(msg),
    onPlayerJoined: (_, r) => { setRoom(r); setPlayers(r.players); },
    onPlayerLeft:   (_, r) => { setRoom(r); setPlayers(r.players); },
    onCountdown:    (r) => { setRoom(r); setPhase('countdown'); },
    onCountdownTick: (n) => setCountdown(n),
    onRaceStart:    (r) => { setRoom(r); setPlayers(r.players); setCountdown(null); setPhase('racing'); },
    onProgressUpdate: (ps) => setPlayers(ps),
    onPlayerFinished: (_, ps) => setPlayers(ps),
    onRaceFinished: (r) => { setRoom(r); setPlayers(r.players); setPhase('finished'); },
    onRoomClosed:   () => { setRoom(null); setPlayers([]); setPhase('lobby'); setError('Room was closed.'); },
  });

  useEffect(() => {
    import('@/lib/socket').then(({ getSocket }) => {
      const s = getSocket();
      s.on('connect', () => setSocketId(s.id || ''));
      if (s.id) setSocketId(s.id);
    });
  }, []);

  const handleProgressUpdate = useCallback((progress: number, wpm: number, accuracy: number) => {
    if (throttleRef.current) return;
    throttleRef.current = setTimeout(() => { throttleRef.current = null; }, 100);
    sendProgress(progress, wpm, accuracy);
  }, [sendProgress]);

  const handleLeaveRoom = useCallback(() => {
    leaveRoom(); setRoom(null); setPlayers([]); setPhase('lobby'); setError('');
  }, [leaveRoom]);

  const isHost = room?.hostId === socketId;

  return (
    <main className="min-h-screen bg-[#2A2A2A]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-20 pb-12">

        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CA5995]/10 border border-[#CA5995]/20 text-[#CA5995] text-xs font-mono mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CA5995] animate-pulse" />
            Real-time multiplayer
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#FFF1D3] mb-2">Race Room</h1>
          <p className="text-[#D4B5A0] text-sm">Create a room, share the code, race your friends live</p>
        </div>

        {/* ── Countdown overlay ── */}
        {phase === 'countdown' && countdown !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2A2A]/90 backdrop-blur-md">
            <div className="text-center">
              <p className="text-sm font-mono text-[#D4B5A0] uppercase tracking-widest mb-6">Race starts in</p>
              <div
                key={countdown}
                className="font-mono font-black text-[#CA5995] leading-none animate-countdown"
                style={{ fontSize: 'clamp(80px, 20vw, 160px)' }}
              >
                {countdown === 0 ? 'GO!' : countdown}
              </div>
              {room && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  {room.players.map(p => (
                    <div key={p.id} className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#CA5995] animate-pulse" />
                      <span className="text-sm font-mono text-[#FFF1D3]">{p.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LOBBY ── */}
        {(phase === 'lobby' || phase === 'countdown') && (
          <RoomLobby
            room={room}
            currentSocketId={socketId}
            isHost={isHost}
            onCreateRoom={() => createRoom(username || 'Anonymous')}
            onJoinRoom={(code) => joinRoom(code, username || 'Anonymous')}
            onStartGame={startGame}
            onLeaveRoom={handleLeaveRoom}
            error={error}
            username={username}
            onUsernameChange={setUsername}
          />
        )}

        {/* ── RACING ── */}
        {phase === 'racing' && room && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Typing area */}
            <div className="lg:col-span-3">
              <TypingTest
                externalWords={room.words}
                onProgressUpdate={handleProgressUpdate}
                hideSettings
              />
            </div>
            {/* Race sidebar */}
            <div className="lg:col-span-2">
              <RaceTrack players={players} currentSocketId={socketId} />
            </div>
          </div>
        )}

        {/* ── FINISHED ── */}
        {phase === 'finished' && (
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Winner banner */}
            {(() => {
              const winner = [...players].sort((a, b) => {
                if (a.finished && b.finished) return (a.finishTime ?? 0) - (b.finishTime ?? 0);
                if (a.finished) return -1;
                return b.wpm - a.wpm;
              })[0];
              const isMe = winner?.socketId === socketId;
              return winner ? (
                <div className={cn(
                  'rounded-2xl p-6 text-center border',
                  isMe
                    ? 'bg-[#CA5995]/10 border-[#CA5995]/30'
                    : 'bg-[#1a1a1a] border-white/8'
                )}>
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="text-lg font-bold text-[#FFF1D3]">
                    {isMe ? 'You won!' : `${winner.username} wins!`}
                  </div>
                  <div className="text-sm text-[#D4B5A0] mt-1 font-mono">
                    {winner.wpm} wpm · {winner.accuracy}% accuracy
                  </div>
                </div>
              ) : null;
            })()}

            <Leaderboard players={players} currentSocketId={socketId} />

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleLeaveRoom}
                className="px-8 py-3 bg-[#CA5995] text-[#2A2A2A] font-bold rounded-xl hover:bg-[#D4709A] transition-colors shadow-lg shadow-[#CA5995]/20"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
