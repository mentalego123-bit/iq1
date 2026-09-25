import React from 'react';
import { DuelOutcome } from '../types';
import { soundManager } from '../utils/audio';
import { Swords, Crown, Sparkles, Clock, ArrowRight, Flame } from 'lucide-react';

interface RecentDuelFeedProps {
  recentDuels: DuelOutcome[];
  onStartDuel: () => void;
}

export const RecentDuelFeed: React.FC<RecentDuelFeedProps> = ({
  recentDuels,
  onStartDuel,
}) => {
  return (
    <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950 border border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.12)] overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Swords className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-display font-black text-white tracking-wide">
                SO'NGGI 1V1 DUEL NATIJALARI
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-400 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                JONLI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              O'zbekiston kiber ligasining so'nggi 5 ta eng qaynoq to'qnashuvlari
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playCyberClick();
            onStartDuel();
          }}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_#fbbf24] hover:scale-105 active:scale-95 transition-all font-display cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>Jangga Kirish</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Duels Feed List */}
      <div className="relative z-10 space-y-2.5">
        {recentDuels.slice(0, 5).map((duel, index) => {
          const isP1Winner = duel.winnerId === 'player1' || duel.player1.score > duel.player2.score;
          const isP2Winner = duel.winnerId === 'player2' || duel.player2.score > duel.player1.score;

          return (
            <div
              key={duel.id || index}
              className="relative p-3 sm:p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-amber-400/40 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 group overflow-hidden"
            >
              {/* Left Player */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0 w-full sm:w-auto">
                <div
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-base border shrink-0 ${
                    isP1Winner
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {duel.player1.avatar || '🧠'}
                  {isP1Winner && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-current absolute -top-1.5 -right-1.5 drop-shadow" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        isP1Winner ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {duel.player1.name}
                    </span>
                    {isP1Winner && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-400/40">
                        G'OLIB
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Reyting: <strong className="text-cyan-400">{duel.player1.rating}</strong>
                  </div>
                </div>
              </div>

              {/* Match Score Center Badge */}
              <div className="flex items-center gap-3 shrink-0 py-1 px-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <span
                  className={`text-sm sm:text-base font-mono font-black ${
                    isP1Winner ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {duel.player1.score}
                </span>
                <span className="text-xs font-mono text-slate-600 font-bold">:</span>
                <span
                  className={`text-sm sm:text-base font-mono font-black ${
                    isP2Winner ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {duel.player2.score}
                </span>
              </div>

              {/* Right Player */}
              <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 w-full sm:w-auto text-right">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-end gap-1.5">
                    {isP2Winner && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-400/40">
                        G'OLIB
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold truncate ${
                        isP2Winner ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {duel.player2.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Reyting: <strong className="text-cyan-400">{duel.player2.rating}</strong>
                  </div>
                </div>

                <div
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-base border shrink-0 ${
                    isP2Winner
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {duel.player2.avatar || '⚡'}
                  {isP2Winner && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-current absolute -top-1.5 -right-1.5 drop-shadow" />
                  )}
                </div>
              </div>

              {/* Timestamp Info */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 shrink-0 self-end sm:self-center">
                <Clock className="w-3 h-3" />
                <span>{duel.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
