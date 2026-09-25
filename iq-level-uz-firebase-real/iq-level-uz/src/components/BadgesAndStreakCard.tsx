import React, { useState } from 'react';
import { UserProfile } from '../types';
import { soundManager } from '../utils/audio';
import { Flame, Award, Shield, CheckCircle2, Lock, Sparkles, ChevronRight, Zap, Trophy, Gift } from 'lucide-react';

interface BadgesAndStreakCardProps {
  userProfile: UserProfile;
  onClaimDailyStreak: () => void;
  onOpenWheel: () => void;
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  condition: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export const ALL_10_BADGES: BadgeInfo[] = [
  {
    id: 'badge-1',
    name: 'Mantiq Qiroli',
    description: 'IQ testda 135+ ball to\'planganda beriladi',
    condition: 'IQ Test >= 135 ball',
    icon: '👑',
    tier: 'gold',
  },
  {
    id: 'badge-6',
    name: 'IQ Darajasi Full (140+)',
    description: 'Mutlaq daho (Genius Top 0.2%) cho\'qqisiga erishganda',
    condition: 'IQ Test >= 140 ball',
    icon: '🧠',
    tier: 'diamond',
  },
  {
    id: 'badge-2',
    name: 'Tezkor Reaksiya',
    description: 'Stroop yoki reaksiya sinovida yuqori tezlik ko\'rsatganda',
    condition: 'Stroop Test >= 20 ball',
    icon: '⚡',
    tier: 'silver',
  },
  {
    id: 'badge-7',
    name: 'Subway Kiber Runner',
    description: '3D Runner trassasida to\'siqlardan chaqqon qochganda',
    condition: 'Runnerda >= 300 ball',
    icon: '🛹',
    tier: 'silver',
  },
  {
    id: 'badge-3',
    name: 'Duel Qotili',
    description: '1v1 jonli intellekt duelida 5+ g\'alaba qozonganda',
    condition: 'Duel g\'alabalari >= 5',
    icon: '⚔️',
    tier: 'gold',
  },
  {
    id: 'badge-8',
    name: 'Matritsa Xotirasi',
    description: '4x4 katakli xotira matritsasining barcha raundlarini yechganda',
    condition: 'Memory Matrix to\'liq g\'alaba',
    icon: '🧩',
    tier: 'silver',
  },
  {
    id: 'badge-9',
    name: 'Boshqotirma Donosi',
    description: 'Tezkor matematika poygasida raqibdan oldin 10 ta misol yechganda',
    condition: 'Speed Math 1v1 g\'alaba',
    icon: '🎯',
    tier: 'gold',
  },
  {
    id: 'badge-4',
    name: 'Kiber Boshlovchi',
    description: 'IQ Level Uz intellekt portaliga muvaffaqiyatli qo\'shilganda',
    condition: 'Ro\'yxatdan o\'tish',
    icon: '🚀',
    tier: 'bronze',
  },
  {
    id: 'badge-5',
    name: 'Omadli Daho',
    description: 'Omad g\'ildiragida maxsus sovrin yoki tojni yutib olganda',
    condition: 'G\'ildirakdan yutuq',
    icon: '🎡',
    tier: 'gold',
  },
  {
    id: 'badge-10',
    name: 'Kiber Afsona',
    description: '10-Daraja (Mutlaq Kiber Daho) oliy martabasiga ko\'tarilganda',
    condition: '10-Daraja (2900+ XP)',
    icon: '🌟',
    tier: 'diamond',
  },
];

export const LEVEL_TIERS = [
  { level: 1, title: 'Boshlovchi', minXp: 0, maxXp: 250, icon: '🔰' },
  { level: 2, title: 'Sinovchi', minXp: 250, maxXp: 500, icon: '🔍' },
  { level: 3, title: 'Mantiq Izlovchi', minXp: 500, maxXp: 750, icon: '💡' },
  { level: 4, title: 'Intellekt Ustasi', minXp: 750, maxXp: 1000, icon: '🧠' },
  { level: 5, title: 'Kiber Strateg', minXp: 1000, maxXp: 1300, icon: '🛡️' },
  { level: 6, title: 'Fikr Magnati', minXp: 1300, maxXp: 1650, icon: '💎' },
  { level: 7, title: 'Daho Konstruktor', minXp: 1650, maxXp: 2000, icon: '⚙️' },
  { level: 8, title: 'Kognitiv Elita', minXp: 2000, maxXp: 2400, icon: '🌌' },
  { level: 9, title: 'Super Intelekt', minXp: 2400, maxXp: 2900, icon: '⚡' },
  { level: 10, title: 'Mutlaq Kiber Daho', minXp: 2900, maxXp: 5000, icon: '👑' },
];

export const BadgesAndStreakCard: React.FC<BadgesAndStreakCardProps> = ({
  userProfile,
  onClaimDailyStreak,
  onOpenWheel,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);
  const [showAllLevels, setShowAllLevels] = useState(false);

  const currentXp = userProfile.xp || 0;
  
  // Calculate level based on XP
  const currentTier = LEVEL_TIERS.find(
    (t) => currentXp >= t.minXp && currentXp < t.maxXp
  ) || (currentXp >= 2900 ? LEVEL_TIERS[9] : LEVEL_TIERS[0]);

  const currentLevel = currentTier.level;
  const currentLevelTitle = currentTier.title;
  
  const xpInCurrentTier = currentXp - currentTier.minXp;
  const tierSpan = currentTier.maxXp - currentTier.minXp;
  const xpProgress = Math.min(100, Math.max(0, Math.round((xpInCurrentTier / tierSpan) * 100)));

  const unlockedCount = ALL_10_BADGES.filter((b) =>
    userProfile.badges?.includes(b.id) || b.id === 'badge-4'
  ).length;

  return (
    <div className="space-y-4">
      {/* 2-Column Grid: Left Streak & Levels, Right Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Daily Streak & Level Card */}
        <div className="relative p-5 rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-cyan-500/30 shadow-2xl space-y-4 overflow-hidden">
          {/* Neon Glow Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Daily Streak Header with Gold Neon Glow when Claimed */}
          <div className={`flex items-center justify-between p-2.5 rounded-2xl transition-all duration-500 ${
            userProfile.streakClaimedToday
              ? 'bg-amber-950/40 border border-amber-400/70 shadow-[0_0_25px_rgba(251,191,36,0.35)]'
              : 'border border-transparent'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                userProfile.streakClaimedToday
                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border border-white shadow-[0_0_20px_#fbbf24]'
                  : 'bg-amber-500/20 border border-amber-400/80 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
              }`}>
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-[11px] font-mono text-amber-400 tracking-wider font-bold">
                  KUNLIK KIRISH ZANJIRI
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <span className={userProfile.streakClaimedToday ? 'text-amber-300 font-extrabold' : ''}>
                    🔥 {userProfile.streakDays || 1} kun ketma-ket
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    userProfile.streakClaimedToday
                      ? 'bg-amber-400/30 text-amber-200 border border-amber-400/50'
                      : 'bg-amber-400/20 text-amber-300'
                  }`}>
                    {userProfile.streakClaimedToday ? '✨ Faol' : '+15 Coin'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playCyberClick();
                onClaimDailyStreak();
              }}
              disabled={userProfile.streakClaimedToday}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                !userProfile.streakClaimedToday
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 shadow-amber-400/30 animate-bounce'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {userProfile.streakClaimedToday ? 'Olingan ✓' : 'Bonusni Olish'}
            </button>
          </div>

          {/* Level Progress Bar & Title */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <span className="text-base">{currentTier.icon}</span>
                <span>{currentLevel}-Daraja: <strong className="text-white">{currentLevelTitle}</strong></span>
              </div>
              <button
                onClick={() => setShowAllLevels(!showAllLevels)}
                className="text-[11px] text-cyan-400 hover:text-cyan-200 underline flex items-center gap-0.5"
              >
                <span>Barcha darajalar</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-700 shadow-[0_0_10px_#00d2ff]"
                style={{ width: `${xpProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{currentXp} XP to'plandi</span>
              <span>Keyingi daraja: {currentTier.maxXp} XP</span>
            </div>
          </div>

          {/* Wheel of Fortune Button */}
          <button
            onClick={() => {
              soundManager.playCyberClick();
              onOpenWheel();
            }}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border border-amber-400/40 hover:border-amber-300 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-400/10 active:scale-98 transition-all"
          >
            <Gift className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>🎡 Omad G'ildiragini Aylantirish (Bepul Sovg'a)</span>
          </button>
        </div>

        {/* 2. 10x Badges & Trophies Showcase */}
        <div className="relative p-5 rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-purple-500/30 shadow-2xl space-y-3 overflow-hidden">
          {/* Neon Glow Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/80 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono text-purple-400 tracking-wider font-bold">
                  10 TA MAXSUS NISHONLAR
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-white">{unlockedCount} / 10</span>
                  <span className="text-slate-400">ochildi</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-mono">
                    {Math.round((unlockedCount / 10) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 10 Badges Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
            {ALL_10_BADGES.map((b) => {
              const isUnlocked = userProfile.badges?.includes(b.id) || b.id === 'badge-4';
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    soundManager.playCyberClick();
                    setSelectedBadge(b);
                  }}
                  className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] ${
                    isUnlocked
                      ? 'bg-slate-950/90 border-cyan-400/40 hover:border-cyan-300 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="text-2xl shrink-0 filter drop-shadow(0 0 4px rgba(255,255,255,0.2))">
                    {b.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold truncate flex items-center justify-between">
                      <span className="truncate">{b.name}</span>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0 ml-1" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-600 shrink-0 ml-1" />
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">{b.condition}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Levels Modal/Accordion */}
      {showAllLevels && (
        <div className="p-4 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl animate-fade-in space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>10 TA KIBER INTELEKT DARAJALARI (XP TIER SYSTEM)</span>
            </div>
            <button
              onClick={() => setShowAllLevels(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5"
            >
              Yopish
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {LEVEL_TIERS.map((tier) => {
              const isCurrent = tier.level === currentLevel;
              const isAchieved = currentXp >= tier.minXp;
              return (
                <div
                  key={tier.level}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/30'
                      : isAchieved
                      ? 'bg-slate-950/80 border-slate-700 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="text-xl mb-0.5">{tier.icon}</div>
                  <div className="text-xs font-bold truncate">{tier.level}-Daraja</div>
                  <div className="text-[10px] text-slate-300 truncate">{tier.title}</div>
                  <div className="text-[9px] font-mono text-cyan-400 mt-1">
                    {tier.minXp} XP
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Badge Detail Modal if clicked */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-center space-y-4">
            <div className="text-5xl filter drop-shadow(0 0 15px rgba(0,210,255,0.4))">
              {selectedBadge.icon}
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                {selectedBadge.name}
              </h3>
              <p className="text-xs text-cyan-300 font-mono mt-1">
                Sharti: {selectedBadge.condition}
              </p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
              {userProfile.badges?.includes(selectedBadge.id) || selectedBadge.id === 'badge-4' ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Siz ushbu nishonga erishgansiz!
                </span>
              ) : (
                <span className="text-amber-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  Hali qulfdan chiqarilmagan
                </span>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full h-10 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
