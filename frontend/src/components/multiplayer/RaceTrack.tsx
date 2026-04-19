'use client';
import type { Player } from '@/types';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

interface RaceTrackProps {
  players: Player[];
  currentSocketId?: string;
}

function avatarColor(name: string): string {
  const palette = ['#FF2D95','#39FF14','#00E5FF','#C0A0FF','#FF5CB0','#33ECFF','#FFD700'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

export function RaceTrack({ players, currentSocketId }: RaceTrackProps) {
  const sorted = [...players].sort((a, b) => b.progress - a.progress);

  return (
    <div className="brutal-card p-5 space-y-4 sticky top-20">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-pixel text-white">RACE PROGRESS</span>
        <span className="text-[8px] font-pixel text-text-secondary">{players.length} RACERS</span>
      </div>

      {sorted.map((player, idx) => {
        const isMe = player.socketId === currentSocketId;
        const color = avatarColor(player.username);
        const initial = player.username[0]?.toUpperCase() ?? '?';

        return (
          <div key={player.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[8px] font-pixel text-text-secondary w-4 text-right flex-shrink-0">{idx + 1}.</span>
                <div className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0 border-2 border-black"
                  style={{ backgroundColor: color }}>{initial}</div>
                <span className={cn('text-sm font-medium truncate', isMe ? 'text-accent' : 'text-white')}>{player.username}</span>
                {player.finished && player.position === 1 && <Crown className="w-3 h-3 text-accent flex-shrink-0" />}
                {isMe && <span className="text-[8px] text-text-secondary font-pixel flex-shrink-0">YOU</span>}
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <span className="text-sm font-pixel text-white">{player.wpm}</span>
                <span className="text-[8px] text-text-secondary font-pixel ml-1">WPM</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="relative h-4 bg-surface border-2 border-black overflow-hidden">
              {[25,50,75].map(t => (
                <div key={t} className="absolute top-0 bottom-0 w-px bg-black/30" style={{ left: `${t}%` }} />
              ))}
              <div className={cn('absolute left-0 top-0 h-full transition-all duration-300 ease-out flex items-center justify-end pr-1')}
                style={{ width: `${Math.max(player.progress, 2)}%`, backgroundColor: player.finished ? '#39FF14' : isMe ? '#FF2D95' : color + 'aa' }}>
                {player.progress > 12 && <span className="text-[9px] font-bold text-black/80">{initial}</span>}
              </div>
            </div>
            <div className="flex justify-between text-[8px] font-pixel text-text-tertiary">
              <span>{Math.round(player.progress)}%</span>
              {player.finished ? <span className="text-text-success">FINISHED #{player.position}</span> : <span>{player.accuracy}% ACC</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
