import React, { useState } from 'react';
import { UserProfile } from '../types';
import { soundManager } from '../utils/audio';
import { Users, Copy, Check, Ticket, Gift, Share2 } from 'lucide-react';

interface ReferralModuleProps {
  currentUser: UserProfile;
  onClaimBonus: (bonusTickets: number) => void;
}

export const ReferralModule: React.FC<ReferralModuleProps> = ({
  currentUser,
  onClaimBonus,
}) => {
  const [copied, setCopied] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const referralLink = `https://t.me/IQLevelUzBot?start=ref_${currentUser.id.replace('usr-', '')}`;

  const handleCopy = () => {
    soundManager.playCyberClick();
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    soundManager.playCyberClick();
    const text = encodeURIComponent(
      `🧠 Men IQ Level Uz da mantiqiy darajamni tekshirdim! Do'stlaring bilan 1v1 duel o'yna va o'z aqlingni sinab ko'r! 🚀\nUlanish: ${referralLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  const handleClaimInitialReward = () => {
    if (claimed) return;
    soundManager.playSuccessChime();
    setClaimed(true);
    onClaimBonus(5);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-xl text-center relative overflow-hidden">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 mb-3 shadow-lg shadow-cyan-500/25">
          <Users className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-display font-bold text-white tracking-wide">
          DO'STLARNI TAKLIF QILING
        </h2>
        <p className="text-xs text-cyan-400 font-mono mt-0.5">
          Har bir taklif qilingan do'st uchun +3 Energiya Bileti va +50 Duel reytingi
        </p>

        {/* Stats Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400">Taklif Qilinganlar</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {currentUser.referralsCount} kishi
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400">Mavjud Biletlar</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1 flex items-center justify-center gap-1">
              <Ticket className="w-5 h-5" />
              <span>{currentUser.energyTickets}</span>
            </div>
          </div>
        </div>

        {/* Referral Link Copy Area */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2">
          <div className="text-[11px] text-left text-slate-400 ml-1">
            Sizning Maxsus Taklif Havolangiz:
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="h-10 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Nusxalandi' : 'Nusxa'}</span>
            </button>
          </div>
        </div>

        {/* Telegram Direct Share */}
        <button
          onClick={handleShare}
          className="w-full mt-3 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Telegram orqali Do'stlarga Yuborish</span>
        </button>
      </div>

        {/* Bonus Milestone Cards */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Gift className="w-4 h-4" />
            <span>Bonus Va Sovg'alar</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Birinchi Kirish Bonusi</div>
              <div className="text-[11px] text-slate-400">+5 ta bepul duel va o'yin bileti</div>
            </div>
            <button
              onClick={handleClaimInitialReward}
              disabled={claimed}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                claimed
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow cursor-pointer'
              }`}
            >
              {claimed ? 'Olingan ✓' : 'Olish'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">3 ta do'st taklifi (Test Izohlarini Ochish)</div>
              <div className="text-[11px] text-slate-400">IQ testdagi barcha to'g'ri javoblarning yechimini ko'rish huquqi</div>
            </div>
            <span className={`text-xs font-mono font-bold ${currentUser.referralsCount >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {currentUser.referralsCount} / 3 {currentUser.referralsCount >= 3 ? '✓ Ochiq' : 'Qulflangan'}
            </span>
          </div>
        </div>

        {/* Do'stlar Dueli (Challenge) Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-cyan-950/40 border border-purple-500/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>⚔️ Do'stlar Dueli (Challenge Havolasi)</span>
            </div>
            <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-900/50 border border-purple-600/50">
              VIRAL DUEL
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Do'stingizga: "Men IQ testda {currentUser.bestIq || currentUser.iqScore || 115} ball oldim, sen qancha ola olasan?" xabarini yuborib unga chaqiruv tashlang!
          </p>
          <button
            onClick={() => {
              soundManager.playCyberClick();
              const challengeScore = currentUser.bestIq || currentUser.iqScore || 115;
              const text = encodeURIComponent(
                `⚡ DO'STLAR DUELI! Men IQ testda ${challengeScore} ball oldim! 🔥\nSen qancha ola olasan? O'z aqlingni sinab ko'r va menga qarshi bellash: ${referralLink}`
              );
              window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
            }}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>Do'stga Chaqiruv Yuborish (Telegram)</span>
          </button>
        </div>
    </div>
  );
};
