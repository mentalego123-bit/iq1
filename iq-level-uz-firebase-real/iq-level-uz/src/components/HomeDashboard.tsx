import React from 'react';
import { UserProfile, NavigationTab, BroadcastNotification, DuelOutcome, DailyMission } from '../types';
import { soundManager } from '../utils/audio';
import { Brain, Swords, Grid, Trophy, Sparkles, ArrowRight, Bell, Zap, Gift, Bot, Crown, Award, CheckCircle2 } from 'lucide-react';
import { BadgesAndStreakCard } from './BadgesAndStreakCard';
import { DailyLoginRewards } from './DailyLoginRewards';
import { DailyMissionsCard } from './DailyMissionsCard';
import { RecentDuelFeed } from './RecentDuelFeed';
import logoImg from '../assets/images/iq_level_logo_1790108461494.jpg';

interface HomeDashboardProps {
  userProfile: UserProfile;
  onNavigate: (tab: NavigationTab) => void;
  activeBroadcast: BroadcastNotification | null;
  onDismissBroadcast: () => void;
  onStartTest: () => void;
  onStartDuel: () => void;
  onClaimDailyStreak: (reward?: { coins: number; tickets: number; day: number }) => void;
  onOpenWheel: () => void;
  onViewCertificate?: () => void;
  recentDuels?: DuelOutcome[];
  customMissions?: DailyMission[];
  onClaimMissionReward?: (missionId: string, coins: number, xp: number) => void;
  onOpenLinkMission?: (mission: DailyMission) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userProfile,
  onNavigate,
  activeBroadcast,
  onDismissBroadcast,
  onStartTest,
  onStartDuel,
  onClaimDailyStreak,
  onOpenWheel,
  onViewCertificate,
  recentDuels = [],
  customMissions = [],
  onClaimMissionReward = () => {},
  onOpenLinkMission,
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-6 animate-fade-in overflow-hidden">
      {/* Background Animated Cyber Glows & Ambient Rays */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Live Broadcast Notice if active */}
      {activeBroadcast && (
        <div className="relative z-10 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border border-amber-400/50 shadow-lg flex items-center justify-between gap-3 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-400 shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-300">ADMIN BILDIRISHNOMASI</div>
              <p className="text-xs text-slate-200 truncate">{activeBroadcast.message}</p>
            </div>
          </div>
          <button
            onClick={onDismissBroadcast}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Yopish
          </button>
        </div>
      )}

