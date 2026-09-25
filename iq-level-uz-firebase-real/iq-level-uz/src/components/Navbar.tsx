import React, { useState } from 'react';
import { NavigationTab, UserProfile } from '../types';
import { soundManager } from '../utils/audio';
import { Volume2, VolumeX, Shield, Ticket, MessageSquare, Smartphone } from 'lucide-react';
import logoImg from '../assets/images/iq_level_logo_1790108461494.jpg';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userProfile: UserProfile;
  isAdmin: boolean;
  onOpenSecretAdminModal: () => void;
  isBotMode: boolean;
  onToggleBotMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userProfile,
  isAdmin,
  onOpenSecretAdminModal,
  isBotMode,
  onToggleBotMode,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleToggleSound = () => {
    soundManager.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      soundManager.playCyberClick();
    }
  };

  // Secret Admin Trigger: Clicking logo 5 times quickly opens secret admin modal
  const handleLogoClick = () => {
    soundManager.playCyberClick();
    const nextCount = logoClickCount + 1;
    setLogoClickCount(nextCount);
    if (nextCount >= 5) {
      setLogoClickCount(0);
      onOpenSecretAdminModal();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0d14]/90 backdrop-blur-md border-b border-cyan-500/20 px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Zone 1: Single-element Brand Zone (Logo & Title) */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title="IQ Level Uz"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-amber-400 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <img
              src={logoImg}
              alt="IQ Level Uz"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="font-display font-bold text-sm sm:text-base text-white tracking-tight group-hover:text-cyan-400 transition-colors whitespace-nowrap">
            IQ LEVEL <span className="text-cyan-400">UZ</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links (single line, clean tabs) */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-300">
          {[
            { id: 'home', label: 'Bosh sahifa' },
            { id: 'test', label: 'IQ Test' },
            { id: 'duel', label: '1v1 Duel' },
            { id: 'games', label: "Mini-O'yinlar" },
            { id: 'leaderboard', label: 'Reyting' },
            { id: 'referrals', label: 'Referal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playCyberClick();
                onSelectTab(tab.id as NavigationTab);
              }}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${
                currentTab === tab.id
                  ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5'
                  : ''
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions (Tickets, Sound, Bot View Toggle, Admin if unlocked) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Energy Tickets Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold shadow-sm">
            <Ticket className="w-3.5 h-3.5 text-amber-400" />
            <span>{userProfile.energyTickets}</span>
          </div>

          {/* Bot Chat / Web App Simulator Toggle */}
          <button
            onClick={() => {
              soundManager.playCyberClick();
              onToggleBotMode();
            }}
            className={`h-8 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isBotMode
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-400'
            }`}
            title={isBotMode ? "Mini App rejimiga o'tish" : "Telegram Bot chat rejimiga o'tish"}
          >
            {isBotMode ? <Smartphone className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isBotMode ? 'Mini App' : 'Bot Chat'}</span>
          </button>

          {/* Audio Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Admin Panel button ONLY appears if admin unlocked */}
          {isAdmin && (
            <button
              onClick={() => {
                soundManager.playCyberClick();
                onSelectTab('admin');
              }}
              className="h-8 px-2.5 rounded-xl bg-amber-500/20 border border-amber-400/60 text-amber-300 font-bold text-xs flex items-center gap-1 hover:bg-amber-500/30 transition-all animate-pulse"
              title="Admin Panel"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* User Avatar */}
          <div
            onClick={() => {
              soundManager.playCyberClick();
              onSelectTab('referrals');
            }}
            className="w-8 h-8 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-sm cursor-pointer hover:border-cyan-400 transition-colors"
            title={userProfile.name}
          >
            {userProfile.avatar || '🧠'}
          </div>
        </div>
      </div>
    </header>
  );
};
