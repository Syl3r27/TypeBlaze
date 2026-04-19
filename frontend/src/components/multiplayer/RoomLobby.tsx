'use client';
import { useState } from 'react';
import { Users, Plus, ArrowRight, Copy, Check, Crown, Play, LogOut } from 'lucide-react';
import type { Room, Player } from '@/types';
import { PlayerCard } from './PlayerCard';
import { cn } from '@/lib/utils';

interface RoomLobbyProps {
  room: Room | null;
  currentSocketId?: string;
  isHost: boolean;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  error?: string;
  username: string;
  onUsernameChange: (name: string) => void;
}

export function RoomLobby({ room, currentSocketId, isHost, onCreateRoom, onJoinRoom, onStartGame, onLeaveRoom, error, username, onUsernameChange }: RoomLobbyProps) {
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'create' | 'join'>('create');

  const copyCode = async () => {
    if (!room) return;
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (room) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="brutal-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[8px] font-pixel text-text-tertiary uppercase tracking-widest mb-1">ROOM CODE</div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-pixel text-accent2 tracking-[0.2em]">{room.code}</span>
                <button onClick={copyCode} className="p-2 bg-surface border-2 border-black hover:shadow-brutal-sm transition-all" title="Copy code">
                  {copied ? <Check className="w-4 h-4 text-text-success" /> : <Copy className="w-4 h-4 text-text-secondary" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[8px] text-text-tertiary font-pixel mb-1">PLAYERS</div>
              <div className="text-2xl font-pixel text-white">{room.players.length}<span className="text-text-tertiary text-sm">/{room.maxPlayers}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2', room.status === 'waiting' ? 'bg-accent2 animate-pulse' : 'bg-text-success')} />
            <span className="text-sm text-text-secondary capitalize">{room.status === 'waiting' ? 'Waiting for players...' : room.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {room.players.map((player) => (
            <PlayerCard key={player.id} player={player} isHost={player.socketId === room.hostId} isCurrentUser={player.socketId === currentSocketId} />
          ))}
          {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="brutal-card p-4 border-dashed flex items-center gap-3 opacity-40">
              <div className="w-8 h-8 bg-surface border-2 border-black flex items-center justify-center"><Users className="w-4 h-4 text-text-tertiary" /></div>
              <span className="text-sm text-text-tertiary font-pixel text-[8px]">WAITING...</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isHost ? (
            <button onClick={onStartGame} disabled={room.players.length < 1}
              className="flex-1 btn-brutal flex items-center justify-center gap-2 py-3 bg-accent text-black font-pixel text-[10px] disabled:opacity-50 disabled:cursor-not-allowed">
              <Play className="w-4 h-4" />START RACE
              {room.players.length === 1 && <span className="text-[8px] opacity-70 font-normal">(SOLO)</span>}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface border-[3px] border-black text-text-secondary">
              <div className="w-2 h-2 bg-accent2 animate-pulse" />
              <span className="font-pixel text-[8px]">WAITING FOR HOST...</span>
            </div>
          )}
          <button onClick={onLeaveRoom} className="btn-brutal flex items-center gap-2 px-4 py-3 bg-surface text-text-secondary hover:text-white">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {error && <div className="text-center text-sm text-text-error bg-text-error/10 px-4 py-3 border-2 border-text-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="brutal-card p-6 mb-4">
        <label className="text-[8px] font-pixel text-text-tertiary uppercase tracking-widest block mb-2">YOUR USERNAME</label>
        <input type="text" value={username} onChange={(e) => onUsernameChange(e.target.value.slice(0, 20))} placeholder="anonymous"
          className="w-full bg-surface border-[3px] border-black px-4 py-2.5 font-mono text-white placeholder:text-text-tertiary focus:outline-none focus:border-accent2 shadow-brutal-sm" maxLength={20} />
      </div>

      <div className="brutal-card overflow-hidden">
        <div className="flex border-b-[3px] border-black">
          <TabBtn active={tab === 'create'} onClick={() => setTab('create')}><Plus className="w-4 h-4" />CREATE</TabBtn>
          <TabBtn active={tab === 'join'} onClick={() => setTab('join')}><Users className="w-4 h-4" />JOIN</TabBtn>
        </div>
        <div className="p-6">
          {tab === 'create' ? (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Create a new room and share the 6-character code with friends.</p>
              <button onClick={onCreateRoom} className="w-full btn-brutal flex items-center justify-center gap-2 py-3 bg-accent text-black font-pixel text-[10px]">
                <Plus className="w-4 h-4" />CREATE ROOM
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Enter the 6-character room code to join.</p>
              <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))} placeholder="ENTER CODE"
                className="w-full bg-surface border-[3px] border-black px-4 py-3 font-pixel text-lg text-center tracking-[0.3em] text-accent2 placeholder:text-text-tertiary focus:outline-none focus:border-accent uppercase shadow-brutal-sm"
                maxLength={6} onKeyDown={(e) => { if (e.key === 'Enter' && joinCode.length === 6) onJoinRoom(joinCode); }} />
              <button onClick={() => onJoinRoom(joinCode)} disabled={joinCode.length !== 6}
                className="w-full btn-brutal flex items-center justify-center gap-2 py-3 bg-accent text-black font-pixel text-[10px] disabled:opacity-40 disabled:cursor-not-allowed">
                <ArrowRight className="w-4 h-4" />JOIN ROOM
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <div className="mt-4 text-center text-sm text-text-error bg-text-error/10 px-4 py-3 border-2 border-text-error">{error}</div>}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={cn('flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-pixel transition-colors',
        active ? 'text-accent bg-accent/10 border-b-4 border-accent -mb-[3px]' : 'text-text-secondary hover:text-white')}>
      {children}
    </button>
  );
}