      {/* Hero Showcase Section with Animated Glowing Cyber Bot Mascot */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-cyan-500/40 p-6 sm:p-8 shadow-[0_0_35px_rgba(0,210,255,0.15)] overflow-hidden">
        {/* Subtle Cyber Grid Lines inside hero */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d2ff08_1px,transparent_1px),linear-gradient(to_bottom,#00d2ff08_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

        {/* Dynamic Light Rays */}
        <div className="absolute -top-10 right-1/4 w-60 h-60 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Left Column: Heading + Bot Logo side by side */}
          <div className="text-center lg:text-left space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-[11px] font-mono text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>O'ZBEKISTONNING RASMIY INTELEKT PORTALI</span>
            </div>

            {/* Sarlavha va uning yonidagi Asosiy Kiber Logotip */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Rasmiy Asosiy Logotip Neon Halo va Crown bilan */}
              <div className="relative shrink-0 group">
                {/* Rotating Glowing Neon Ring */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-amber-400 opacity-80 blur-sm group-hover:opacity-100 transition-opacity animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-2xl p-1.5 overflow-hidden">
                  {/* Golden Crown on top of Logo */}
                  <div className="absolute -top-3.5 z-20 flex justify-center">
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-0.5 shadow-[0_0_10px_#fbbf24]">
                      <Crown className="w-3 h-3 fill-current text-slate-950" />
                      RASMIY
                    </span>
                  </div>

                  {/* Asosiy IQ Level Uz Logotipi */}
                  <img
                    src={logoImg}
                    alt="IQ Level Uz Rasmiy Logotipi"
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                  />

                  {/* UZ badge */}
                  <div className="absolute bottom-1 right-1 z-10 px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] shadow border border-slate-950">
                    UZ
                  </div>
                </div>
              </div>

              {/* Title & Description & Slogan Pills */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white tracking-tight leading-snug">
                  MANTIQ VA IQ DARAJANGIZNI{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 filter drop-shadow(0 0 16px rgba(0,210,255,0.4))">
                    ANIQLANG
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  20 ta rasmiy test savollari, real vaqt rejimidagi 1v1 onlayn duellar, tasdiqlangan PNG Sertifikat, Subway 3D Runner va haftalik 15 Stars sovg'alari!
                </p>

                {/* Slogan & Usability Mini Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                    🧠 Mantiqiy IQ darajangizni aniqlang
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-[10px] font-mono text-amber-300">
                    ⚡ 1v1 Onlayn Duellar
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-950/70 border border-purple-500/40 text-[10px] font-mono text-purple-300">
                    📜 Rasmiy Sertifikat
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => {
                  soundManager.playCyberClick();
                  onStartTest();
                }}
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)] active:scale-95 transition-all"
              >
                <Brain className="w-4 h-4" />
                <span>IQ Testni Boshlash (20 Savol)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundManager.playCyberClick();
                  onStartDuel();
                }}
                className="h-12 px-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-semibold text-xs sm:text-sm border border-amber-400/50 flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.2)] active:scale-95 transition-all"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                <span>1v1 Duel Qidirish</span>
              </button>

              {(userProfile.iqScore > 0 || (userProfile.bestIq || 0) > 0) && onViewCertificate && (
                <button
                  onClick={() => {
                    soundManager.playCyberClick();
                    onViewCertificate();
                  }}
                  className="h-12 px-5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 text-cyan-300 font-semibold text-xs sm:text-sm border border-cyan-400/50 flex items-center gap-2 shadow-[0_0_15px_rgba(0,210,255,0.25)] active:scale-95 transition-all"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>IQ Sertifikatim</span>
                </button>
              )}
            </div>
          </div>

          {/* Weekly Stars Prize Showcase Badge */}
          <div
            onClick={() => onNavigate('leaderboard')}
            className="p-5 rounded-3xl bg-slate-950/90 border border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.15)] text-center cursor-pointer hover:border-amber-300 transition-all hover:scale-105 shrink-0 max-w-xs"
          >
            <div className="relative w-14 h-14 mx-auto rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-400 mb-2 shadow-[0_0_15px_#fbbf24]">
              <Gift className="w-7 h-7 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="text-xs font-bold text-amber-300 font-mono tracking-wider">HAFTALIK TOP 3</div>
            <div className="text-base font-bold text-white mt-1">🎁 15 Stars / Sovg'a</div>
            <div className="text-[11px] text-slate-400 mt-1">Min. 40+ ball & 5 min faol bo'lish</div>
            <div className="mt-3 py-1 px-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-[10px] text-amber-300 font-mono">
              Reytingni ko'rish ➜
            </div>
          </div>
        </div>
      </div>

      {/* Daily Login Rewards System with Visual Streak Counter & Gold Neon Glow */}
      <DailyLoginRewards
        userProfile={userProfile}
        onClaimReward={(reward) => onClaimDailyStreak(reward)}
      />

      {/* Daily Missions System (Kunlik Missiyalar) */}
      <DailyMissionsCard
        userProfile={userProfile}
        customMissions={customMissions}
        onClaimMissionReward={onClaimMissionReward}
        onNavigate={onNavigate}
        onOpenLinkMission={onOpenLinkMission}
      />

      {/* Gamification: 10 Badges, Level XP & Daily Streak */}
      <BadgesAndStreakCard
        userProfile={userProfile}
        onClaimDailyStreak={() => onClaimDailyStreak()}
        onOpenWheel={onOpenWheel}
      />

      {/* Recent Duel Results Feed (So'nggi 1v1 Jonli Duel Natijalari) */}
      <RecentDuelFeed
        recentDuels={recentDuels}
        onStartDuel={onStartDuel}
      />

      {/* User Stats Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Eng Yaxshi IQ</div>
          <div className="text-2xl font-bold font-display text-cyan-400 mt-1">
            {userProfile.bestIq || userProfile.iqScore || '—'}
          </div>
          <div className="text-[11px] text-slate-400">
            {userProfile.bestIq >= 140
              ? "Mutlaq Daho"
              : userProfile.bestIq >= 120
              ? "Yuqori intellekt"
              : "Sinovdan o'ting"}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-400/20 flex flex-col justify-between">
          <div className="text-xs text-slate-400">1v1 Duel Reytingi</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {userProfile.duelRating}
          </div>
          <div className="text-[11px] text-emerald-400">
            {userProfile.duelWins} G'alaba · {userProfile.duelLosses} Mag'lubiyat
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Energiya Biletlari</div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
            {userProfile.energyTickets} ta
          </div>
          <div className="text-[11px] text-slate-400">O'yinlar va duellar uchun</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Faol Vaqtingiz</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {Math.floor((userProfile.weeklyTimeSpentSeconds || 320) / 60)} min
          </div>
          <div className="text-[11px] text-slate-400">Haftalik hisobda</div>
        </div>
      </div>

      {/* Main Feature Navigation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: 20 IQ Test */}
        <div
          onClick={() => {
            soundManager.playCyberClick();
            onNavigate('test');
          }}
          className="relative p-5 rounded-3xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer group transition-all shadow-xl hover:scale-[1.01] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(0,210,255,0.2)]">
              <Brain className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              45s TAYMER
            </span>
          </div>
          <h3 className="text-base font-display font-bold text-white group-hover:text-cyan-300">
            20 ta Kompleks IQ Test
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Mantiqiy matritsalar, fazoviy shakllar va matematik ketma-ketliklarni yeching va rasmiy sertifikat oling.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <span>Testni boshlash</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: 1v1 Online Duel */}
        <div
          onClick={() => {
            soundManager.playCyberClick();
            onNavigate('duel');
          }}
          className="relative p-5 rounded-3xl bg-slate-900 border border-amber-400/30 hover:border-amber-400 cursor-pointer group transition-all shadow-xl hover:scale-[1.01] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(251,191,36,0.2)]">
              <Swords className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              JONLI 1V1
            </span>
          </div>
          <h3 className="text-base font-display font-bold text-white group-hover:text-amber-300">
            Online Duel Rejimi
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Haqiqiy o'yinchilar bilan tezlik va mantiq bo'yicha kuch sinashing. Har bir g'alaba reytingingizni oshiradi!
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <span>Raqib qidirish</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Mini Games & Subway 3D Runner */}
        <div
          onClick={() => {
            soundManager.playCyberClick();
            onNavigate('games');
          }}
          className="relative p-5 rounded-3xl bg-slate-900 border border-purple-500/30 hover:border-purple-400 cursor-pointer group transition-all shadow-xl hover:scale-[1.01] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              SUBWAY 3D RUNNER
            </span>
          </div>
          <h3 className="text-base font-display font-bold text-white group-hover:text-purple-300">
            Subway Runner & O'yinlar
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Subway Surfers kabi 4D Kiber Runner, 4x4 Memory Matrix, Stroop va Speed Math 1v1 trenajyorlari!
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-purple-400">
            <span>O'yinlarni o'ynash</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
