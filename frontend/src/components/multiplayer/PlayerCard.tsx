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
    <div
      className={cn(
        'glass-card rounded-xl p-4 transition-all duration-300',
        isCurrentUser && 'border border-accent/30 bg-accent/5',
        player.finished && 'opacity-80'
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-bg flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {player.username[0]?.toUpperCase()}
        </div>

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'text-sm font-medium truncate',
              isCurrentUser ? 'text-accent' : 'text-text-primary'
            )}>
              {player.username}
            </span>
            {isHost && <Crown className="w-3 h-3 text-accent flex-shrink-0" />}
            {isCurrentUser && (
              <span className="text-xs text-text-tertiary font-mono">(you)</span>
            )}
          </div>
        </div>

        {/* Finish position or live WPM */}
        {player.finished ? (
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-text-success" />
            <span className="text-text-success">#{player.position}</span>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-text-primary tabular-nums">
              {player.wpm}
            </div>
            <div className="text-xs text-text-tertiary">wpm</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-surface-active rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out',
            player.finished
              ? 'bg-text-success'
              : isCurrentUser
              ? 'bg-accent'
              : 'bg-text-secondary/60'
          )}
          style={{ width: `${player.progress}%` }}
        />
      </div>

      {/* Progress % */}
      <div className="flex justify-between mt-1.5 text-xs font-mono text-text-tertiary">
        <span>{Math.round(player.progress)}%</span>
        {player.accuracy > 0 && <span>{player.accuracy}% acc</span>}
      </div>
    </div>
  );
}

function stringToColor(str: string): string {
  const colors = [
    '#CA5995', '#6a9a7a', '#5c8ee2', '#e25c8e',
    '#8e5ce2', '#e2705c', '#5ce2d4', '#c4e25c',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
