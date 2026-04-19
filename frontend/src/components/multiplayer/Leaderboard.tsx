'use client';
import { Trophy, Crown, Medal } from 'lucide-react';
import type { Player } from '@/types';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  players: Player[];
  currentSocketId?: string;
}

export function Leaderboard({ players, currentSocketId }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => {
    if (a.finished && b.finished) return (a.finishTime || 0) - (b.finishTime || 0);
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.wpm - a.wpm;
  });

  return (
    <div className="brutal-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-4 h-4 text-accent" />
        <span className="text-[10px] font-pixel text-white">RACE RESULTS</span>
      </div>

      <div className="space-y-2">
        {sorted.map((player, idx) => {
          const isMe = player.socketId === currentSocketId;
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;

          return (
            <div key={player.id}
              className={cn('flex items-center gap-4 p-3 border-2 border-black transition-colors',
                isMe ? 'bg-accent/10 border-accent' : 'bg-surface',
                idx === 0 && 'shadow-brutal-accent')}>
              <div className="w-8 text-center">
                {medal ? <span className="text-lg">{medal}</span> : <span className="text-[8px] font-pixel text-text-tertiary">#{idx + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-medium truncate', isMe ? 'text-accent' : 'text-white')}>
                  {player.username}
                  {isMe && <span className="text-text-tertiary text-[8px] font-pixel ml-1">(YOU)</span>}
                </div>
                {player.finished && player.finishTime && (
                  <div className="text-[8px] text-text-tertiary font-pixel">{(player.finishTime / 1000).toFixed(1)}S</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-pixel text-white tabular-nums">{player.wpm} <span className="text-[8px] text-text-tertiary font-normal">WPM</span></div>
                <div className="text-[8px] font-pixel text-text-tertiary">{player.accuracy}% ACC</div>
              </div>
              {player.finished && <div className="w-2 h-2 bg-text-success flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
