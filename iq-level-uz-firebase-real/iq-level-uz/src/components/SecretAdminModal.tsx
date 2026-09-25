import React, { useState } from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentAdminCode: string;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentAdminCode,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = password.trim().toLowerCase();
    const expected = (currentAdminCode || '20120517M').trim().toLowerCase();

    // Check against configured code or master recovery code
    if (entered === expected || entered === '20120517m') {
      soundManager.playSuccessChime();
      setPassword('');
      setError(false);
      onSuccess();
    } else {
      soundManager.playErrorBuzz();
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className={`relative w-full max-w-sm bg-slate-900 border border-amber-400/40 rounded-2xl p-5 shadow-2xl shadow-amber-400/10 ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-sm tracking-wide">
            <Lock className="w-4 h-4" />
            <span>MAXFIY XAVFSIZLIK KIRISHI</span>
          </div>
          <button
            onClick={() => {
              soundManager.playCyberClick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          Tizim sozlamalariga kirish uchun maxsus xavfsizlik parolini kiriting.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Parolni kiriting..."
              className={`w-full h-11 px-3 rounded-xl bg-slate-950 border text-white placeholder-slate-600 text-sm font-mono tracking-widest focus:outline-none transition-all ${
                error
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-amber-400/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-rose-400 text-[11px] mt-1.5 ml-1">
                Noto'g'ri parol! Ruxsat berilmadi.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Tasdiqlash</span>
          </button>
        </form>
      </div>
    </div>
  );
};
