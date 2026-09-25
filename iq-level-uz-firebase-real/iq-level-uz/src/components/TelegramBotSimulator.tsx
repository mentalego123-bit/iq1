import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, AdminSettings, ChannelSubscription } from '../types';
import { soundManager } from '../utils/audio';
import { Send, ArrowRight, Share2, Sparkles, Brain, Swords, HelpCircle } from 'lucide-react';
import logoImg from '../assets/images/iq_level_logo_1790108461494.jpg';

interface TelegramBotSimulatorProps {
  userProfile: UserProfile;
  adminSettings: AdminSettings;
  channels: ChannelSubscription[];
  onOpenMiniAppTab: (tab: 'test' | 'duel' | 'games' | 'leaderboard' | 'referrals' | 'admin') => void;
  onAdminUnlock: () => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  buttons?: { text: string; action: () => void }[];
  isSpecial?: boolean;
}

export const TelegramBotSimulator: React.FC<TelegramBotSimulatorProps> = ({
  userProfile,
  adminSettings,
  channels,
  onOpenMiniAppTab,
  onAdminUnlock,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome and daily question
  useEffect(() => {
    const welcomeMsg: Message = {
      id: 'bot-welcome',
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Salom, <b>${userProfile.name}</b>! 👋\n\n🧠 <b>IQ Level Uz</b> rasmiy AI botiga xush kelibsiz! Men siz bilan har qanday savolda erkin suhbatlasha olaman.\n\nBugungi imkoniyatlar:\n• 🧠 <b>20 ta IQ Test</b> va PNG Sertifikat\n• ⚔️ <b>1v1 Duel</b> do'stingizga chaqiruv havolasi\n• 🤖 <b>AI Test Tahlilchisi</b> (Kuchli va kuchsiz tomonlar)\n• ❓ <b>Kun Savoli</b> (Dastlabki 3 ta to'g'ri topganga biletlar!)\n• 🎁 <b>Haftalik TOP 3</b> da 15 Stars/Gift sovrinlari!`,
      buttons: [
        { text: '🧠 IQ Testni Boshlash', action: () => onOpenMiniAppTab('test') },
        { text: '⚔️ Do\'stni Duelga Chaqirish', action: () => handleSendDuelInvite() },
        { text: '🤖 AI Test Tahlili', action: () => handleAiAnalysis() },
        { text: '❓ Bugungi Kun Savoli', action: () => handleDailyRiddle() },
        { text: '🎮 Mini-O\'yinlar (3D Runner)', action: () => onOpenMiniAppTab('games') },
        { text: '🏆 Haftalik TOP-3 Sovg\'alar', action: () => onOpenMiniAppTab('leaderboard') },
      ],
    };

    setMessages([welcomeMsg]);
  }, [userProfile.name]);

  const handleSendDuelInvite = () => {
    const duelLink = `https://t.me/IQLevelUzBot?start=duel_usr_${userProfile.id}`;
    const inviteReply: Message = {
      id: `bot-duel-${Date.now()}`,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `⚔️ <b>TELEGRAM DUEL CHAQIRIG'I HAVOLASI:</b>\n\nDo'stingizga quyidagi maxsus duel havolasini yuboring:\n<code>${duelLink}</code>\n\nDo'stingiz ushbu havola orqali kirsa, darhol siz bilan 5 raundlik 1v1 mantiq jangiga kirishadi!`,
      buttons: [
        {
          text: '📲 Do\'stlarga Ulashish',
          action: () => {
            const shareText = encodeURIComponent(`Men sizni IQ Level Uz da 1v1 mantiq jangiga chorlayman! Kim aqlliroq ekanini isbotla: ${duelLink}`);
            window.open(`https://t.me/share/url?url=${encodeURIComponent(duelLink)}&text=${shareText}`, '_blank');
          },
        },
        {
          text: '⚔️ Duel Arenaga O\'tish',
          action: () => onOpenMiniAppTab('duel'),
        },
      ],
    };
    setMessages((prev) => [...prev, inviteReply]);
  };

  const handleAiAnalysis = () => {
    const iq = userProfile.bestIq || userProfile.iqScore || 125;
    const aiText = `🤖 <b>AI TEST TAHLILCHISI NATIJALARI:</b>\n\n👤 Foydalanuvchi: <b>${userProfile.name}</b>\n📊 IQ Indeksi: <b>${iq} ball</b>\n\n<b>Miya faoliyati kognitiv xaritasi:</b>\n• 🧩 <b>Fazoviy tasavvur:</b> 94% (Yuqori daraja)\n• 🔢 <b>Matematik analiz:</b> 88% (A'lo refleks)\n• 💡 <b>Mantiqiy deduksiya:</b> 91% (Daho darajasi)\n• ⚡ <b>Kognitiv tezlik:</b> 82% (O'rtachadan yuqori)\n\n<b>AI Tavsiyasi:</b> Siz abstrakt naqshlar va fazoviy matritsalarni yechishda juda kuchlisiz! Reaksiyani yanada oshirish uchun <i>Stroop Testi</i> va <i>3D Logic Runner</i> o'yinlarini tavsiya qilaman.`;

    const aiReply: Message = {
      id: `bot-ai-${Date.now()}`,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSpecial: true,
      text: aiText,
      buttons: [
        { text: '🧠 Testni Qayta Topshirish', action: () => onOpenMiniAppTab('test') },
        { text: '🎮 3D Runnerda mashq', action: () => onOpenMiniAppTab('games') },
      ],
    };
    setMessages((prev) => [...prev, aiReply]);
  };

  const handleDailyRiddle = () => {
    const riddleText = `❓ <b>KUN SAVOLI (BUGUNGI BOSHQOTIRMA):</b>\n\n<i>"Bir kishi qorong'i xonada turibdi. Xonada kerosin lampasi, sham va gaz plitasi bor. Uning cho'ntagida esa atigi BITTA gugurt cho'pi bor. U xonani isitish va yoritish uchun birinchi bo'lib nimani yoqishi kerak?"</i>\n\nJavobingizni pastdagi chatga yozib yuboring (Dastlabki 3 ta to'g'ri topganga +5 Bilet!)`;
    const riddleMsg: Message = {
      id: `bot-riddle-${Date.now()}`,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: riddleText,
    };
    setMessages((prev) => [...prev, riddleMsg]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    soundManager.playCyberClick();
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    setTimeout(() => {
      handleBotResponse(text);
    }, 600);
  };

  const handleBotResponse = (rawInput: string) => {
    const text = rawInput.toLowerCase().trim();
    const configuredAdminCode = (adminSettings.secretCode || '20120517M').toLowerCase().trim();

    // Check Secret Admin Passcode (dynamic or master)
    if (text.includes(configuredAdminCode) || text.includes('20120517m')) {
      soundManager.playSuccessChime();
      const adminReply: Message = {
        id: `bot-admin-${Date.now()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSpecial: true,
        text: `🔐 <b>MAXFIY ADMIN KIRISH TASDIQLANDI!</b>\n\nHush kelibsiz, Administrator! Boshqaruv konsoli ochildi.\n\n• Narxlar va to'lov rekvizitlarini sozlash\n• Yangi admin paroli belgilash\n• Haftalik TOP-3 sovrinlari shartlari\n• Savollar builder va kanal a'zoligi`,
        buttons: [
          {
            text: '⚙️ Maxfiy Admin Panelni Ochish',
            action: () => onAdminUnlock(),
          },
        ],
      };
      setMessages((prev) => [...prev, adminReply]);
      return;
    }

    // Daily riddle check ("gugurt", "gugurt cho'pi", "cho'p")
    if (text.includes('gugurt') || text.includes('chopi') || text.includes("cho'p")) {
      soundManager.playVictoryFanfare();
      const winRiddleMsg: Message = {
        id: `bot-win-${Date.now()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSpecial: true,
        text: `🎉 <b>TO'G'RI JAVOB!</b>\n\nAlbatta, sham, lampa yoki plitani yoqishdan avval <b>gugurt cho'pini</b> yoqish kerak! Siz dastlabki g'oliblar qatoridasiz: <b>+5 Energiya bileti</b> hisobingizga qo'shildi! 🚀`,
        buttons: [
          { text: '⚔️ Duel O\'ynash', action: () => onOpenMiniAppTab('duel') },
          { text: '🧠 Test Topshirish', action: () => onOpenMiniAppTab('test') },
        ],
      };
      setMessages((prev) => [...prev, winRiddleMsg]);
      return;
    }

    // 20+ Conversational Queries with Witty Cyber Brain Persona
    let replyText = '';
    let buttons: { text: string; action: () => void }[] = [];

    if (text.includes('salom') || text.includes('assalom') || text.includes('privet') || text.includes('hello')) {
      replyText = `Va alaykum assalom! Salom, ${userProfile.name}! 👋 Kiber miyam sizga xizmat qilishga va intellektingizni sinovdan o'tkazishga tayyor. Nima qilamiz bugun?`;
      buttons = [
        { text: '🧠 IQ Test topshirish', action: () => onOpenMiniAppTab('test') },
        { text: '⚔️ Duel jangiga kirish', action: () => onOpenMiniAppTab('duel') },
      ];
    } else if (text.includes('yaxshi') || text.includes('qaleysan') || text.includes('qandaysan') || text.includes('ishlar')) {
      replyText = `Rahmat, neyronlarim 100% quvvat bilan ishlayapti! ⚡ Sizning kayfiyatingiz qanday? Bugun yangi IQ rekordini o'rnatamizmi?`;
      buttons = [{ text: '🚀 Rekord o\'rnatish', action: () => onOpenMiniAppTab('test') }];
    } else if (text.includes('kim bu') || text.includes('sen kimsan') || text.includes('bot')) {
      replyText = `Men — <b>IQ Level Uz</b> sun'iy intellekt kiber botiman! 🧠 Mening vazifam insonlarning mantiqiy salohiyatini aniqlash, ularga rasmiy sertifikat taqdim etish va onlayn 1v1 duellarni boshqarish!`;
    } else if (text.includes('iq nima') || text.includes('iq test')) {
      replyText = `<b>IQ (Intelligence Quotient)</b> — insonning mantiqiy fikrlash, muammolarni tezkor tahlil qilish va fazoviy tasavvur qilish darajasini o'lchovchi xalqaro koeffitsiyent. Bizning testimiz 20 ta standartlashtirilgan savoldan iborat.`;
      buttons = [{ text: '🧠 Testni Boshlash', action: () => onOpenMiniAppTab('test') }];
    } else if (text.includes('sertifikat') || text.includes('rasm') || text.includes('diplom')) {
      replyText = `Ha! Test yakunida sizning ismingiz, to'plangan aniq IQ bali va unikal seriya raqami tushirilgan <b>yuqori sifatli PNG Kiber Sertifikat</b> avtomatik chizib beriladi. Uni yuklab olib, ijtimoiy tarmoqlarda bemalol ulashishingiz mumkin!`;
      buttons = [{ text: '📜 Test topshirib sertifikat olish', action: () => onOpenMiniAppTab('test') }];
    } else if (text.includes('duel') || text.includes('jang') || text.includes('1v1')) {
      replyText = `1v1 Duel rejimida ikki o'yinchi 5 ta tezkor mantiqiy savolda to'qnashadi. Har bir raund 15 soniya. Tez va to'g'ri topgan o'yinchi g'olib bo'lib, reyting ochkosi oladi! Do'stingizni ham chaqirishingiz mumkin.`;
      buttons = [
        { text: '⚔️ Raqib qidirish', action: () => onOpenMiniAppTab('duel') },
        { text: '📲 Do\'stga taklifnoma', action: () => handleSendDuelInvite() },
      ];
    } else if (text.includes('sovrin') || text.includes('yutuq') || text.includes('sovg') || text.includes('stars')) {
      replyText = `🎁 <b>HAFTALIK TOP 3 SOVG'ALARI:</b>\n\n🥇 1-O'rin: <b>15 Telegram Stars / Gift</b>\n🥈 2-O'rin: <b>10 Telegram Stars</b>\n🥉 3-O'rin: <b>5 Telegram Stars</b>\n\n<i>Shartlar:</i> Minimal 40+ ochko to'plash va haftada ilovada 5 minutdan ortiq vaqt faol bo'lish!`;
      buttons = [{ text: '🏆 Reytingni Ko\'rish', action: () => onOpenMiniAppTab('leaderboard') }];
    } else if (text.includes('bilet') || text.includes('energiya') || text.includes('coin')) {
      replyText = `🎫 <b>Bilet olish yo'llari:</b>\n1. Har kungi kirish (Daily Streak)\n2. Omad g'ildiragini aylantirish\n3. Do'stlaringizni taklif qilish (Har biriga +3 bilet)\n4. Mini-o'yinlarda (3D Runner, Stroop, Math) g'alaba qozonish!`;
      buttons = [{ text: '👥 Do\'stlarni Taklif Qilish', action: () => onOpenMiniAppTab('referrals') }];
    } else if (text.includes('tahlil') || text.includes('ai') || text.includes('kuchli')) {
      handleAiAnalysis();
      return;
    } else if (text.includes('savol') || text.includes('boshqotirma') || text.includes('topishmoq')) {
      handleDailyRiddle();
      return;
    } else if (text.includes('rahmat') || text.includes('tashakkur') || text.includes('spasibo')) {
      replyText = `Arzimiydi! Siz bilan ishlash kiber neyronlarimga zavq bag'ishlaydi. Doimo intellekt cho'qqisida bo'ling! 🚀`;
    } else if (text.includes('xayr') || text.includes('ko\'rishguncha') || text.includes('bay')) {
      replyText = `Ko'rishguncha, ${userProfile.name}! Kanaldan va bizdan uzoqlashmang, yangi musobaqalar tez orada! 🔥`;
    } else {
      replyText = `Tushundim! "${rawInput}" haqida o'ylab ko'rdim. Sizga yordam berishim uchun pastdagi tezkor menyudan foydalanishingiz mumkin: 👇`;
      buttons = [
        { text: '🧠 IQ Test', action: () => onOpenMiniAppTab('test') },
        { text: '⚔️ 1v1 Duel', action: () => onOpenMiniAppTab('duel') },
        { text: '❓ Kun Savoli', action: () => handleDailyRiddle() },
      ];
    }

    soundManager.playCyberClick();
    const botReply: Message = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: replyText,
      buttons: buttons.length > 0 ? buttons : undefined,
    };
    setMessages((prev) => [...prev, botReply]);
  };

  return (
    <div className="w-full max-w-xl mx-auto h-[620px] flex flex-col rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-2xl overflow-hidden animate-fade-in">
      {/* Bot Chat Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full border border-cyan-400 p-0.5 bg-slate-950">
            <img
              src={logoImg}
              alt="Bot Avatar"
              className="w-full h-full object-cover rounded-full"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">IQ Level Uz AI Bot</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                online
              </span>
            </div>
            <div className="text-[11px] text-cyan-400">
              Aiogram 3.x AI Test Tahlilchisi & Duel Chat
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenMiniAppTab('test')}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow active:scale-95"
        >
          <span>Mini App</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 cyber-grid-bg">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md shadow-cyan-600/20'
                    : msg.isSpecial
                    ? 'bg-amber-950/70 border border-amber-400/50 text-amber-100 rounded-bl-none shadow-lg'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: msg.text.replace(/\n/g, '<br/>'),
                  }}
                />
                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    isUser ? 'text-cyan-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>

              {/* Inline Action Buttons */}
              {msg.buttons && msg.buttons.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1.5 w-full max-w-[85%]">
                  {msg.buttons.map((btn, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={() => {
                        soundManager.playCyberClick();
                        btn.action();
                      }}
                      className="p-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-semibold text-center truncate active:scale-95 transition-all shadow"
                    >
                      {btn.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Xabar yoki savolingizni yozing (masalan: salom, iq nima, kun savoli)..."
          className="flex-1 h-11 px-4 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          className="w-11 h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0 transition-colors shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
