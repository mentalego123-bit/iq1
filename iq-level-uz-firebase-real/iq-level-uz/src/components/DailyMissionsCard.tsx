import React from 'react';
import { DailyMission, UserProfile, NavigationTab } from '../types';
import { soundManager } from '../utils/audio';
import {
  Target,
  CheckCircle2,
  Coins,
  Sparkles,
  Zap,
  ArrowRight,
  Send,
  Swords,
  Brain,
  Gamepad2,
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyMissionsCardProps {
  userProfile: UserProfile;
  customMissions?: DailyMission[];
  onClaimMissionReward: (missionId: string, coins: number, xp: number) => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenLinkMission?: (mission: DailyMission) => void;
}

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  userProfile,
  customMissions = [],
  onClaimMissionReward,
  onNavigate,
  onOpenLinkMission,
}) => {
  // Built-in standard missions
  const todayGamePlays = userProfile.dailyGamePlays;
  const totalGamesPlayedToday = todayGamePlays
    ? (todayGamePlays.runner3d || 0) +
      (todayGamePlays.memory4x4 || 0) +
      (todayGamePlays.stroop || 0) +
      (todayGamePlays.speedmath || 0) +
      (todayGamePlays.cipherCode || 0) +
      (todayGamePlays.laserReflex || 0) +
      (todayGamePlays.colorReflex || 0) +
      (todayGamePlays.patternMatch || 0)
    : 0;

  // Duels played today (tracked in state or minimum check)
  const duelCount = (userProfile.duelWins || 0) + (userProfile.duelLosses || 0);

  const defaultMissions: DailyMission[] = [
    {
      id: 'mission-visit',
      title: 'Ilovaga kirish',
      description: "Har kuni kirib kiber tizimni faollashtiring",
      rewardCoins: 25,
      rewardXp: 50,
      icon: 'app',
      targetCount: 1,
      currentCount: 1,
      actionType: 'visit_app',
    },
    {
      id: 'mission-duel',
      title: "1 ta 1v1 Duel o'ynang",
      description: "Onlayn arenada raqib bilan bellashing",
      rewardCoins: 40,
      rewardXp: 80,
      icon: 'duel',
      targetCount: 1,
      currentCount: Math.min(1, duelCount > 0 ? 1 : 0),
      actionType: 'play_duel',
    },
    {
      id: 'mission-games',
      title: "3 ta Mini-O'yin bajaring",
      description: "Runner, Stroop, Matritsa yoki Lazer o'yinlarida mashq qiling",
      rewardCoins: 60,
      rewardXp: 120,
      icon: 'game',
      targetCount: 3,
      currentCount: Math.min(3, totalGamesPlayedToday),
      actionType: 'complete_games',
    },
    {
      id: 'mission-test',
      title: "IQ Test topshiring",
      description: "20 ta mantiqiy savoldan iborat rasmiy testni yeching",
      rewardCoins: 100,
      rewardXp: 200,
      icon: 'test',
      targetCount: 1,
      currentCount: Math.min(1, userProfile.completedTestsCount > 0 ? 1 : 0),
      actionType: 'pass_test',
    },
  ];

  // Combine default with admin custom missions
  const allMissions: DailyMission[] = [
    ...defaultMissions,
    ...customMissions.map((m) => {
      const userState = userProfile.dailyMissions?.[m.id];
      return {
        ...m,
        currentCount: userState?.currentCount || 0,
      };
    }),
  ];

  const missionsState = userProfile.dailyMissions || {};

  // Compute completed / claimed
  const totalCompletedCount = allMissions.filter((m) => {
    const isClaimed = missionsState[m.id]?.isClaimed;
    const isTargetMet = (m.currentCount || 0) >= m.targetCount;
    return isClaimed || isTargetMet;
  }).length;

  const handleClaim = (mission: DailyMission) => {
    soundManager.playVictoryFanfare();

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00d2ff', '#fbbf24', '#10b981', '#a855f7'],
    });

    onClaimMissionReward(mission.id, mission.rewardCoins, mission.rewardXp);
  };

  const handleAction = (mission: DailyMission) => {
    soundManager.playCyberClick();
    if (mission.actionType === 'play_duel') {
      onNavigate('duel');
    } else if (mission.actionType === 'complete_games') {
      onNavigate('games');
    } else if (mission.actionType === 'pass_test') {
      onNavigate('test');
    } else if (mission.linkUrl) {
      if (onOpenLinkMission) {
        onOpenLinkMission(mission);
      } else {
        window.open(mission.linkUrl, '_blank');
      }
    }
  };

  const getMissionIcon = (iconType: string) => {
    switch (iconType) {
      case 'duel':
        return <Swords className="w-5 h-5 text-amber-400" />;
      case 'game':
        return <Gamepad2 className="w-5 h-5 text-cyan-400" />;
      case 'test':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'channel':
      case 'telegram_sub':
        return <Send className="w-5 h-5 text-sky-400" />;
      default:
        return <Target className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950 border border-cyan-500/40 shadow-[0_0_35px_rgba(0,210,255,0.12)] overflow-hidden">
      {/* Background glow rays */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.3)]">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-display font-black text-white tracking-wide">
                KUNLIK MISSIYALAR
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">
                +{allMissions.reduce((acc, m) => acc + m.rewardCoins, 0)} Tanga
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Vazifalarni bajaring, XP ballari va IQ tangalarini to'plang
            </p>
          </div>
        </div>

        {/* Progress Counter Pill */}
        <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2 shadow-inner">
          <span>Jarayon:</span>
          <strong className="text-cyan-400 font-bold">
            {totalCompletedCount} / {allMissions.length}
          </strong>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="relative z-10 mb-5">
        <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 transition-all duration-700 shadow-[0_0_10px_#00d2ff]"
            style={{ width: `${(totalCompletedCount / allMissions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Missions Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3">
        {allMissions.map((mission) => {
          const isClaimed = missionsState[mission.id]?.isClaimed;
          const currentCount = mission.currentCount || 0;
          const isTargetMet = currentCount >= mission.targetCount;
          const percent = Math.min(100, Math.round((currentCount / mission.targetCount) * 100));

          return (
            <div
              key={mission.id}
              className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 overflow-hidden ${
                isClaimed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                  : isTargetMet
                  ? 'bg-slate-900/95 border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.18)]'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                    {getMissionIcon(mission.icon)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{mission.title}</span>
                      {mission.linkUrl && (
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {mission.description}
                    </p>
                  </div>
                </div>

                {/* Reward Badges */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>+{mission.rewardCoins}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-400/30 text-purple-300 font-mono text-[10px] font-bold">
                    <Zap className="w-3 h-3 text-purple-400" />
                    <span>+{mission.rewardXp} XP</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Action Button Strip */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Jarayon:</span>
                  <span className="font-bold text-slate-300">
                    {currentCount} / {mission.targetCount} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTargetMet
                        ? 'bg-gradient-to-r from-emerald-400 to-amber-400'
                        : 'bg-cyan-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="pt-1">
                  {isClaimed ? (
                    <div className="w-full py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>OLINDI ✓</span>
                    </div>
                  ) : isTargetMet ? (
                    <button
                      onClick={() => handleClaim(mission)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-display font-black text-xs shadow-[0_0_15px_#fbbf24] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>MUKOFOTNI OLISH</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(mission)}
                      className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Bajarish</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
