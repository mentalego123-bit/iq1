import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import { Sparkles, Trophy, X, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WheelOfFortuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  canSpin: boolean;
  onRewardWon: (reward: { type: 'tickets' | 'coins' | 'rating' | 'badge'; amount?: number; label: string }) => void;
}

const SEGMENTS = [
  { label: '+5 Bilet', color: '#00d2ff', type: 'tickets' as const, amount: 5 },
  { label: '+50 Coins', color: '#fbbf24', type: 'coins' as const, amount: 50 },
  { label: '+25 Reyting', color: '#a855f7', type: 'rating' as const, amount: 25 },
  { label: '+3 Bilet', color: '#38bdf8', type: 'tickets' as const, amount: 3 },
  { label: '+100 Coins', color: '#f59e0b', type: 'coins' as const, amount: 100 },
  { label: '👑 Toj Nishon', color: '#ec4899', type: 'badge' as const, amount: 1 },
];

export const WheelOfFortuneModal: React.FC<WheelOfFortuneModalProps> = ({
  isOpen,
  onClose,
  canSpin,
  onRewardWon,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning || !canSpin) return;
    soundManager.playCyberClick();
    setSpinning(true);
    setWonReward(null);

    // Pick random segment
    const segmentIndex = Math.floor(Math.random() * SEGMENTS.length);
    const selected = SEGMENTS[segmentIndex];

    const segmentAngle = 360 / SEGMENTS.length;
    // Extra rotations (5 to 8 full spins)
    const extraRotations = (5 + Math.floor(Math.random() * 3)) * 360;
    const finalAngle = rotation + extraRotations + (360 - segmentIndex * segmentAngle - segmentAngle / 2);

    setRotation(finalAngle);

    setTimeout(() => {
      setSpinning(false);
      setWonReward(selected.label);
      soundManager.playVictoryFanfare();
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
      onRewardWon(selected);
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-slate-900 border border-amber-400/50 rounded-3xl p-6 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400 flex items-center justify-center text-amber-400 mb-2">
          <Gift className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-display font-bold text-white tracking-wide">
          OMAD G'ILDIRAGI
        </h3>
        <p className="text-xs text-cyan-400 font-mono mt-0.5">
          {canSpin ? "Kuniga 1 marta bepul aylantiring!" : "Bugungi imkoniyatdan foydalandingiz"}
        </p>

        {/* Wheel Graphic */}
        <div className="relative w-56 h-56 mx-auto my-6">
          {/* Wheel Pointer Arrow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow(0 0 8px #fbbf24)"></div>

          {/* Rotating Disc */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] relative overflow-hidden transition-transform ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: '3.8s',
            }}
          >
            {SEGMENTS.map((seg, idx) => {
              const angle = (360 / SEGMENTS.length) * idx;
              return (
                <div
                  key={idx}
                  className="absolute top-0 left-1/2 w-28 h-28 origin-bottom-left flex items-start justify-center pt-2"
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#0f172a' : '#1e293b',
                    transform: `rotate(${angle}deg)`,
                    clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                  }}
                >
                  <span
                    className="text-[10px] font-bold font-mono tracking-tight"
                    style={{ color: seg.color }}
                  >
                    {seg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 z-10 shadow-lg">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
        </div>

        {wonReward && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-400 text-emerald-300 text-xs font-bold animate-bounce">
            Tabriklaymiz! Siz {wonReward} yutib oldingiz! 🎉
          </div>
        )}

        <button
          onClick={handleSpin}
          disabled={spinning || !canSpin}
          className={`w-full h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
            canSpin && !spinning
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 shadow-amber-400/25 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>{spinning ? 'Aylanmoqda...' : canSpin ? 'G\'ildirakni Aylantirish' : 'Ertaga Qaytadan Aylantiring'}</span>
        </button>
      </div>
    </div>
  );
};
