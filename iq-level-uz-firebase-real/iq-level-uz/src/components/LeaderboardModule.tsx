import React, { useState, useMemo } from 'react';
import { UserProfile, WeeklyPrizeSettings } from '../types';
import { Gift, Clock, CheckCircle, AlertTriangle, Sparkles, Users } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LeaderboardModuleProps {
  currentUser: UserProfile;
  // The REAL, live list of every registered user, already ordered by
  // iqScore desc by the Firestore query in services/cloud.ts. No seeded /
  // fake players are mixed in here - an empty list just means nobody with
  // an IQ score has registered yet.
  usersList: UserProfile[];
  weeklyPrizes: WeeklyPrizeSettings;
}

export const LeaderboardModule: React.FC<LeaderboardModuleProps> = ({
  currentUser,
  usersList,
  weeklyPrizes,
}) => {
  const [scopeFilter, setScopeFilter] = useState<'top10' | 'top50'>('top10');

  const getUnvonBadge = (iqScore: number) => {
    if (iqScore >= 120) {
      return { title: 'Daho', icon: '👑', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/40' };
    }
    if (iqScore >= 100) {
      return { title: 'Mantiq Ustasi', icon: '⚡', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/40' };
    }
    return { title: 'Izlanuvchi', icon: '🎯', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/40' };
  };

  const userIq = currentUser.bestIq || currentUser.iqScore || 0;
  const userMinutes = Math.floor((currentUser.weeklyTimeSpentSeconds || 0) / 60);
  const userPoints = Math.round(userIq * 0.45);

  const hasMetPoints = userPoints >= weeklyPrizes.minPoints;
  const hasMetTime = userMinutes >= weeklyPrizes.minTimeMinutes;
  const isEligible = hasMetPoints && hasMetTime;

  // Real ranking: only users with a real, recorded IQ score are ranked -
  // sorted highest first, exactly matching the shared Firestore query.
  const ranked = useMemo(() => {
    return [...usersList]
      .filter((u) => (u.bestIq || u.iqScore || 0) > 0 && !u.isBanned)
      .sort((a, b) => (b.bestIq || b.iqScore || 0) - (a.bestIq || a.iqScore || 0))
      .map((u, idx) => ({
        ...u,
        rank: idx + 1,
        displayIq: u.bestIq || u.iqScore || 0,
        minutes: Math.floor((u.weeklyTimeSpentSeconds || 0) / 60),
        points: Math.round((u.bestIq || u.iqScore || 0) * 0.45),
      }));
  }, [usersList]);

  const myRealRank = ranked.find((u) => u.id === currentUser.id)?.rank ?? null;
  const visibleList = ranked.slice(0, scopeFilter === 'top10' ? 10 : 50);

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4 animate-fade-in">
      {/* Top Banner with Weekly Prizes (from real admin settings) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-amber-400/40 shadow-2xl text-center relative overflow-hidden">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400 flex items-center justify-center text-amber-400 mb-2">
          <Gift className="w-6 h-6 animate-pulse" />
        </div>

        <h2 className="text-xl font-display font-bold text-white tracking-wide">
          HAFTALIK TOP-3 SOVG'ALARI
        </h2>
        <p className="text-xs text-amber-300 font-mono mt-0.5">
          Har yakshanba Telegram Stars va sovg'alar yuboriladi
        </p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-700/80">
            <div className="text-2xl">🥈</div>
            <div className="text-xs font-bold text-slate-200">2-O'rin</div>
            <div className="text-xs font-mono font-bold text-cyan-400 mt-1">{weeklyPrizes.top2Reward}</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-400/60 scale-105 shadow-lg shadow-amber-400/10">
            <div className="text-3xl">🥇</div>
            <div className="text-xs font-bold text-amber-300">1-O'rin</div>
            <div className="text-xs font-mono font-extrabold text-amber-400 mt-1">{weeklyPrizes.top1Reward}</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-700/80">
            <div className="text-2xl">🥉</div>
            <div className="text-xs font-bold text-slate-200">3-O'rin</div>
            <div className="text-xs font-mono font-bold text-purple-400 mt-1">{weeklyPrizes.top3Reward}</div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-1.5 text-xs">
          <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sovg'a Olish Shartlari (Majburiy):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="flex items-center gap-1.5">
              {hasMetPoints ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="text-slate-300">
                Min. {weeklyPrizes.minPoints}+ ochko: <strong className="font-mono text-cyan-300">{userPoints} ball</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {hasMetTime ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="text-slate-300">
                Min. {weeklyPrizes.minTimeMinutes} minut faollik: <strong className="font-mono text-cyan-300">{userMinutes} min</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Reytingda: {ranked.length} ta real foydalanuvchi
          </div>
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-cyan-500/30">
            {[
              { id: 'top10', label: 'TOP 10' },
              { id: 'top50', label: 'TOP 50' },
            ].map((scope) => (
              <button
                key={scope.id}
                onClick={() => {
                  soundManager.playCyberClick();
                  setScopeFilter(scope.id as 'top10' | 'top50');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  scopeFilter === scope.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                {scope.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User's Own Real Rank Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border border-cyan-400/50 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/20 border border-cyan-400 flex items-center justify-center font-mono font-bold text-cyan-300 text-xs">
            {myRealRank ? `#${myRealRank}` : '—'}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xl">{currentUser.avatar}</div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="text-[10px] text-cyan-400 font-mono">(Siz)</span>
                {userIq > 0 && (
                  <span className={`text-[10px] px-2 py-0.2 rounded-full border ${getUnvonBadge(userIq).border} ${getUnvonBadge(userIq).bg} ${getUnvonBadge(userIq).color} font-bold`}>
                    {getUnvonBadge(userIq).icon} {getUnvonBadge(userIq).title}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                Vaqt: {userMinutes} min · Ochko: {userPoints}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold font-mono text-amber-400">
            {isEligible ? "Sovg'aga Da'vogar ✅" : 'Kvalifikatsiya kutilmoqda'}
          </div>
          <div className="text-[10px] text-slate-400">{userIq > 0 ? `${userIq} IQ` : 'Test topshiring'}</div>
        </div>
      </div>

      {/* Leaderboard List Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-mono">
        <span>O'yinchilar: {visibleList.length} ta</span>
        <span>Real IQ ballga ko'ra reyting</span>
      </div>

      {/* Real Leaderboard List */}
      {visibleList.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400">
          Hali hech kim IQ testini yakunlamagan. Birinchi bo'lib test topshirib,
          reytingda #1 o'ringa chiqing! 🚀
        </div>
      ) : (
        <div className="space-y-2">
          {visibleList.map((leader) => {
            const badge = getUnvonBadge(leader.displayIq);
            const isMe = leader.id === currentUser.id;
            return (
              <div
                key={leader.id}
                className={`p-3 rounded-2xl bg-slate-900/80 border transition-all flex items-center justify-between hover:border-cyan-500/40 ${
                  leader.rank <= 3
                    ? 'border-amber-400/40 shadow-md shadow-amber-400/5 bg-slate-900'
                    : isMe
                      ? 'border-cyan-400/50'
                      : 'border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center">
                    {leader.rank === 1 ? (
                      <span className="text-xl">🥇</span>
                    ) : leader.rank === 2 ? (
                      <span className="text-xl">🥈</span>
                    ) : leader.rank === 3 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="font-mono text-xs font-bold text-slate-400">#{leader.rank}</span>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-lg">
                    {leader.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{leader.name}{isMe && <span className="text-cyan-400"> (Siz)</span>}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badge.border} ${badge.bg} ${badge.color} font-semibold font-mono`}>
                        {badge.icon} {badge.title}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                      <span className="text-cyan-400">{leader.displayIq} IQ</span>
                      <span>·</span>
                      <span>{leader.minutes} min faol</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-display text-amber-400">
                    {leader.points} <span className="text-[10px] font-normal text-slate-400">ochko</span>
                  </div>
                  <div className="text-[10px] text-cyan-300 font-mono">
                    {leader.rank === 1
                      ? `🎁 ${weeklyPrizes.top1Reward}`
                      : leader.rank === 2
                        ? `⭐ ${weeklyPrizes.top2Reward}`
                        : leader.rank === 3
                          ? `⭐ ${weeklyPrizes.top3Reward}`
                          : `#${leader.rank}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
