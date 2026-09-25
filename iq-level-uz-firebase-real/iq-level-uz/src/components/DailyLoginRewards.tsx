import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { soundManager } from '../utils/audio';
import {
  Flame,
  Gift,
  Zap,
  Coins,
  CheckCircle2,
  Lock,
  Sparkles,
  Crown,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyLoginRewardsProps {
  userProfile: UserProfile;
  onClaimReward: (reward: { coins: number; tickets: number; day: number }) => void;
}

interface DayReward {
  day: number;
  coins: number;
  tickets: number;
  isSpecial?: boolean;
}

const REWARD_SCHEDULE: DayReward[] = [
  { day: 1, coins: 50, tickets: 1 },
  { day: 2, coins: 75, tickets: 1 },
  { day: 3, coins: 100, tickets: 2 },
  { day: 4, coins: 150, tickets: 2 },
  { day: 5, coins: 200, tickets: 3 },
  { day: 6, coins: 250, tickets: 3 },
  { day: 7, coins: 500, tickets: 5, isSpecial: true },
];

export const DailyLoginRewards: React.FC<DailyLoginRewardsProps> = ({
  userProfile,
  onClaimReward,
}) => {
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [justClaimedAnimation, setJustClaimedAnimation] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  const streakDays = userProfile.streakDays || 1;
  const isClaimedToday = userProfile.streakClaimedToday;
  // Current active day cycle (1-7)
  const currentCycleDay = ((streakDays - 1) % 7) + 1;
  const todayReward = REWARD_SCHEDULE[currentCycleDay - 1] || REWARD_SCHEDULE[0];

  // Calculate live countdown to midnight UTC+5
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilReset(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
          .toString()
          .padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = () => {
    if (isClaimedToday) return;

    soundManager.playVictoryFanfare();
    setJustClaimedAnimation(true);
    setShowCelebrationModal(true);

    confetti({
      particleCount: 80,
      spread: 95,
      origin: { y: 0.55 },
      colors: ['#fbbf24', '#f59e0b', '#00d2ff', '#ea580c', '#ffffff', '#10b981'],
    });

    onClaimReward({
      coins: todayReward.coins,
      tickets: todayReward.tickets,
      day: currentCycleDay,
    });

    setTimeout(() => {
      setJustClaimedAnimation(false);
    }, 2500);
  };

  return (
    <>
      <div
        className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-500 overflow-hidden ${
          isClaimedToday || justClaimedAnimation
            ? 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-900/60 border-2 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.5)]'
            : 'bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/40 shadow-xl'
        }`}
      >
      {/* Background Golden Glow & Ambient Rays */}
      <div
        className={`absolute -top-16 -right-16 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-all duration-700 ${
          isClaimedToday || justClaimedAnimation
            ? 'bg-amber-400/30 scale-125'
            : 'bg-amber-500/10'
        }`}
      />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Header Strip */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Visual Streak Counter with Gold Neon Glow */}
        <div className="flex items-center gap-3.5">
          <div
            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              isClaimedToday || justClaimedAnimation
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border-2 border-white shadow-[0_0_30px_#fbbf24] scale-105'
                : 'bg-amber-400/15 border-2 border-amber-400/70 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
            }`}
          >
            <Flame className="w-8 h-8 fill-current animate-pulse" />
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-slate-950 border border-amber-400 text-[10px] font-mono font-bold text-amber-300">
              {streakDays}d
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-display font-extrabold text-white flex items-center gap-1.5">
                <span>KUNLIK KIRISH MUKOFORLARI</span>
                {(isClaimedToday || justClaimedAnimation) && (
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                )}
              </h3>
            </div>

            <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
              <span>
                Ketma-ketlik:{' '}
                <strong
                  className={`font-mono text-sm font-bold ${
                    isClaimedToday ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {streakDays} Kun
                </strong>
              </span>
              <span>·</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Himoyalangan
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Claim Action / Claimed Status */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {isClaimedToday ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <div className="text-right">
                <div className="text-xs font-bold text-amber-300 font-mono">OLINDI ✓</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeUntilReset}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_#fbbf24] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-display"
            >
              <Gift className="w-4 h-4" />
              <span>BUGUNGI BONUSNI OLISH</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playCyberClick();
              setShowFullSchedule(!showFullSchedule);
            }}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="7 kunlik taqvimni ko'rish"
          >
            {showFullSchedule ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Cycle Progress Bar to Day 7 Mega Reward (100% Qulaylik) */}
      <div className="relative z-10 mt-4 space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-slate-300">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>7-Kunlik Jackpot Sari: <strong>{currentCycleDay}/7</strong></span>
          </span>
          <span className="text-amber-400 font-bold">
            {currentCycleDay === 7 ? '👑 BUGUN MEGA BONUS!' : `${7 - currentCycleDay} kun qoldi`}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-yellow-400 transition-all duration-700 shadow-[0_0_10px_#fbbf24]"
            style={{ width: `${(currentCycleDay / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* 7-Day Progressive Reward Track */}
      <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/80">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {REWARD_SCHEDULE.map((item) => {
            const isPast = item.day < currentCycleDay;
            const isToday = item.day === currentCycleDay;
            const isClaimedPastOrToday = isPast || (isToday && isClaimedToday);

            let borderClass = 'border-slate-800 bg-slate-950/60 opacity-60';
            if (isToday) {
              borderClass = isClaimedToday
                ? 'border-amber-400 bg-amber-950/50 shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                : 'border-amber-400/80 bg-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.2)] animate-pulse';
            } else if (isPast) {
              borderClass = 'border-emerald-500/50 bg-emerald-950/20';
            }

            return (
              <div
                key={item.day}
                className={`relative rounded-2xl p-2 sm:p-2.5 border flex flex-col items-center justify-between transition-all ${borderClass}`}
              >
                {/* Day Header */}
                <div className="text-[10px] font-mono text-slate-400">
                  {item.day}-kun
                </div>

                {/* Reward Icon */}
                <div className="my-1.5">
                  {item.isSpecial ? (
                    <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                  ) : item.tickets >= 2 ? (
                    <Zap className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Coins className="w-4 h-4 text-amber-400" />
                  )}
                </div>

                {/* Reward Value */}
                <div className="space-y-0.5">
                  <div className="text-[11px] font-mono font-bold text-white">
                    +{item.coins}
                  </div>
                  <div className="text-[9px] font-mono text-cyan-400 font-semibold">
                    +{item.tickets} bilet
                  </div>
                </div>

                {/* Claim Status Badge */}
                <div className="mt-1.5">
                  {isClaimedPastOrToday ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                  ) : isToday ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 block mx-auto animate-ping" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-600 mx-auto" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Roadmap & Perks Guide */}
      {showFullSchedule && (
        <div className="relative z-10 mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 animate-fade-in">
          <div className="font-bold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Kiber Ketma-ketlik Imtiyozlari (Streak Perks):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <strong className="text-white">💰 Ko'payuvchi IQ Coins:</strong> Har kuni kirish ko'proq tangalar va tajriba ballari keltiradi.
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <strong className="text-cyan-400">⚡ Energiya Biletlari:</strong> 7 kunda jami 17 ta bepul energiya bileti taqdim etiladi.
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <strong className="text-amber-400">👑 7-Kun Kiber Jackpot:</strong> +500 tanga, 5 ta bilet va Kiber Afsona nishoni!
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Celebration Modal when claimed (100% Qulaylik & Yuqori Animatsiya) */}
    {showCelebrationModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400 p-6 text-center shadow-[0_0_50px_rgba(251,191,36,0.6)] space-y-4">
          <button
            onClick={() => setShowCelebrationModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-[0_0_30px_#fbbf24] animate-bounce">
            <Gift className="w-10 h-10 fill-current" />
          </div>

          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              {currentCycleDay}-KUN BONOSI OLINDI!
            </span>
            <h3 className="text-xl font-display font-black text-white mt-1.5">
              TABRIKLAYMIZ!
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Sizning ketma-ketlik zanjiringiz <strong>{streakDays} kun</strong>ga yetdi!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 flex flex-col items-center">
              <Coins className="w-6 h-6 text-amber-400 mb-1" />
              <span className="text-base font-bold text-white font-mono">+{todayReward.coins}</span>
              <span className="text-[10px] text-slate-400">IQ Tangalar</span>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex flex-col items-center">
              <Zap className="w-6 h-6 text-cyan-400 mb-1" />
              <span className="text-base font-bold text-white font-mono">+{todayReward.tickets}</span>
              <span className="text-[10px] text-slate-400">Energiya Bileti</span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playCyberClick();
              setShowCelebrationModal(false);
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-slate-950 font-display font-bold text-sm shadow-[0_0_20px_#fbbf24] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Ajoyib, Davom Etish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
  </>
  );
};
