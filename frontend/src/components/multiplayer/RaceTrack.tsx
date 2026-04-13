'use client';
import type { Player } from '@/types';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

interface RaceTrackProps {
  players: Player[];
  currentSocketId?: string;
}

function avatarColor(name: string): string {
  const palette = ['#CA5995','#6a9a7a','#5c8ee2','#e25c8e','#8e5ce2','#e2705c','#5ce2d4'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

export function RaceTrack({ players, currentSocketId }: RaceTrackProps) {
  const sorted = [...players].sort((a, b) => b.progress - a.progress);

  return (
    <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 space-y-4 sticky top-20">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#FFF1D3]">Race Progress</span>
        <span className="text-xs font-mono text-[#D4B5A0]">{players.length} racers</span>
      </div>

      {sorted.map((player, idx) => {
        const isMe    = player.socketId === currentSocketId;
        const color   = avatarColor(player.username);
        const initial = player.username[0]?.toUpperCase() ?? '?';

        return (
          <div key={player.id} className="space-y-1.5">
            {/* Name row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {/* Position badge */}
                <span className="text-xs font-mono text-[#D4B5A0] w-4 text-right flex-shrink-0">
                  {idx + 1}.
                </span>
                {/* Avatar */}
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-[#2A2A2A] flex-shrink-0"
                  style={{ backgroundColor: color }}>
                  {initial}
                </div>
                <span className={cn('text-sm font-medium truncate', isMe ? 'text-[#CA5995]' : 'text-[#FFF1D3]')}>
                  {player.username}
                </span>
                {player.finished && player.position === 1 && <Crown className="w-3 h-3 text-[#CA5995] flex-shrink-0" />}
                {isMe && <span className="text-xs text-[#D4B5A0] flex-shrink-0">you</span>}
              </div>

              <div className="text-right flex-shrink-0 ml-2">
                <span className="text-sm font-mono font-bold text-[#FFF1D3]">{player.wpm}</span>
                <span className="text-xs text-[#D4B5A0] ml-1">wpm</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-4 bg-[#1a252f] rounded-full overflow-hidden">
              {/* Tick marks */}
              {[25,50,75].map(t => (
                <div key={t} className="absolute top-0 bottom-0 w-px bg-[#2A2A2A]/40" style={{ left: `${t}%` }} />
              ))}

              <div
                className={cn(
                  'absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-1',
                  player.finished ? 'bg-[#6a9a7a]' : isMe ? 'bg-[#CA5995]' : ''
                )}
                style={{
                  width: `${Math.max(player.progress, 2)}%`,
                  backgroundColor: player.finished ? '#6a9a7a' : isMe ? '#CA5995' : color + 'aa',
                }}
              >
                {player.progress > 12 && (
                  <span className="text-[9px] font-bold text-[#2A2A2A]/80">{initial}</span>
                )}
              </div>
            </div>

            {/* % below */}
            <div className="flex justify-between text-[10px] font-mono text-[#6a7680]">
              <span>{Math.round(player.progress)}%</span>
              {player.finished
                ? <span className="text-[#6a9a7a]">finished #{player.position}</span>
                : <span>{player.accuracy}% acc</span>
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}
