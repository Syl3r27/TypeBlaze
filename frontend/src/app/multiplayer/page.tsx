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
  const [phase, setPhase] = useState<Phase>('lobby');
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [socketId, setSocketId] = useState('');
  const [username, setUsername] = useState(() => generateGuestUsername());
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { createRoom, joinRoom, startGame, sendProgress, leaveRoom } = useSocket({
    onRoomCreated: (r) => { setRoom(r); setPlayers(r.players); setError(''); import('@/lib/socket').then(({ getSocket }) => setSocketId(getSocket().id || '')); },
    onRoomJoined: (r) => { setRoom(r); setPlayers(r.players); setError(''); import('@/lib/socket').then(({ getSocket }) => setSocketId(getSocket().id || '')); },
    onRoomError: (msg) => setError(msg),
    onPlayerJoined: (_, r) => { setRoom(r); setPlayers(r.players); },
    onPlayerLeft: (_, r) => { setRoom(r); setPlayers(r.players); },
    onCountdown: (r) => { setRoom(r); setPhase('countdown'); },
    onCountdownTick: (n) => setCountdown(n),
    onRaceStart: (r) => { setRoom(r); setPlayers(r.players); setCountdown(null); setPhase('racing'); },
    onProgressUpdate: (ps) => setPlayers(ps),
    onPlayerFinished: (_, ps) => setPlayers(ps),
    onRaceFinished: (r) => { setRoom(r); setPlayers(r.players); setPhase('finished'); },
    onRoomClosed: () => { setRoom(null); setPlayers([]); setPhase('lobby'); setError('Room was closed.'); },
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
    <main className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border-[3px] border-accent text-accent text-[8px] font-pixel mb-4">
            <span className="w-2 h-2 bg-accent animate-pulse" />REAL-TIME MULTIPLAYER
          </div>
          <h1 className="font-pixel text-xl sm:text-2xl text-white mb-2">RACE ROOM</h1>
          <p className="text-text-secondary text-sm">Create a room, share the code, race your friends live</p>
        </div>

        {phase === 'countdown' && countdown !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95">
            <div className="text-center">
              <p className="text-[10px] font-pixel text-text-secondary uppercase tracking-widest mb-6">RACE STARTS IN</p>
              <div key={countdown} className="font-pixel text-accent leading-none animate-countdown"
                style={{ fontSize: 'clamp(60px, 20vw, 140px)' }}>
                {countdown === 0 ? 'GO!' : countdown}
              </div>
              {room && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  {room.players.map(p => (
                    <div key={p.id} className="flex items-center gap-1.5 bg-surface border-2 border-black px-3 py-1.5">
                      <div className="w-2 h-2 bg-accent animate-pulse" />
                      <span className="text-[8px] font-pixel text-white">{p.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {(phase === 'lobby' || phase === 'countdown') && (
          <RoomLobby room={room} currentSocketId={socketId} isHost={isHost}
            onCreateRoom={() => createRoom(username || 'Anonymous')} onJoinRoom={(code) => joinRoom(code, username || 'Anonymous')}
            onStartGame={startGame} onLeaveRoom={handleLeaveRoom} error={error} username={username} onUsernameChange={setUsername} />
        )}

        {phase === 'racing' && room && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3"><TypingTest externalWords={room.words} onProgressUpdate={handleProgressUpdate} hideSettings /></div>
            <div className="lg:col-span-2"><RaceTrack players={players} currentSocketId={socketId} /></div>
          </div>
        )}

        {phase === 'finished' && (
          <div className="max-w-2xl mx-auto space-y-5">
            {(() => {
              const winner = [...players].sort((a, b) => {
                if (a.finished && b.finished) return (a.finishTime ?? 0) - (b.finishTime ?? 0);
                if (a.finished) return -1;
                return b.wpm - a.wpm;
              })[0];
              const isMe = winner?.socketId === socketId;
              return winner ? (
                <div className={cn('brutal-card p-6 text-center', isMe ? 'border-accent shadow-brutal-accent' : '')}>
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="font-pixel text-sm text-white">{isMe ? 'YOU WON!' : `${winner.username} WINS!`}</div>
                  <div className="text-[8px] text-text-secondary mt-1 font-pixel">{winner.wpm} WPM · {winner.accuracy}% ACC</div>
                </div>
              ) : null;
            })()}
            <Leaderboard players={players} currentSocketId={socketId} />
            <div className="flex items-center justify-center gap-3">
              <button onClick={handleLeaveRoom} className="btn-brutal px-8 py-3 bg-accent text-black font-pixel text-[10px]">PLAY AGAIN</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
