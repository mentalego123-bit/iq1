import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Save,
  Radio,
  FileSpreadsheet,
  FileText,
  UserX,
  UserCheck,
  Send,
  Check,
  Layers,
  Link,
  Shield,
  X,
  CreditCard,
  KeyRound,
  Gift,
  Coins,
  Gamepad2,
  Target,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Question, ChannelSubscription, UserProfile, AdminSettings, GameLimitSettings, DailyMission } from '../types';
import { soundManager } from '../utils/audio';
import type { GlobalStats } from '../services/cloud';

interface AdminPanelProps {
  questions: Question[];
  onUpdateQuestions: (qs: Question[]) => void;
  channels: ChannelSubscription[];
  onUpdateChannels: (chs: ChannelSubscription[]) => void;
  usersList: UserProfile[];
  onUpdateUsersList: (users: UserProfile[]) => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  onSendBroadcast: (msg: string) => void;
  onClose: () => void;
  globalStats: GlobalStats;
}

type AdminTab = 'monetization' | 'security' | 'weekly' | 'gamelimits' | 'missions' | 'broadcast' | 'questions' | 'channels' | 'analytics' | 'users';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questions,
  onUpdateQuestions,
  channels,
  onUpdateChannels,
  usersList,
  onUpdateUsersList,
  adminSettings,
  onUpdateAdminSettings,
  onSendBroadcast,
  onClose,
  globalStats,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('monetization');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Security code state
  const [newAdminCode, setNewAdminCode] = useState(adminSettings.secretCode || '20120517M');

  // Game Limits state
  const [gameLimits, setGameLimits] = useState<GameLimitSettings>(
    adminSettings.gameLimits || {
      runnerDailyLimit: 0,
      matrixDailyLimit: 0,
      stroopDailyLimit: 0,
      mathDailyLimit: 0,
    }
  );

  // Monetization local state
  const [monetization, setMonetization] = useState(
    adminSettings.monetization || {
      isTestPaid: false,
      testPrice: 15,
      testPriceCurrency: 'STARS',
      paymentRecipient: '8600 0423 1122 3344 (Humo/Uzcard)',
      premiumGamesPaid: false,
      premiumGamesPrice: 10,
    }
  );

  // Weekly prize settings
  const [weeklyPrizes, setWeeklyPrizes] = useState(
    adminSettings.weeklyPrizes || {
      top1Reward: '15 Telegram Stars / Gift',
      top2Reward: '10 Telegram Stars',
      top3Reward: '5 Telegram Stars',
      minPoints: 40,
      minTimeMinutes: 5,
    }
  );

  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Kanaldan uzoqlashmang, yangi testlar va duellar tez orada!'
  );
  const [autoReminderText, setAutoReminderText] = useState(
    adminSettings.autoReminderText
  );

  // Question editing state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingNewQuestion, setIsAddingNewQuestion] = useState(false);
  const [newQData, setNewQData] = useState<Partial<Question>>({
    category: 'Mantiq',
    difficulty: "O'rta",
    options: ['', '', '', ''],
    correctIndex: 0,
    question: '',
    explanation: '',
  });

  // Channel state
  const [newChannelTitle, setNewChannelTitle] = useState('');
  const [newChannelLink, setNewChannelLink] = useState('');
  const [newChannelType, setNewChannelType] = useState<'open' | 'private'>('open');
  const [newChannelId, setNewChannelId] = useState('');

  // User management / DM state
  const [selectedUserForDm, setSelectedUserForDm] = useState<UserProfile | null>(null);
  const [dmText, setDmText] = useState('');

  // Daily Missions Management State
  const [customMissions, setCustomMissions] = useState<DailyMission[]>(
    adminSettings.customMissions || [
      {
        id: 'mission-tg-official',
        title: "Rasmiy Telegram kanalga obuna bo'ling",
        description: "@iqlevel_uz kanaliga a'zo bo'ling va eng so'nggi xabarlardan birinchi bo'lib boxabar bo'ling!",
        rewardCoins: 100,
        rewardXp: 200,
        icon: 'channel',
        targetCount: 1,
        linkUrl: 'https://t.me/iqlevel_uz',
        actionType: 'telegram_sub',
      },
    ]
  );
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionDesc, setNewMissionDesc] = useState('');
  const [newMissionLink, setNewMissionLink] = useState('');
  const [newMissionCoins, setNewMissionCoins] = useState(100);
  const [newMissionXp, setNewMissionXp] = useState(200);
  const [newMissionType, setNewMissionType] = useState<'telegram_sub' | 'custom_link' | 'complete_games' | 'play_duel'>('telegram_sub');
  const [newMissionTarget, setNewMissionTarget] = useState(1);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    soundManager.playSuccessChime();
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // 1. Save Monetization & Pricing
  const handleSaveMonetization = () => {
    onUpdateAdminSettings({
      ...adminSettings,
      monetization,
    });
    showNotification("Monetizatsiya va to'lov sozlamalari saqlandi!");
  };

  // 2. Save Security Passcode
  const handleSavePasscode = () => {
    if (!newAdminCode.trim()) {
      alert("Parol bo'sh bo'lishi mumkin emas!");
      return;
    }
    onUpdateAdminSettings({
      ...adminSettings,
      secretCode: newAdminCode.trim(),
    });
    showNotification(`Yangi maxfiy admin paroli o'rnatildi: ${newAdminCode.trim()}`);
  };

  // 3. Save Weekly Prizes
  const handleSaveWeeklyPrizes = () => {
    onUpdateAdminSettings({
      ...adminSettings,
      weeklyPrizes,
    });
    showNotification("Haftalik sovrinlar va shartlar muvaffaqiyatli saqlandi!");
  };

  // 3.1 Save Game Limits
  const handleSaveGameLimits = () => {
    onUpdateAdminSettings({
      ...adminSettings,
      gameLimits,
    });
    showNotification("O'yinlarning kunlik limitlari muvaffaqiyatli saqlandi!");
  };

  // 3.2 Daily Missions Management
  const handleAddMission = () => {
    if (!newMissionTitle.trim()) {
      alert("Missiya nomini kiriting!");
      return;
    }
    const newM: DailyMission = {
      id: `mission-custom-${Date.now()}`,
      title: newMissionTitle.trim(),
      description: newMissionDesc.trim() || "Vazifani bajaring va sovrinlarga ega bo'ling",
      rewardCoins: Number(newMissionCoins) || 50,
      rewardXp: Number(newMissionXp) || 100,
      icon: newMissionType === 'telegram_sub' ? 'channel' : newMissionType === 'play_duel' ? 'duel' : newMissionType === 'complete_games' ? 'game' : 'custom',
      targetCount: Number(newMissionTarget) || 1,
      linkUrl: newMissionLink.trim() || undefined,
      actionType: newMissionType,
    };
    const updated = [...customMissions, newM];
    setCustomMissions(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      customMissions: updated,
    });
    setNewMissionTitle('');
    setNewMissionDesc('');
    setNewMissionLink('');
    setNewMissionCoins(100);
    setNewMissionXp(200);
    showNotification("Yangi missiya qo'shildi!");
  };

  const handleDeleteMission = (id: string) => {
    const updated = customMissions.filter((m) => m.id !== id);
    setCustomMissions(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      customMissions: updated,
    });
    showNotification("Missiya o'chirildi!");
  };

  // 4. Save Broadcast & Reminder
  const handleSaveAutoReminder = () => {
    onUpdateAdminSettings({
      ...adminSettings,
      autoReminderText,
      autoReminderEnabled: true,
    });
    showNotification("Avto-eslatma matni saqlandi!");
  };

  const handleInstantBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    onSendBroadcast(broadcastMessage);
    showNotification(`Xabar barcha ${usersList.length} ta foydalanuvchiga yuborildi!`);
  };

  // 5. Question Builder
  const handleSaveQuestion = (q: Question) => {
    const updated = questions.map((item) => (item.id === q.id ? q : item));
    onUpdateQuestions(updated);
    setEditingQuestion(null);
    showNotification("Savol muvaffaqiyatli yangilandi!");
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert("Kamida bitta savol qolishi kerak!");
      return;
    }
    const filtered = questions.filter((q) => q.id !== id);
    onUpdateQuestions(filtered);
    showNotification("Savol o'chirildi!");
  };

  const handleCreateNewQuestion = () => {
    if (!newQData.question?.trim()) {
      alert("Savol matnini kiriting!");
      return;
    }
    if (newQData.options?.some((opt) => !opt.trim())) {
      alert("Barcha 4 ta variantni to'ldiring!");
      return;
    }

    const created: Question = {
      id: `q-${Date.now()}`,
      question: newQData.question || '',
      category: newQData.category || 'Mantiq',
      difficulty: newQData.difficulty || "O'rta",
      options: newQData.options as string[],
      correctIndex: newQData.correctIndex ?? 0,
      explanation: newQData.explanation || "Mantiqiy to'g'ri yechim.",
    };

    onUpdateQuestions([...questions, created]);
    setIsAddingNewQuestion(false);
    setNewQData({
      category: 'Mantiq',
      difficulty: "O'rta",
      options: ['', '', '', ''],
      correctIndex: 0,
      question: '',
      explanation: '',
    });
    showNotification("Yangi savol qo'shildi!");
  };

  // 6. Channels
  const handleAddChannel = () => {
    if (!newChannelTitle.trim() || !newChannelLink.trim()) {
      alert("Kanal nomi va havolasini kiriting!");
      return;
    }
    const newChan: ChannelSubscription = {
      id: `chan-${Date.now()}`,
      title: newChannelTitle.trim(),
      handleOrLink: newChannelLink.trim(),
      type: newChannelType,
      channelId: newChannelType === 'private' ? newChannelId.trim() : undefined,
      isRequired: true,
      subscribersCount: '24.5K',
    };
    onUpdateChannels([...channels, newChan]);
    setNewChannelTitle('');
    setNewChannelLink('');
    setNewChannelId('');
    showNotification("Kanal qo'shildi!");
  };

  const handleDeleteChannel = (id: string) => {
    onUpdateChannels(channels.filter((c) => c.id !== id));
    showNotification("Kanal o'chirildi!");
  };

  // 7. Backup Download
  const handleDownloadCsv = () => {
    soundManager.playCyberClick();
    const headers = "ID,Ism,IQ_Ball,Eng_Yaxshi_IQ,Duel_Reyting,Yutilgan,Yutqazilgan,Qora_Royxat,Azo_Bolgan\n";
    const rows = usersList
      .map(
        (u) =>
          `"${u.id}","${u.name}",${u.iqScore},${u.bestIq},${u.duelRating},${u.duelWins},${u.duelLosses},${u.isBanned},"${u.joinedAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iq_level_uz_backup_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showNotification("CSV baza yuklab olindi!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-400/50 rounded-2xl shadow-2xl shadow-amber-400/10 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Toast Notification */}
        {successToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-full shadow-lg flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="px-4 sm:px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-white">
                  MAXFIY BOSHQARUV KONSOLI
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  ROOT PAROL: {adminSettings.secretCode || '20120517M'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                To'lovlar, narxlar, yangi admin paroli, haftalik sovg'alar va testlar
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playCyberClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'monetization', label: '💳 Narx & To\'lov', icon: CreditCard },
            { id: 'security', label: '🔑 Admin Paroli', icon: KeyRound },
            { id: 'gamelimits', label: '🎮 O\'yin Limitlari', icon: Gamepad2 },
            { id: 'missions', label: '🎯 Kunlik Missiyalar', icon: Target },
            { id: 'weekly', label: '🎁 Haftalik TOP-3', icon: Gift },
            { id: 'questions', label: '🧠 Savollar', icon: Layers },
            { id: 'broadcast', label: '📢 Bildirishnoma', icon: Bell },
            { id: 'channels', label: '🔒 Kanallar', icon: Link },
            { id: 'analytics', label: '📊 Analitika', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playCyberClick();
                  setActiveTab(tab.id as AdminTab);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: MONETIZATION & PRICING */}
          {activeTab === 'monetization' && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>IQ Test va O'yinlar Narxini Belgilash</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      IQ test topshirishni pullik qilish, mini-o'yinlar obunasini boshqarish va to'lov rekvizitlari
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Test Pricing Toggle */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">IQ Test Pullik Bo'lsinmi?</span>
                      <input
                        type="checkbox"
                        checked={monetization.isTestPaid}
                        onChange={(e) =>
                          setMonetization({ ...monetization, isTestPaid: e.target.checked })
                        }
                        className="w-4 h-4 text-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400">Test Narxi</label>
                      <input
                        type="number"
                        value={monetization.testPrice}
                        onChange={(e) =>
                          setMonetization({ ...monetization, testPrice: Number(e.target.value) })
                        }
                        className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400">To'lov Valyutasi</label>
                      <select
                        value={monetization.testPriceCurrency}
                        onChange={(e) =>
                          setMonetization({ ...monetization, testPriceCurrency: e.target.value as any })
                        }
                        className="w-full h-9 px-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                      >
                        <option value="STARS">Telegram Stars (⭐)</option>
                        <option value="UZS">So'm (UZS / Karta)</option>
                        <option value="TON">TON (Kriptovalyuta)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Destination */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-white">Pul Qayerga Tushadi? (Karta / Hamyon)</label>
                      <p className="text-[10px] text-slate-400 mb-1">
                        Foydalanuvchilar to'lov qilganda mablag' tushadigan karta raqami yoki Telegram hamyon
                      </p>
                      <input
                        type="text"
                        value={monetization.paymentRecipient}
                        onChange={(e) =>
                          setMonetization({ ...monetization, paymentRecipient: e.target.value })
                        }
                        placeholder="8600 0423 1122 3344 yoki @wallet..."
                        className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <span className="text-xs font-bold text-white">Premium O'yinlar Obunasi</span>
                      <input
                        type="checkbox"
                        checked={monetization.premiumGamesPaid}
                        onChange={(e) =>
                          setMonetization({ ...monetization, premiumGamesPaid: e.target.checked })
                        }
                        className="w-4 h-4 text-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveMonetization}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Narx va To'lov Sozlamalarini Saqlash</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY PASSCODE MANAGEMENT */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Yangi Admin Paroli O'rnatish</span>
                </div>
                <p className="text-xs text-slate-400">
                  Botda yoki Mini Appda admin panelni ochadigan xavfsizlik kodini istalgan vaqtda yangilang.
                </p>

                <div className="max-w-sm space-y-2">
                  <label className="text-[11px] text-slate-300">Yangi Maxfiy Parol:</label>
                  <input
                    type="text"
                    value={newAdminCode}
                    onChange={(e) => setNewAdminCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-amber-400/50 text-amber-300 font-mono text-sm tracking-widest"
                  />
                  <div className="text-[10px] text-slate-500">
                    Standart master kod: <code className="text-slate-400 font-mono">20120517M</code>
                  </div>
                </div>

                <button
                  onClick={handleSavePasscode}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Yangi Parolni Saqlash</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WEEKLY TOP-3 PRIZES */}
          {activeTab === 'weekly' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Haftalik TOP-3 Sovg'alari va Shartlari</span>
                </div>
                <p className="text-xs text-slate-400">
                  Top 1: 15 Stars/Gift, Top 2: 10 Stars, Top 3: 5 Stars. Shuningdek minimal ball va ilovada o'tkazilgan vaqt shartini sozlang.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-amber-300 font-bold">🥇 1-O'rin Sovg'asi</label>
                    <input
                      type="text"
                      value={weeklyPrizes.top1Reward}
                      onChange={(e) =>
                        setWeeklyPrizes({ ...weeklyPrizes, top1Reward: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-cyan-300 font-bold">🥈 2-O'rin Sovg'asi</label>
                    <input
                      type="text"
                      value={weeklyPrizes.top2Reward}
                      onChange={(e) =>
                        setWeeklyPrizes({ ...weeklyPrizes, top2Reward: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-purple-300 font-bold">🥉 3-O'rin Sovg'asi</label>
                    <input
                      type="text"
                      value={weeklyPrizes.top3Reward}
                      onChange={(e) =>
                        setWeeklyPrizes({ ...weeklyPrizes, top3Reward: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Minimal Talab Qilingan Ochko</label>
                    <input
                      type="number"
                      value={weeklyPrizes.minPoints}
                      onChange={(e) =>
                        setWeeklyPrizes({ ...weeklyPrizes, minPoints: Number(e.target.value) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Haftada Sarflanishi Kerak Bo'lgan Vaqt (Minut)</label>
                    <input
                      type="number"
                      value={weeklyPrizes.minTimeMinutes}
                      onChange={(e) =>
                        setWeeklyPrizes({ ...weeklyPrizes, minTimeMinutes: Number(e.target.value) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveWeeklyPrizes}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Sovrin Sozlamalarini Saqlash</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: GAME LIMITS MANAGEMENT */}
          {activeTab === 'gamelimits' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  <span>O'yinlarning Kunlik Limitlarini Boshqarish</span>
                </div>
                <p className="text-xs text-slate-400">
                  Foydalanuvchilar kun davomida har bir mini-o'yinni necha marta o'ynashi mumkinligini cheklang.
                  <strong className="text-amber-300 ml-1">0 kiritilsa — o'yin cheksiz (limitsiz) bo'ladi.</strong>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Game 1: Subway 4D Runner */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <span>🛹 Subway 4D Runner</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {gameLimits.runnerDailyLimit === 0 ? 'Cheksiz' : `${gameLimits.runnerDailyLimit} marta/kun`}
                      </span>
                    </div>
                    <label className="text-[11px] text-slate-400 block">Kunlik limit (0 = cheksiz):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gameLimits.runnerDailyLimit}
                      onChange={(e) =>
                        setGameLimits({ ...gameLimits, runnerDailyLimit: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  {/* Game 2: 4x4 Memory Matrix */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <span>🧩 4x4 Xotira Matritsasi</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        {gameLimits.matrixDailyLimit === 0 ? 'Cheksiz' : `${gameLimits.matrixDailyLimit} marta/kun`}
                      </span>
                    </div>
                    <label className="text-[11px] text-slate-400 block">Kunlik limit (0 = cheksiz):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gameLimits.matrixDailyLimit}
                      onChange={(e) =>
                        setGameLimits({ ...gameLimits, matrixDailyLimit: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  {/* Game 3: Stroop Test */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <span>⚡ Stroop Diqqat Testi</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                        {gameLimits.stroopDailyLimit === 0 ? 'Cheksiz' : `${gameLimits.stroopDailyLimit} marta/kun`}
                      </span>
                    </div>
                    <label className="text-[11px] text-slate-400 block">Kunlik limit (0 = cheksiz):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gameLimits.stroopDailyLimit}
                      onChange={(e) =>
                        setGameLimits({ ...gameLimits, stroopDailyLimit: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  {/* Game 4: Speed Math 1v1 */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <span>🎯 Tezkor Matematika 1v1</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                        {gameLimits.mathDailyLimit === 0 ? 'Cheksiz' : `${gameLimits.mathDailyLimit} marta/kun`}
                      </span>
                    </div>
                    <label className="text-[11px] text-slate-400 block">Kunlik limit (0 = cheksiz):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gameLimits.mathDailyLimit}
                      onChange={(e) =>
                        setGameLimits({ ...gameLimits, mathDailyLimit: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveGameLimits}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>O'yin Limitlarini Saqlash</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: DAILY MISSIONS MANAGEMENT */}
          {activeTab === 'missions' && (
            <div className="space-y-5">
              {/* Add New Mission Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <span>Yangi Kunlik Missiya Qo'shish</span>
                </div>
                <p className="text-xs text-slate-400">
                  Foydalanuvchilarga yangi vazifalar bering (masalan: rasmiy kanalga obuna bo'lish, botga kirish, do'stlarni taklif qilish).
                  Vazifani bajargan foydalanuvchiga IQ tangalari va daraja XP beriladi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-cyan-300 font-bold block mb-1">
                      Missiya Sarlavhasi
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Telegram kanalga obuna bo'ling"
                      value={newMissionTitle}
                      onChange={(e) => setNewMissionTitle(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Vazifa Turi
                    </label>
                    <select
                      value={newMissionType}
                      onChange={(e) => setNewMissionType(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    >
                      <option value="telegram_sub">📢 Telegram Kanalga Obuna Bo'lish</option>
                      <option value="custom_link">🔗 Maxsus Havola / Saytga Tashrif</option>
                      <option value="complete_games">🎮 Mini-O'yinlar O'ynash</option>
                      <option value="play_duel">⚔️ 1v1 Duelda Qatnashish</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Batafsil Tavsifi
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: @iqlevel_uz kanaliga ulaning va eng so'nggi turnirlar haqida xabardor bo'ling!"
                    value={newMissionDesc}
                    onChange={(e) => setNewMissionDesc(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Havola (Link URL - ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      placeholder="https://t.me/iqlevel_uz"
                      value={newMissionLink}
                      onChange={(e) => setNewMissionLink(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-amber-300 font-bold block mb-1">
                      Mukofot (IQ Tangalar)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={newMissionCoins}
                      onChange={(e) => setNewMissionCoins(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-purple-300 font-bold block mb-1">
                      Mukofot (Daraja XP)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={newMissionXp}
                      onChange={(e) => setNewMissionXp(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddMission}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Missiyani Qo'shish & Saqlash</span>
                </button>
              </div>

              {/* List of Custom Missions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 font-mono">
                    ADMIN TOMONIDAN QO'SHILGAN MISSIYALAR ({customMissions.length} TA)
                  </h4>
                </div>

                {customMissions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                    Hozircha qo'shimcha maxsus missiyalar yo'q. Yuqoridagi forma orqali birinchi missiyani qo'shing.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customMissions.map((mission) => (
                      <div
                        key={mission.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{mission.title}</span>
                              {mission.linkUrl && (
                                <ExternalLink className="w-3 h-3 text-cyan-400" />
                              )}
                            </span>
                            <button
                              onClick={() => handleDeleteMission(mission.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-900 transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {mission.description}
                          </p>
                          {mission.linkUrl && (
                            <div className="text-[10px] font-mono text-cyan-400 truncate pt-1">
                              {mission.linkUrl}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] font-mono">
                          <span className="text-amber-400 font-bold">+{mission.rewardCoins} Tangalar</span>
                          <span className="text-purple-400 font-bold">+{mission.rewardXp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">IQ Test Savollari ({questions.length} ta)</h3>
                  <p className="text-xs text-slate-400">Savollar qo'shish, to'g'ri javob va izohni belgilash</p>
                </div>
                <button
                  onClick={() => setIsAddingNewQuestion(!isAddingNewQuestion)}
                  className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Savol</span>
                </button>
              </div>

              {/* Add New Question Form */}
              {isAddingNewQuestion && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-400/40 space-y-3">
                  <div className="font-semibold text-cyan-300 text-xs">Yangi IQ Savoli Yaratish</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400">Kategoriya</label>
                      <select
                        value={newQData.category}
                        onChange={(e) => setNewQData({ ...newQData, category: e.target.value as any })}
                        className="w-full h-9 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      >
                        <option value="Mantiq">Mantiq</option>
                        <option value="Visual">Visual</option>
                        <option value="Matematik">Matematik</option>
                        <option value="Fazoviy">Fazoviy</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Qiyinlik</label>
                      <select
                        value={newQData.difficulty}
                        onChange={(e) => setNewQData({ ...newQData, difficulty: e.target.value as any })}
                        className="w-full h-9 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      >
                        <option value="Oson">Oson</option>
                        <option value="O'rta">O'rta</option>
                        <option value="Qiyin">Qiyin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Savol Matni</label>
                    <input
                      type="text"
                      placeholder="Savolni kiriting..."
                      value={newQData.question || ''}
                      onChange={(e) => setNewQData({ ...newQData, question: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((label, idx) => (
                      <div key={label} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newQData.correctIndex === idx}
                          onChange={() => setNewQData({ ...newQData, correctIndex: idx })}
                          className="text-cyan-500"
                        />
                        <input
                          type="text"
                          placeholder={`Variant ${label}`}
                          value={newQData.options?.[idx] || ''}
                          onChange={(e) => {
                            const opts = [...(newQData.options || ['', '', '', ''])];
                            opts[idx] = e.target.value;
                            setNewQData({ ...newQData, options: opts });
                          }}
                          className="flex-1 h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">To'g'ri Javob Izohi</label>
                    <input
                      type="text"
                      placeholder="Nima uchun shu javob to'g'ri ekanligini yozing..."
                      value={newQData.explanation || ''}
                      onChange={(e) => setNewQData({ ...newQData, explanation: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsAddingNewQuestion(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={handleCreateNewQuestion}
                      className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      Saqlash
                    </button>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                          #{idx + 1} {q.category}
                        </span>
                        <span className="text-[10px] text-amber-400">{q.difficulty || "O'rta"}</span>
                      </div>
                      <p className="text-xs text-white font-medium truncate">{q.question}</p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        To'g'ri: <strong className="text-emerald-400">{q.options[q.correctIndex]}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
                <div className="text-sm font-bold text-cyan-300">Doimiy Avto-Eslatma</div>
                <textarea
                  rows={2}
                  value={autoReminderText}
                  onChange={(e) => setAutoReminderText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <button
                  onClick={handleSaveAutoReminder}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Saqlash</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-400/30 space-y-3">
                <div className="text-sm font-bold text-amber-300">Hamma Foydalanuvchilarga Broadcast</div>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <button
                  onClick={handleInstantBroadcast}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Hozir Yuborish</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: CHANNELS */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white">Yangi Kanal Ulash (Ochiq yoki Privat)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Kanal nomi"
                    value={newChannelTitle}
                    onChange={(e) => setNewChannelTitle(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                  <select
                    value={newChannelType}
                    onChange={(e) => setNewChannelType(e.target.value as any)}
                    className="h-9 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="open">Ochiq (@username)</option>
                    <option value="private">Yopiq (Privat https://t.me/+...)</option>
                  </select>
                  <input
                    type="text"
                    placeholder={newChannelType === 'open' ? '@kanal' : 'https://t.me/+...'}
                    value={newChannelLink}
                    onChange={(e) => setNewChannelLink(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
                <button
                  onClick={handleAddChannel}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kanalni Qo'shish</span>
                </button>
              </div>

              <div className="space-y-2">
                {channels.map((chan) => (
                  <div
                    key={chan.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{chan.title}</div>
                      <div className="text-[11px] text-cyan-400 font-mono">{chan.handleOrLink}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteChannel(chan.id)}
                      className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS & BACKUP */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30">
                  <div className="text-xs text-slate-400">Jami Foydalanuvchilar</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{globalStats.totalUsers || usersList.length}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-400/30">
                  <div className="text-xs text-slate-400">IQ Savollari</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{questions.length}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <div className="text-xs text-slate-400">Topshirilgan Testlar</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {globalStats.totalTestsCompleted}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30">
                  <div className="text-xs text-slate-400">Haftalik Da'vogarlar</div>
                  <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
                    {
                      usersList.filter(
                        (u) =>
                          (u.weeklyTimeSpentSeconds || 0) >= (adminSettings.weeklyPrizes.minTimeMinutes || 0) * 60
                      ).length
                    }{' '}
                    kishi
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30">
                  <div className="text-xs text-slate-400">Jami Duellar</div>
                  <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{globalStats.totalDuels}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30">
                  <div className="text-xs text-slate-400">Jami O'yin Sessiyalari</div>
                  <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{globalStats.totalGamesPlayed}</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Barcha raqamlar Firestore'dagi real bazadan olinadi va yangi loyihada 0 dan boshlanadi.
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white">Bazani Eksport Qilish (.CSV)</div>
                <p className="text-[11px] text-slate-400">
                  Barcha foydalanuvchilar, ularning natijalari va faolligini yuklab oling.
                </p>
                <button
                  onClick={handleDownloadCsv}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>CSV Bazani Yuklash</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
