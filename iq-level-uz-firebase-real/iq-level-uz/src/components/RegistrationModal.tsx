import React, { useState } from 'react';
import { UserProfile } from '../types';
import { soundManager } from '../utils/audio';
import { ArrowRight, Sparkles } from 'lucide-react';
import logoImg from '../assets/images/iq_level_logo_1790108461494.jpg';

interface RegistrationModalProps {
  onRegister: (profile: UserProfile) => void;
  presetId: string;
  presetName?: string;
}

const AVATAR_OPTIONS = [
  { emoji: '🧠', label: 'Daho Miya' },
  { emoji: '👑', label: 'Lider' },
  { emoji: '⚡', label: 'Kiber Tezkor' },
  { emoji: '🚀', label: 'Strateg' },
  { emoji: '🎯', label: 'Mergan' },
  { emoji: '💎', label: 'Almos Intellekt' },
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onRegister, presetId, presetName }) => {
  const [name, setName] = useState(presetName || '');
  const [selectedAvatar, setSelectedAvatar] = useState('🧠');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Iltimos, ismingizni kiriting!');
      soundManager.playErrorBuzz();
      return;
    }
    if (cleanName.length < 2) {
      setError("Ism kamida 2 ta belgidan iborat bo'lishi kerak!");
      soundManager.playErrorBuzz();
      return;
    }

    soundManager.playSuccessChime();

    // Real account: every stat genuinely starts at zero and only grows
    // from what this person actually does in the app from now on.
    const newProfile: UserProfile = {
      id: presetId,
      name: cleanName,
      avatar: selectedAvatar,
      iqScore: 0,
      bestIq: 0,
      duelRating: 1200,
      energyTickets: 10,
      iqCoins: 0,
      completedTestsCount: 0,
      duelWins: 0,
      duelLosses: 0,
      isBanned: false,
      joinedAt: new Date().toISOString().split('T')[0],
      referralsCount: 0,
      hasReceivedAutoReminder: false,
      streakDays: 1,
      lastLoginDate: new Date().toISOString().slice(0, 10),
      streakClaimedToday: false,
      xp: 0,
      level: 1,
      levelTitle: 'Boshlovchi',
      weeklyTimeSpentSeconds: 0,
      badges: [],
    };

    onRegister(newProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 text-center">
        {/* Glow behind */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none"></div>

        {/* Logo Avatar & Entrance Branding */}
        <div className="relative mx-auto w-24 h-24 mb-3 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-amber-400 shadow-2xl shadow-cyan-500/40 animate-pulse">
          <img
            src={logoImg}
            alt="IQ Level Uz Logo"
            className="w-full h-full object-cover rounded-full"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-lg border-2 border-slate-950">
            UZ
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
          IQ LEVEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300">UZ</span>
        </h2>
        <div className="text-sm font-bold text-amber-300 font-display mt-1">
          MANTIQ VA IQ DARAJANGIZNI ANIQLANG
        </div>
        <p className="text-[11px] text-cyan-400 font-mono mt-0.5 tracking-wide">
          O'ZBEKISTON MILLIY KIBER INTELLEKT PORTALI
        </p>

        <div className="mt-3.5 p-3 bg-slate-950/70 rounded-2xl border border-cyan-500/30 text-xs text-slate-300 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-cyan-300 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Kiber intellekt sinoviga xush kelibsiz!</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Mantiqiy savollar, rasmiy PNG sertifikat va 1v1 onlayn duellar kutmoqda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">
              To'liq Ismingiz
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Masalan: Sardor Aliyev"
              className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all"
              autoFocus
            />
            {error && (
              <p className="text-rose-400 text-xs mt-1.5 ml-1">{error}</p>
            )}
          </div>

          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">
              Kiber Avatar Tanlang
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((item) => (
                <button
                  type="button"
                  key={item.emoji}
                  onClick={() => {
                    soundManager.playCyberClick();
                    setSelectedAvatar(item.emoji);
                  }}
                  className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedAvatar === item.emoji
                      ? 'bg-cyan-500/20 border-2 border-cyan-400 scale-105 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                  }`}
                  title={item.label}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
          >
            <span>Boshlash</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 mt-4">
          Boshlash orqali siz kiber intellekt ligasiga a'zo bo'lasiz
        </p>
      </div>
    </div>
  );
};
