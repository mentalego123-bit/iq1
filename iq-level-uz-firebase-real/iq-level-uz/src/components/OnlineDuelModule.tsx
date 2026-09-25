import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Question } from '../types';
import { soundManager } from '../utils/audio';
import * as duel from '../services/duel';
import { Swords, Timer, Trophy, CheckCircle2, RotateCcw, ArrowLeft, Wifi } from 'lucide-react';

interface OnlineDuelModuleProps {
  userProfile: UserProfile;
  questions: Question[];
  onDuelFinish: (
    won: boolean,
    ratingChange: number,
    matchDetails?: {
      playerScore: number;
      opponentScore: number;
      opponentName: string;
      opponentAvatar: string;
      opponentRating: number;
    }
  ) => void;
  onBack: () => void;
}

type Stage = 'searching' | 'no_opponent' | 'battle' | 'result';

const SEARCH_TIMEOUT_MS = 25000;

function playerOf(match: duel.DuelMatch, slot: 'p1' | 'p2'): duel.MatchPlayer {
  return slot === 'p1' ? match.player1 : match.player2;
}

function pickQuestionIds(questions: Question[], count: number): string[] {
  const pool = [...questions];
  const picked: string[] = [];
  while (picked.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0].id);
  }
  return picked;
}

export const OnlineDuelModule: React.FC<OnlineDuelModuleProps> = ({
  userProfile,
  questions,
  onDuelFinish,
  onBack,
}) => {
  const [stage, setStage] = useState<Stage>('searching');
  const [matchId, setMatchId] = useState<string | null>(null);
  const [match, setMatch] = useState<duel.DuelMatch | null>(null);
  const [roundTimeLeft, setRoundTimeLeft] = useState(15);

  const finishedRef = useRef(false); // guard: only report result to App once
  const matchingInFlightRef = useRef(false);
  const hasMatchedRef = useRef(false);

  const me: duel.MatchPlayer = {
    id: userProfile.id,
    name: userProfile.name,
    avatar: userProfile.avatar,
    rating: userProfile.duelRating,
  };

  // ---- 1. Join the real waiting room and look for a real opponent ----
  useEffect(() => {
    let cancelled = false;
    finishedRef.current = false;
    hasMatchedRef.current = false;
    matchingInFlightRef.current = false;

    duel.joinDuelQueue(me).catch(() => {});

    const unsubMine = duel.subscribeToMyQueueEntry(userProfile.id, (entry) => {
      if (cancelled) return;
      if (entry?.status === 'matched' && entry.matchId) {
        hasMatchedRef.current = true;
        setMatchId(entry.matchId);
        setStage('battle');
      }
    });

    const unsubWaiting = duel.subscribeToWaitingPlayers((entries) => {
      if (cancelled || hasMatchedRef.current || matchingInFlightRef.current) return;
      const candidate = entries.find((e) => e.userId !== userProfile.id);
      if (!candidate) return;

      matchingInFlightRef.current = true;
      // Tiny random jitter so two devices racing for the same opponent
      // don't both fire a transaction in the exact same instant.
      const jitter = 150 + Math.random() * 400;
      setTimeout(async () => {
        if (cancelled || hasMatchedRef.current) {
          matchingInFlightRef.current = false;
          return;
        }
        const questionIds = pickQuestionIds(questions, duel.TOTAL_ROUNDS);
        const newMatchId = await duel.tryMatchWith(me, candidate, questionIds);
        matchingInFlightRef.current = false;
        if (newMatchId && !cancelled) {
          hasMatchedRef.current = true;
          setMatchId(newMatchId);
          setStage('battle');
        }
      }, jitter);
    });

    const timeoutId = setTimeout(() => {
      if (!cancelled && !hasMatchedRef.current) {
        setStage((s) => (s === 'searching' ? 'no_opponent' : s));
      }
    }, SEARCH_TIMEOUT_MS);

    return () => {
      cancelled = true;
      unsubMine();
      unsubWaiting();
      clearTimeout(timeoutId);
      if (!hasMatchedRef.current) {
        duel.leaveDuelQueue(userProfile.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.id, stage === 'searching' /* retry trigger */]);

  // ---- 2. Subscribe to the live match once matched ----
  useEffect(() => {
    if (!matchId) return;
    const unsub = duel.subscribeToMatch(matchId, (m) => setMatch(m));
    return () => unsub();
  }, [matchId]);

  const mySlot: 'p1' | 'p2' | null = !match
    ? null
    : match.player1.id === userProfile.id
      ? 'p1'
      : 'p2';
  const opponentSlot: 'p1' | 'p2' | null = mySlot === 'p1' ? 'p2' : mySlot === 'p2' ? 'p1' : null;

  // ---- 3. Round timer + auto-resolve when time is up ----
  useEffect(() => {
    if (!match || match.status !== 'active' || stage !== 'battle') return;
    const currentQ = questions.find((q) => q.id === match.questionIds[match.currentRound]) || questions[0];
    if (!currentQ) return;

    const tick = () => {
      const elapsed = Date.now() - match.roundStartedAt;
      const left = Math.max(0, Math.ceil((duel.ROUND_TIME_MS - elapsed) / 1000));
      setRoundTimeLeft(left);
      if (elapsed >= duel.ROUND_TIME_MS) {
        duel.resolveRoundOnTimeout(match.id, match.currentRound, currentQ.correctIndex).catch(() => {});
      }
    };
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [match?.id, match?.currentRound, match?.roundStartedAt, match?.status, stage, questions]);

  // ---- 4. When the match finishes, report it up to App once ----
  useEffect(() => {
    if (!match || match.status !== 'finished' || !mySlot || !opponentSlot || finishedRef.current) return;
    finishedRef.current = true;
    soundManager.playVictoryFanfare();

    const myScore = match.scores[mySlot];
    const oppScore = match.scores[opponentSlot];
    const won = match.winner === mySlot;
    const isDraw = match.winner === 'draw';
    const ratingChange = isDraw ? 0 : won ? 25 : -15;

    onDuelFinish(won, ratingChange, {
      playerScore: myScore,
      opponentScore: oppScore,
      opponentName: playerOf(match, opponentSlot).name,
      opponentAvatar: playerOf(match, opponentSlot).avatar,
      opponentRating: playerOf(match, opponentSlot).rating,
    });
    setStage('result');
  }, [match, mySlot, opponentSlot, onDuelFinish]);

  const handlePlayerAnswer = (idx: number) => {
    if (!match || !mySlot || match.status !== 'active') return;
    const round = match.rounds[match.currentRound];
    if ((mySlot === 'p1' && round.p1Answer !== null) || (mySlot === 'p2' && round.p2Answer !== null)) return;

    const currentQ = questions.find((q) => q.id === match.questionIds[match.currentRound]) || questions[0];
    soundManager.playCyberClick();
    duel.submitAnswer(match.id, mySlot, match.currentRound, idx, currentQ.correctIndex).catch(() => {});
  };

  const retrySearch = () => {
    soundManager.playCyberClick();
    hasMatchedRef.current = false;
    setStage('searching');
  };

  // ---------------------------------------------------------------------
  // 1. SEARCHING SCREEN
  // ---------------------------------------------------------------------
  if (stage === 'searching') {
    return (
      <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-2 border-cyan-400/80 flex items-center justify-center animate-ping absolute inset-0 opacity-40"></div>
          <div className="w-28 h-28 rounded-full border border-cyan-400 bg-slate-900 flex items-center justify-center shadow-xl shadow-cyan-500/30">
            <Swords className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">
            1V1 DUEL: HAQIQIY RAQIB QIDIRILMOQDA...
          </h2>
          <p className="text-xs text-cyan-400 font-mono mt-1 flex items-center justify-center gap-1">
            <Wifi className="w-3 h-3" /> REAL VAQTDA, FIRESTORE ORQALI
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-w-xs space-y-1">
          <div>🎮 5 ta tezkor mantiqiy savol</div>
          <div>⚡ Kim tez va to'g'ri topsa g'olib bo'ladi</div>
          <div>🏆 Reyting: +25 / -15 Elo ochko</div>
          <div className="text-slate-500">Raqib topilishi uchun yana bitta real foydalanuvchi shu payt saytda "Duel" bo'limida bo'lishi kerak.</div>
        </div>
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-white transition-colors">
          Bekor qilish
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // NO OPPONENT YET
  // ---------------------------------------------------------------------
  if (stage === 'no_opponent') {
    return (
      <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 rounded-full border border-amber-400/60 bg-slate-900 flex items-center justify-center">
          <Swords className="w-10 h-10 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold text-white">Hozircha faol raqib topilmadi</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xs">
            Bu — haqiqiy odamlar o'rtasidagi duel, shuning uchun sizga mos vaqtda
            navbatda turgan boshqa foydalanuvchi kerak. Yana urinib ko'ring yoki
            keyinroq qaytib keling.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={retrySearch}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Qayta urinish
          </button>
          <button
            onClick={onBack}
            className="h-11 px-5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Menyu
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // RESULT SCREEN
  // ---------------------------------------------------------------------
  if (stage === 'result' && match && mySlot && opponentSlot) {
    const myScore = match.scores[mySlot];
    const oppScore = match.scores[opponentSlot];
    const isWinner = match.winner === mySlot;
    const isDraw = match.winner === 'draw';
    const ratingChange = isDraw ? 0 : isWinner ? 25 : -15;
    const opponent = playerOf(match, opponentSlot);

    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-5 animate-fade-in text-center">
        <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
            <Trophy className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white">
            {isDraw ? "DURANG!" : isWinner ? "G'ALABA QOZONDINGIZ!" : "MAG'LUBIYAT"}
          </h2>
          <p className="text-xs text-cyan-400 font-mono mt-0.5">
            Haqiqiy raqib: {opponent.name} {opponent.avatar}
          </p>

          <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-3 items-center">
            <div>
              <div className="text-2xl">{userProfile.avatar}</div>
              <div className="text-xs font-bold text-white mt-1">{userProfile.name}</div>
              <div className="text-lg font-bold font-mono text-cyan-400">{myScore}</div>
            </div>
            <div className="text-slate-500 font-bold font-display text-sm">VS</div>
            <div>
              <div className="text-2xl">{opponent.avatar}</div>
              <div className="text-xs font-bold text-white mt-1">{opponent.name}</div>
              <div className="text-lg font-bold font-mono text-amber-400">{oppScore}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono font-bold flex items-center justify-between">
            <span className="text-slate-300">Yangi Duel Reytingi:</span>
            <span className={ratingChange > 0 ? 'text-emerald-400' : ratingChange < 0 ? 'text-rose-400' : 'text-slate-300'}>
              {userProfile.duelRating + ratingChange} ({ratingChange > 0 ? '+' : ''}{ratingChange})
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={retrySearch}
              className="h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Yangi Duel</span>
            </button>
            <button
              onClick={onBack}
              className="h-11 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Menyu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // LIVE BATTLE ARENA
  // ---------------------------------------------------------------------
  if (stage === 'battle' && match && mySlot && opponentSlot) {
    const currentDuelQ =
      questions.find((q) => q.id === match.questionIds[match.currentRound]) || questions[0];
    const round = match.rounds[match.currentRound];
    const myAnswer = mySlot === 'p1' ? round.p1Answer : round.p2Answer;
    const oppAnswered = (opponentSlot === 'p1' ? round.p1Answer : round.p2Answer) !== null;
    const myPlayer = playerOf(match, mySlot);
    const oppPlayer = playerOf(match, opponentSlot);
    const myScore = match.scores[mySlot];
    const oppScore = match.scores[opponentSlot];

    return (
      <div className="w-full max-w-xl mx-auto p-3 sm:p-5 space-y-4 animate-fade-in">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-lg">
                {myPlayer.avatar}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{myPlayer.name}</span>
                  <span className="text-[10px] text-cyan-400">(Siz)</span>
                </div>
                <div className="text-xs font-mono font-bold text-cyan-300">{myScore} ball</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Raund {match.currentRound + 1} / {duel.TOTAL_ROUNDS}
              </div>
              <div className="text-sm font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
                <Timer className="w-3.5 h-3.5" />
                <span>{roundTimeLeft}s</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                  <span>{oppPlayer.name}</span>
                </div>
                <div className="text-xs font-mono font-bold text-amber-300">{oppScore} ball</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg">
                {oppPlayer.avatar}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex justify-end">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (myScore / 600) * 100)}%` }}
              />
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (oppScore / 600) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/95 border border-cyan-500/40 shadow-xl relative">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="font-mono text-cyan-400">⚡ TEZKOR MANTIQ JANGI</span>
            {oppAnswered ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Raqib javob berdi!
              </span>
            ) : (
              <span className="text-slate-400 italic">Raqib o'ylamoqda...</span>
            )}
          </div>

          <h3 className="text-base font-semibold text-white leading-relaxed">{currentDuelQ.question}</h3>

          <div className="mt-5 space-y-2">
            {currentDuelQ.options.map((option, idx) => {
              const isSelected = myAnswer === idx;
              const isCorrect = idx === currentDuelQ.correctIndex;
              const showAnswerStatus = myAnswer !== null;

              let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-950/80';
              if (showAnswerStatus) {
                if (isCorrect) {
                  borderClass = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold';
                } else if (isSelected && !isCorrect) {
                  borderClass = 'border-rose-500 bg-rose-950/40 text-rose-300 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={myAnswer !== null}
                  onClick={() => handlePlayerAnswer(idx)}
                  className={`w-full p-3.5 rounded-xl text-left text-xs sm:text-sm flex items-center justify-between transition-all border ${borderClass}`}
                >
                  <span>{option}</span>
                  {showAnswerStatus && isCorrect && (
                    <span className="text-emerald-400 font-bold text-xs">✓ To'g'ri</span>
                  )}
                  {showAnswerStatus && isSelected && !isCorrect && (
                    <span className="text-rose-400 font-bold text-xs">✗ Noto'g'ri</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Waiting for match data to arrive after being matched
  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <Swords className="w-10 h-10 text-cyan-400 animate-pulse" />
      <p className="text-xs text-slate-400 font-mono">Raqib topildi, jang boshlanmoqda...</p>
    </div>
  );
};
