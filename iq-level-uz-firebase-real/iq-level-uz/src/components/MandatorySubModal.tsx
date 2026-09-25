import React, { useState } from 'react';
import { ChannelSubscription } from '../types';
import { soundManager } from '../utils/audio';
import { Lock, ExternalLink, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface MandatorySubModalProps {
  channels: ChannelSubscription[];
  onVerified: () => void;
}

export const MandatorySubModal: React.FC<MandatorySubModalProps> = ({
  channels,
  onVerified,
}) => {
  const [visitedChannels, setVisitedChannels] = useState<{ [id: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleOpenChannel = (chan: ChannelSubscription) => {
    soundManager.playCyberClick();
    setVisitedChannels((prev) => ({ ...prev, [chan.id]: true }));
    const url = chan.type === 'open' 
      ? `https://t.me/${chan.handleOrLink.replace('@', '')}` 
      : chan.handleOrLink;
    window.open(url, '_blank');
  };

  const handleVerify = () => {
    soundManager.playCyberClick();
    setChecking(true);
    setError(null);

    setTimeout(() => {
      // Check if user visited channels
      const allDone = channels.every((c) => visitedChannels[c.id]);
      if (allDone) {
        soundManager.playSuccessChime();
        onVerified();
      } else {
        soundManager.playErrorBuzz();
        setError("Iltimos, barcha ko'rsatilgan kanallarga obuna bo'ling va qayta tekshiring!");
      }
      setChecking(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-400 mb-3 shadow-lg">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-display font-bold text-white tracking-wide">
          MAJBURIY KANAL OBUNASI
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Testlar va 1v1 duellarda ishtirok etish uchun homiy kanallarga a'zo bo'ling:
        </p>

        {/* Channels list */}
        <div className="my-5 space-y-2.5">
          {channels.map((chan) => {
            const isDone = visitedChannels[chan.id];
            return (
              <div
                key={chan.id}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="text-xs font-bold text-white">{chan.title}</div>
                  <div className="text-[11px] text-cyan-400 font-mono">
                    {chan.handleOrLink}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenChannel(chan)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ulandim</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>A'zo Bo'lish</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={checking}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{checking ? 'Tekshirilmoqda...' : 'Obunani Tekshirish'}</span>
        </button>
      </div>
    </div>
  );
};
