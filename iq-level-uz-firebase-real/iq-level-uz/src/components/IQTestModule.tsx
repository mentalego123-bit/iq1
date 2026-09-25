import React, { useState, useEffect } from 'react';
import { Question, UserProfile } from '../types';
import { VisualDiagram } from './VisualDiagram';
import { CertificateGenerator } from './CertificateGenerator';
import { soundManager } from '../utils/audio';
import { Timer, ArrowRight, RotateCcw, Award, CheckCircle, XCircle, Lock, Unlock, Users, Share2, Swords } from 'lucide-react';

interface IQTestModuleProps {
  questions: Question[];
  userProfile: UserProfile;
  onTestComplete: (finalScore: number) => void;
  onBackToMenu: () => void;
}

export const IQTestModule: React.FC<IQTestModuleProps> = ({
  questions,
  userProfile,
  onTestComplete,
  onBackToMenu,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<{ [qId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds per question
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [calculatedIq, setCalculatedIq] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);

  const currentQ = questions[currentIndex] || questions[0];

  // Timer countdown
  useEffect(() => {
    if (isTestFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time ran out for this question
          handleAutoNext();
          return 45;
        }
        if (prev <= 5) {
          soundManager.playCyberClick();
        }
        return prev - 1;
      });
      setTotalTimeTaken((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isTestFinished]);

  const handleAutoNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(45);
    } else {
      finishTest();
    }
  };

  const handleSelectOption = (idx: number) => {
    soundManager.playCyberClick();
    setSelectedOption(idx);
    setAnsweredState((prev) => ({
      ...prev,
      [currentQ.id]: idx,
    }));
  };

  const handleNext = () => {
    soundManager.playCyberClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(
        answeredState[questions[currentIndex + 1]?.id] ?? null
      );
      setTimeLeft(45);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (answeredState[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    // Standardized Wechsler-style IQ calculation formula:
    // Baseline: 85, each correct question is worth approx 3.2 points,
    // plus bonus for rapid completion
    const accuracy = correctCount / questions.length;
    let score = Math.round(85 + accuracy * 65);

    // Speed bonus up to 5 IQ points if total average time is under 20s per question
    const avgTimePerQuestion = totalTimeTaken / questions.length;
    if (avgTimePerQuestion < 20 && correctCount >= 14) {
      score += 4;
    }

    // Upper limit cap
    score = Math.min(156, Math.max(85, score));

    setCalculatedIq(score);
    setIsTestFinished(true);
    soundManager.playVictoryFanfare();
    onTestComplete(score);
  };

  const restartTest = () => {
    soundManager.playCyberClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnsweredState({});
    setTimeLeft(45);
    setIsTestFinished(false);
    setCalculatedIq(0);
    setShowCertificate(false);
    setTotalTimeTaken(0);
  };

  if (isTestFinished) {
    const correctAnswersCount = questions.filter(
      (q) => answeredState[q.id] === q.correctIndex
    ).length;

    // Badges calculation:
    // IQ 80–99: "Izlanuvchi"
    // IQ 100–119: "Mantiq Ustasi"
    // IQ 120+: "Daho"
    const earnedBadge =
      calculatedIq >= 120
        ? { title: 'Daho', icon: '👑', color: 'text-amber-400', border: 'border-amber-400/50', bg: 'bg-amber-400/10' }
        : calculatedIq >= 100
        ? { title: 'Mantiq Ustasi', icon: '⚡', color: 'text-cyan-400', border: 'border-cyan-400/50', bg: 'bg-cyan-400/10' }
        : { title: 'Izlanuvchi', icon: '🎯', color: 'text-emerald-400', border: 'border-emerald-400/50', bg: 'bg-emerald-400/10' };

    // Viral referral check for unlocking detailed answers
    const referralsRequired = 3;
    const userReferrals = userProfile.referralsCount || 0;
    const isExplanationsUnlocked = userReferrals >= referralsRequired;

    const handleShareChallenge = () => {
      soundManager.playCyberClick();
      const refLink = `https://t.me/IQLevelUzBot?start=challenge_${userProfile.id.replace('usr-', '')}_iq${calculatedIq}`;
      const text = encodeURIComponent(
        `⚡ MEN IQ TESTDA ${calculatedIq} BALL ("${earnedBadge.title.toUpperCase()}") OLDIM! 🔥\nSen qancha ola olasan? Men bilan duel o'yna yoki o'z aqlingni sinab ko'r! 🚀\nO'ynash uchun bosing: ${refLink}`
      );
      window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`, '_blank');
    };

    const handleShareToUnlock = () => {
      soundManager.playCyberClick();
      const refLink = `https://t.me/IQLevelUzBot?start=ref_${userProfile.id.replace('usr-', '')}`;
      const text = encodeURIComponent(
        `🧠 IQ darajangizni rasmiy 20 ta savolda tekshiring va bepul sertifikat oling! 🚀\nUlanish: ${refLink}`
      );
      window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`, '_blank');
    };

    return (
      <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
            <Award className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-display font-bold text-white tracking-wide">
            TEST YAKUNLANDI!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            20 ta mantiqiy savol natijasi hisoblab chiqildi
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col items-center">
            <div className="text-xs text-cyan-400 font-mono tracking-widest uppercase">
              Sizning IQ Koeffitsiyentingiz
            </div>
            <div className="text-6xl font-display font-extrabold text-amber-400 neon-glow-gold my-1">
              {calculatedIq}
            </div>

            {/* Unvon Badge */}
            <div className={`mt-1 px-4 py-1.5 rounded-full border ${earnedBadge.border} ${earnedBadge.bg} flex items-center gap-2 shadow-md`}>
              <span className="text-base">{earnedBadge.icon}</span>
              <span className={`text-xs font-display font-bold uppercase tracking-wider ${earnedBadge.color}`}>
                Unvon: {earnedBadge.title}
              </span>
            </div>

            <div className="w-full mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-400">
                To'g'ri javoblar: <strong className="text-emerald-400">{correctAnswersCount} / {questions.length}</strong>
              </div>
              <div className="text-slate-400">
                Aniqlik: <strong className="text-cyan-400">{Math.round((correctAnswersCount / questions.length) * 100)}%</strong>
              </div>
            </div>
          </div>

          {/* Do'stlar Dueli (Challenge CTA) */}
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/40 text-left flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Do'stlar Dueli (Challenge)</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                "Men {calculatedIq} ball oldim, sen qancha ola olasan?" havolasini yuboring!
              </div>
            </div>
            <button
              onClick={handleShareChallenge}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chaqiruv</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundManager.playCyberClick();
                setShowCertificate(true);
              }}
              className="h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Sertifikatni Yuklash (Story)</span>
            </button>

            <button
              onClick={restartTest}
              className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-sm border border-cyan-500/40 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qayta Topshirish</span>
            </button>
          </div>

          <button
            onClick={onBackToMenu}
            className="w-full mt-3 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Asosiy Menyuga Qaytish
          </button>
        </div>

        {/* Detailed Review of Answers with 3 Friend Referral Requirement */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Savollar Tahlili ({correctAnswersCount} to'g'ri)
            </h3>
            {isExplanationsUnlocked ? (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>Izohlar Ochiq</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Yopiq Natijalar ({userReferrals}/{referralsRequired})</span>
              </span>
            )}
          </div>

          {!isExplanationsUnlocked ? (
            /* Viral Gate Banner */
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-400/40 text-center space-y-2.5">
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">
                Batafsil Mantiqiy Izohlar Qulflangan
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Testdagi to'g'ri javoblar va ularning batafsil mantiqiy yechimini ko'rish uchun <strong>botga 3 ta do'stingizni taklif qiling</strong> ({userReferrals}/{referralsRequired} taklif qilindi).
              </p>
              <button
                onClick={handleShareToUnlock}
                className="mt-2 h-10 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>3 ta Do'stni Taklif Qilish & Ochish</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const userAns = answeredState[q.id];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs flex items-start gap-2"
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200">
                        {idx + 1}. {q.question}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        To'g'ri: <span className="text-emerald-300 font-medium">{q.options[q.correctIndex]}</span>
                        {userAns !== undefined && !isCorrect && (
                          <span className="text-rose-400 ml-2">Sizning javob: {q.options[userAns]}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-cyan-400/80 mt-1 italic">
                        💡 {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showCertificate && (
          <CertificateGenerator
            userName={userProfile.name}
            iqScore={calculatedIq}
            date={new Date().toISOString().split('T')[0]}
            onClose={() => setShowCertificate(false)}
          />
        )}
      </div>
    );
  }

  // Active Test View
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isTimeUrgent = timeLeft <= 10;

  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-5 space-y-4">
      {/* Top Status Bar: Question Counter & Timer */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30">
        <div>
          <div className="text-[10px] font-mono text-cyan-400 tracking-wider">
            IQ TEST REJIMI
          </div>
          <div className="text-sm font-display font-bold text-white">
            Savol {currentIndex + 1} <span className="text-slate-500 font-normal">/ {questions.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
            {currentQ.category}
          </span>
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border transition-colors ${
              isTimeUrgent
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(0,210,255,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="p-5 rounded-3xl bg-slate-900/95 border border-cyan-500/40 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Visual Puzzle Diagram if available */}
        {currentQ.svgType && (
          <VisualDiagram svgType={currentQ.svgType} />
        )}

        {/* Options Grid */}
        <div className="mt-5 space-y-2.5">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const letterLabel = ['A', 'B', 'C', 'D'][idx];

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-3.5 rounded-2xl text-left text-sm flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-md shadow-cyan-500/25 text-white font-semibold scale-[1.01]'
                    : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {letterLabel}
                </div>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
          <button
            onClick={onBackToMenu}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Chiqish
          </button>

          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`h-11 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              selectedOption !== null
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>{currentIndex === questions.length - 1 ? 'Natijani Hisoblash' : 'Keyingi Savol'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
