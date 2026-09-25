import React from 'react';
import { NavigationTab } from '../types';
import { soundManager } from '../utils/audio';
import { Home, Brain, Swords, Grid, Trophy, Users } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'home', label: 'Asosiy', icon: Home },
    { id: 'test', label: 'IQ Test', icon: Brain },
    { id: 'duel', label: '1v1 Duel', icon: Swords },
    { id: 'games', label: "O'yinlar", icon: Grid },
    { id: 'leaderboard', label: 'Reyting', icon: Trophy },
    { id: 'referrals', label: 'Referal', icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0d14]/95 backdrop-blur-md border-t border-cyan-500/20 px-2 py-1.5">
      <div className="grid grid-cols-6 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playCyberClick();
                onSelectTab(tab.id as NavigationTab);
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`relative p-1 rounded-lg ${isActive ? 'bg-cyan-500/20' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
