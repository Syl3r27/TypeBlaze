'use client';
import { Crown, CheckCircle2 } from 'lucide-react';
import type { Player } from '@/types';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  isHost: boolean;
  isCurrentUser: boolean;
  rank?: number;
}

export function PlayerCard({ player, isHost, isCurrentUser, rank }: PlayerCardProps) {
  const avatarColor = stringToColor(player.username);

  return (
    <div className={cn('brutal-card p-4 transition-all duration-300',
        isCurrentUser && 'border-accent shadow-brutal-accent',
        player.finished && 'opacity-80')}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-black flex-shrink-0 border-2 border-black"
          style={{ backgroundColor: avatarColor }}>{player.username[0]?.toUpperCase()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn('text-sm font-medium truncate', isCurrentUser ? 'text-accent' : 'text-white')}>{player.username}</span>
            {isHost && <Crown className="w-3 h-3 text-accent flex-shrink-0" />}
            {isCurrentUser && <span className="text-[8px] text-text-tertiary font-pixel">(YOU)</span>}
          </div>
        </div>
        {player.finished ? (
          <div className="flex items-center gap-1.5 text-[8px] font-pixel">
            <CheckCircle2 className="w-3.5 h-3.5 text-text-success" />
            <span className="text-text-success">#{player.position}</span>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-sm font-pixel text-white tabular-nums">{player.wpm}</div>
            <div className="text-[8px] text-text-tertiary font-pixel">WPM</div>
          </div>
        )}
      </div>
      <div className="relative h-3 bg-surface border-2 border-black overflow-hidden">
        <div className={cn('absolute left-0 top-0 h-full transition-all duration-300 ease-out',
          player.finished ? 'bg-text-success' : isCurrentUser ? 'bg-accent' : 'bg-text-secondary/60')}
          style={{ width: `${player.progress}%` }} />
      </div>
      <div className="flex justify-between mt-1.5 text-[8px] font-pixel text-text-tertiary">
        <span>{Math.round(player.progress)}%</span>
        {player.accuracy > 0 && <span>{player.accuracy}% ACC</span>}
      </div>
    </div>
  );
}

function stringToColor(str: string): string {
  const colors = ['#FF2D95', '#39FF14', '#00E5FF', '#C0A0FF', '#FF5CB0', '#33ECFF', '#FFD700', '#FF3333'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
