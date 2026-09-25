import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';
import { LogicRunnerGame } from './LogicRunnerGame';
import { ColorReflexGame } from './ColorReflexGame';
import { PatternMatchGame } from './PatternMatchGame';
import { AdminSettings, UserProfile } from '../types';
import {
  Brain,
  Zap,
  Grid,
  Trophy,
  RotateCcw,
  Timer,
  Sparkles,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Swords,
  Eye,
  Lock,
  AlertCircle,
  X,
  Target,
  Key,
  Heart,
  Award,
  Gem,
  Palette,
  Search,
  Filter
} from 'lucide-react';

interface MiniGamesModuleProps {
  onEarnTickets: (count: number) => void;
  onBack: () => void;
  adminSettings?: AdminSettings;
  userProfile?: UserProfile;
  onRecordGamePlay?: (
    gameKey: 'runner3d' | 'memory4x4' | 'stroop' | 'speedmath' | 'cipherCode' | 'laserReflex' | 'colorReflex' | 'patternMatch'
  ) => void;
}

type ActiveGame = 'menu' | 'runner3d' | 'memory4x4' | 'stroop' | 'speedmath' | 'cipherCode' | 'laserReflex' | 'colorReflex' | 'patternMatch';

export const MiniGamesModule: React.FC<MiniGamesModuleProps> = ({
  onEarnTickets,
  onBack,
  adminSettings,
  userProfile,
  onRecordGamePlay,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('menu');
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'new' | 'reaction' | 'iq'>('all');

  // Helper to get today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyPlays = userProfile?.dailyGamePlays?.date === todayStr
    ? userProfile.dailyGamePlays
    : { date: todayStr, runner3d: 0, memory4x4: 0, stroop: 0, speedmath: 0, cipherCode: 0, laserReflex: 0, colorReflex: 0, patternMatch: 0 };

  // Limit check helper
  const checkLimitAndStart = (
    gameKey: 'runner3d' | 'memory4x4' | 'stroop' | 'speedmath' | 'cipherCode' | 'laserReflex' | 'colorReflex' | 'patternMatch',
    gameName: string,
    startFn: () => void
  ) => {
    const limits = adminSettings?.gameLimits;
    let maxAllowed = 0;

    if (limits) {
      if (gameKey === 'runner3d') maxAllowed = limits.runnerDailyLimit || 0;
      if (gameKey === 'memory4x4') maxAllowed = limits.matrixDailyLimit || 0;
      if (gameKey === 'stroop') maxAllowed = limits.stroopDailyLimit || 0;
      if (gameKey === 'speedmath') maxAllowed = limits.mathDailyLimit || 0;
    }

    const currentPlayed = (dailyPlays as Record<string, any>)[gameKey] || 0;

    if (maxAllowed > 0 && currentPlayed >= maxAllowed) {
      soundManager.playErrorBuzz();
      setLimitWarning(
        `"${gameName}" o'yini uchun bugungi kunlik limit (${maxAllowed} ta) tugadi! Admin ushbu o'yinni cheklagan. Ertaga yana o'ynashingiz mumkin.`
      );
      return;
    }

    // Record game play
    if (onRecordGamePlay) {
      onRecordGamePlay(gameKey);
    }

    startFn();
  };

  // ==========================================
  // GAME 1: 4x4 MEMORY MATRIX (XOTIRA MATRITSASI)
  // ==========================================
  const [matrixActiveCells, setMatrixActiveCells] = useState<number[]>([]);
  const [userSelectedCells, setUserSelectedCells] = useState<number[]>([]);
  const [isMemorizingPhase, setIsMemorizingPhase] = useState(false);
  const [memorizeCountdown, setMemorizeCountdown] = useState(3);
  const [matrixRound, setMatrixRound] = useState(1);
  const [matrixWon, setMatrixWon] = useState(false);
  const [matrixFailed, setMatrixFailed] = useState(false);

  const startMemory4x4 = () => {
    soundManager.playCyberClick();
    setMatrixRound(1);
    setMatrixFailed(false);
    setMatrixWon(false);
    startMatrixRound(1);
  };

  const startMatrixRound = (round: number) => {
    setUserSelectedCells([]);
    setMatrixFailed(false);
    setIsMemorizingPhase(true);
    setMemorizeCountdown(3);

    const count = 3 + round;
    const cells: number[] = [];
    while (cells.length < count) {
      const r = Math.floor(Math.random() * 16);
      if (!cells.includes(r)) cells.push(r);
    }
    setMatrixActiveCells(cells);

    let timerVal = 3;
    const interval = setInterval(() => {
      timerVal -= 1;
      setMemorizeCountdown(timerVal);
      if (timerVal <= 0) {
        clearInterval(interval);
        setIsMemorizingPhase(false);
        soundManager.playCyberClick();
      }
    }, 1000);
  };

  const handleCellClick = (idx: number) => {
    if (isMemorizingPhase || matrixFailed || matrixWon) return;
    if (userSelectedCells.includes(idx)) return;

    soundManager.playCyberClick();
    const nextSelected = [...userSelectedCells, idx];
    setUserSelectedCells(nextSelected);

    if (!matrixActiveCells.includes(idx)) {
      soundManager.playErrorBuzz();
      setMatrixFailed(true);
      return;
    }

    if (nextSelected.length === matrixActiveCells.length) {
      soundManager.playSuccessChime();
      if (matrixRound < 3) {
        setMatrixRound((r) => r + 1);
        setTimeout(() => startMatrixRound(matrixRound + 1), 800);
      } else {
        setMatrixWon(true);
        soundManager.playVictoryFanfare();
        onEarnTickets(3);
      }
    }
  };

  // ==========================================
  // GAME 2: STROOP TEST (REAKSIYA VA DIQQAT)
  // ==========================================
  const STROOP_COLORS = [
    { name: 'QIZIL', hex: '#ef4444' },
    { name: "KO'K", hex: '#3b82f6' },
    { name: 'YASHIL', hex: '#10b981' },
    { name: 'SARIQ', hex: '#f59e0b' },
  ];

  const [stroopCurrent, setStroopCurrent] = useState({
    text: 'QIZIL',
    textColorName: 'QIZIL',
    colorHex: '#3b82f6',
    actualColorName: "KO'K",
  });
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopTimeLeft, setStroopTimeLeft] = useState(20);
  const [stroopGameOver, setStroopGameOver] = useState(false);

  const startStroopGame = () => {
    soundManager.playCyberClick();
    setStroopScore(0);
    setStroopTimeLeft(20);
    setStroopGameOver(false);
    nextStroopQuestion();
  };

  const nextStroopQuestion = () => {
    const textObj = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    const colorObj = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    setStroopCurrent({
      text: textObj.name,
      textColorName: textObj.name,
      colorHex: colorObj.hex,
      actualColorName: colorObj.name,
    });
  };

  const handleStroopChoice = (chosenColorName: string) => {
    if (stroopGameOver) return;
    if (chosenColorName === stroopCurrent.actualColorName) {
      soundManager.playSuccessChime();
      setStroopScore((s) => s + 1);
      nextStroopQuestion();
    } else {
      soundManager.playErrorBuzz();
      setStroopScore((s) => Math.max(0, s - 1));
      nextStroopQuestion();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeGame === 'stroop' && stroopTimeLeft > 0 && !stroopGameOver) {
      timer = setTimeout(() => setStroopTimeLeft((t) => t - 1), 1000);
    } else if (activeGame === 'stroop' && stroopTimeLeft === 0 && !stroopGameOver) {
      setStroopGameOver(true);
      soundManager.playVictoryFanfare();
      onEarnTickets(3);
    }
    return () => clearTimeout(timer);
  }, [activeGame, stroopTimeLeft, stroopGameOver, onEarnTickets]);

  // ==========================================
  // GAME 3: SPEED MATH 1V1 (TEZKOR MATEMATIKA)
  // ==========================================
  const [mathProb, setMathProb] = useState({ q: '7 × 8', a: 56, opts: [56, 48, 64, 54] });
  const [playerMathPoints, setPlayerMathPoints] = useState(0);
  const [botMathPoints, setBotMathPoints] = useState(0);
  const [math1v1Over, setMath1v1Over] = useState(false);

  const startSpeedMath = () => {
    soundManager.playCyberClick();
    setPlayerMathPoints(0);
    setBotMathPoints(0);
    setMath1v1Over(false);
    nextMathProblem();
  };

  const nextMathProblem = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * 12) + 2;
    let n2 = Math.floor(Math.random() * 12) + 2;
    let ans = 0;
    if (op === '+') ans = n1 + n2;
    else if (op === '-') {
      if (n1 < n2) [n1, n2] = [n2, n1];
      ans = n1 - n2;
    } else {
      n1 = Math.floor(Math.random() * 9) + 2;
      n2 = Math.floor(Math.random() * 9) + 2;
      ans = n1 * n2;
    }

    const setOpts = new Set<number>([ans]);
    while (setOpts.size < 4) {
      const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = Math.max(1, ans + delta);
      setOpts.add(fake);
    }

    const opts = Array.from(setOpts).sort(() => Math.random() - 0.5);
    setMathProb({ q: `${n1} ${op} ${n2}`, a: ans, opts });
  };

  const handleSpeedMathAnswer = (opt: number) => {
    if (math1v1Over) return;
    if (opt === mathProb.a) {
      soundManager.playSuccessChime();
      const nextP = playerMathPoints + 1;
      setPlayerMathPoints(nextP);
      if (nextP >= 10) {
        setMath1v1Over(true);
        soundManager.playVictoryFanfare();
        onEarnTickets(4);
      } else {
        nextMathProblem();
      }
    } else {
      soundManager.playErrorBuzz();
      nextMathProblem();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeGame === 'speedmath' && !math1v1Over) {
      const botDelay = Math.floor(Math.random() * 1200) + 1800;
      interval = setInterval(() => {
        setBotMathPoints((b) => {
          const nextB = b + 1;
          if (nextB >= 10) {
            setMath1v1Over(true);
            soundManager.playErrorBuzz();
          }
          return nextB;
        });
      }, botDelay);
    }
    return () => clearInterval(interval);
  }, [activeGame, math1v1Over]);

  // ==========================================
  // GAME 5: KIBER SHIFR: 4 XONALI KOD QULFI (MASTERMIND)
  // ==========================================
  const [secretCipherCode, setSecretCipherCode] = useState<string[]>([]);
  const [cipherGuesses, setCipherGuesses] = useState<
    { guess: string[]; feedback: ('exact' | 'present' | 'absent')[] }[]
  >([]);
  const [cipherInput, setCipherInput] = useState<string[]>([]);
  const [cipherStatus, setCipherStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [cipherTimeLeft, setCipherTimeLeft] = useState<number>(90);
  const [cipherTicketClaimed, setCipherTicketClaimed] = useState(false);

  const startCipherGame = () => {
    // Generate 4 unique digits
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const shuffled = [...digits].sort(() => 0.5 - Math.random());
    const code = shuffled.slice(0, 4);
    setSecretCipherCode(code);
    setCipherGuesses([]);
    setCipherInput([]);
    setCipherStatus('playing');
    setCipherTimeLeft(90);
    setCipherTicketClaimed(false);
  };

  useEffect(() => {
    if (activeGame !== 'cipherCode' || cipherStatus !== 'playing') return;
    const timer = setInterval(() => {
      setCipherTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCipherStatus('lost');
          soundManager.playErrorBuzz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, cipherStatus]);

  const handleCipherKey = (digit: string) => {
    if (cipherStatus !== 'playing' || cipherInput.length >= 4) return;
    soundManager.playCyberClick();
    setCipherInput((prev) => [...prev, digit]);
  };

  const handleCipherBackspace = () => {
    if (cipherStatus !== 'playing' || cipherInput.length === 0) return;
    soundManager.playCyberClick();
    setCipherInput((prev) => prev.slice(0, -1));
  };

  const handleCipherSubmit = () => {
    if (cipherStatus !== 'playing' || cipherInput.length !== 4) return;

    // Evaluate guess
    const feedback: ('exact' | 'present' | 'absent')[] = cipherInput.map((val, idx) => {
      if (secretCipherCode[idx] === val) return 'exact';
      if (secretCipherCode.includes(val)) return 'present';
      return 'absent';
    });

    const isWin = feedback.every((f) => f === 'exact');
    const newGuesses = [...cipherGuesses, { guess: [...cipherInput], feedback }];
    setCipherGuesses(newGuesses);
    setCipherInput([]);

    if (isWin) {
      setCipherStatus('won');
      soundManager.playVictoryFanfare();
      if (!cipherTicketClaimed) {
        onEarnTickets(1);
        setCipherTicketClaimed(true);
      }
    } else if (newGuesses.length >= 6) {
      setCipherStatus('lost');
      soundManager.playErrorBuzz();
    } else {
      soundManager.playCyberClick();
    }
  };

  // ==========================================
  // GAME 6: TEZKOR REAKSIYA: KIBER LAZER GRID
  // ==========================================
  const [reflexGrid, setReflexGrid] = useState<(null | 'cyan' | 'orange' | 'glitch')[]>(
    Array(9).fill(null)
  );
  const [reflexScore, setReflexScore] = useState(0);
  const [reflexLives, setReflexLives] = useState(3);
  const [reflexTimeLeft, setReflexTimeLeft] = useState(30);
  const [reflexStatus, setReflexStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [reflexReactionTimes, setReflexReactionTimes] = useState<number[]>([]);
  const [spawnTimestamp, setSpawnTimestamp] = useState(0);
  const [reflexTicketClaimed, setReflexTicketClaimed] = useState(false);

  const startLaserReflex = () => {
    setReflexGrid(Array(9).fill(null));
    setReflexScore(0);
    setReflexLives(3);
    setReflexTimeLeft(30);
    setReflexStatus('playing');
    setReflexReactionTimes([]);
    setReflexTicketClaimed(false);
    spawnReflexTarget();
  };

  const spawnReflexTarget = () => {
    const randomCell = Math.floor(Math.random() * 9);
    const roll = Math.random();
    let type: 'cyan' | 'orange' | 'glitch' = 'cyan';
    if (roll > 0.82) type = 'glitch';
    else if (roll > 0.58) type = 'orange';

    const newGrid: (null | 'cyan' | 'orange' | 'glitch')[] = Array(9).fill(null);
    newGrid[randomCell] = type;
    setReflexGrid(newGrid);
    setSpawnTimestamp(Date.now());
  };

  useEffect(() => {
    if (activeGame !== 'laserReflex' || reflexStatus !== 'playing') return;

    const countdown = setInterval(() => {
      setReflexTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setReflexStatus('gameover');
          soundManager.playVictoryFanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [activeGame, reflexStatus]);

  useEffect(() => {
    if (activeGame !== 'laserReflex' || reflexStatus !== 'playing') return;

    const intervalTime = Math.max(500, 950 - reflexScore * 6);
    const spawner = setTimeout(() => {
      spawnReflexTarget();
    }, intervalTime);

    return () => clearTimeout(spawner);
  }, [activeGame, reflexStatus, reflexGrid, reflexScore]);

  const handleReflexCellClick = (index: number) => {
    if (reflexStatus !== 'playing') return;
    const cellValue = reflexGrid[index];

    if (!cellValue) {
      soundManager.playErrorBuzz();
      return;
    }

    const reactMs = Date.now() - spawnTimestamp;
    setReflexReactionTimes((prev) => [...prev, reactMs]);

    if (cellValue === 'glitch') {
      soundManager.playErrorBuzz();
      const nextLives = reflexLives - 1;
      setReflexLives(nextLives);
      setReflexScore((prev) => Math.max(0, prev - 15));
      if (nextLives <= 0) {
        setReflexStatus('gameover');
        soundManager.playErrorBuzz();
      }
    } else if (cellValue === 'orange') {
      soundManager.playVictoryFanfare();
      setReflexScore((prev) => prev + 25);
    } else {
      soundManager.playCyberClick();
      setReflexScore((prev) => prev + 10);
    }

    setReflexGrid(Array(9).fill(null));
    setTimeout(() => {
      spawnReflexTarget();
    }, 100);
  };

  const handleClaimReflexTickets = () => {
    if (reflexTicketClaimed) return;
    if (reflexScore >= 200 && reflexLives > 0) {
      onEarnTickets(1);
    }
    setReflexTicketClaimed(true);
  };

  // ==========================================
  // RENDER CURRENT VIEW
  // ==========================================

  // SUBWAY 4D RUNNER GAME VIEW
  if (activeGame === 'runner3d') {
    return (
      <LogicRunnerGame
        onEarnTickets={onEarnTickets}
        onBack={() => setActiveGame('menu')}
      />
    );
  }

  // COLOR REFLEX GAME VIEW (HIGH-FIDELITY CYBERPUNK SHADERS)
  if (activeGame === 'colorReflex') {
    return (
      <ColorReflexGame
        onEarnTickets={onEarnTickets}
        onBack={() => setActiveGame('menu')}
      />
    );
  }

  // PATTERN MATCH GAME VIEW (HIGH-FIDELITY CYBERPUNK SHADERS)
  if (activeGame === 'patternMatch') {
    return (
      <PatternMatchGame
        onEarnTickets={onEarnTickets}
        onBack={() => setActiveGame('menu')}
      />
    );
  }

  // 4x4 MEMORY MATRIX GAME VIEW
  if (activeGame === 'memory4x4') {
    return (
      <div className="w-full max-w-sm mx-auto p-4 space-y-4 text-center animate-fade-in">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveGame('menu')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>O'yinlar</span>
          </button>
          <div className="text-xs font-mono text-cyan-400 font-bold">
            Raund: {matrixRound} / 3
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-xl">
          <div className="text-xs text-slate-300 mb-3">
            {isMemorizingPhase
              ? `Eslab qoling: ${memorizeCountdown} soniya!`
              : "Endi yongan katakchalarni bosing:"}
          </div>

          {/* 4x4 Grid (16 cells) */}
          <div className="grid grid-cols-4 gap-2.5 p-3 bg-slate-950 rounded-2xl border border-slate-800 max-w-[260px] mx-auto">
            {Array.from({ length: 16 }).map((_, idx) => {
              const isHighlight = isMemorizingPhase && matrixActiveCells.includes(idx);
              const isSelected = userSelectedCells.includes(idx);

              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  disabled={isMemorizingPhase || matrixFailed || matrixWon}
                  className={`aspect-square rounded-xl transition-all duration-200 ${
                    isHighlight
                      ? 'bg-cyan-400 shadow-[0_0_15px_#00d2ff] scale-95'
                      : isSelected
                      ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                      : 'bg-slate-900 hover:bg-slate-800 border border-slate-800'
                  }`}
                />
              );
            })}
          </div>

          {matrixFailed && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs space-y-2">
              <div>Xato katak! Qayta urinib ko'ring.</div>
              <button
                onClick={startMemory4x4}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta Boshlash</span>
              </button>
            </div>
          )}

          {matrixWon && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs space-y-2">
              <div className="font-bold text-sm">G'alaba! Xotirangiz a'lo darajada!</div>
              <p className="text-amber-400">+3 Bilet qo'shildi!</p>
              <button
                onClick={startMemory4x4}
                className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yana O'ynash</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STROOP EFFECT GAME VIEW
  if (activeGame === 'stroop') {
    return (
      <div className="w-full max-w-sm mx-auto p-4 space-y-4 text-center animate-fade-in">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveGame('menu')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>O'yinlar</span>
          </button>
          <div className="flex items-center gap-1 font-mono text-amber-400 text-xs font-bold">
            <Timer className="w-3.5 h-3.5" />
            <span>{stroopTimeLeft}s</span>
          </div>
          <div className="text-xs font-mono text-cyan-400">
            Ball: <strong className="text-white text-sm">{stroopScore}</strong>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/40 shadow-xl">
          {!stroopGameOver ? (
            <>
              <div className="text-xs text-slate-400">
                Diqqat: So'zni emas, aynan <strong>RANGINI</strong> tanlang!
              </div>

              {/* Stroop Word Display */}
              <div
                className="text-4xl sm:text-5xl font-display font-extrabold my-8 tracking-wider filter drop-shadow(0 0 12px currentColor)"
                style={{ color: stroopCurrent.colorHex }}
              >
                {stroopCurrent.text}
              </div>

              {/* Color choices */}
              <div className="grid grid-cols-2 gap-2.5">
                {STROOP_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleStroopChoice(c.name)}
                    className="h-11 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white transition-all active:scale-95"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
              <div className="text-lg font-bold text-white">Vaqt Tugadi!</div>
              <div className="text-xs text-slate-300">
                To'plangan ball: <strong className="text-amber-400 text-lg font-mono">{stroopScore}</strong>
              </div>
              <p className="text-[11px] text-emerald-400">+3 Bilet hisobingizga qo'shildi!</p>
              <button
                onClick={startStroopGame}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta O'ynash</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SPEED MATH 1V1 VIEW
  if (activeGame === 'speedmath') {
    return (
      <div className="w-full max-w-sm mx-auto p-4 space-y-4 text-center animate-fade-in">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveGame('menu')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>O'yinlar</span>
          </button>
          <div className="text-xs font-mono text-purple-400 font-bold">
            Birinchi 10 ta topgan yutadi!
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-xl space-y-4">
          {/* Scoreboard */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs text-cyan-400 font-bold">Siz</div>
              <div className="text-2xl font-mono font-extrabold text-white">{playerMathPoints} / 10</div>
            </div>
            <div>
              <div className="text-xs text-amber-400 font-bold">Bot Raqib</div>
              <div className="text-2xl font-mono font-extrabold text-white">{botMathPoints} / 10</div>
            </div>
          </div>

          {!math1v1Over ? (
            <>
              <div className="text-3xl font-display font-bold text-white my-4">
                {mathProb.q} = ?
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {mathProb.opts.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSpeedMathAnswer(opt)}
                    className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-lg font-bold font-mono text-cyan-300 hover:border-cyan-400 transition-all active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {playerMathPoints >= 10 ? (
                <>
                  <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                  <div className="text-lg font-bold text-emerald-400">G'alaba qozondingiz!</div>
                  <p className="text-xs text-slate-300">+4 Bilet mukofoti qo'shildi!</p>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-rose-400">Raqib oldinroq ulgurdi!</div>
                  <p className="text-xs text-slate-400">Qayta mashq qilib ko'ring.</p>
                </>
              )}

              <button
                onClick={startSpeedMath}
                className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yangi Raqib Bilan Boshlash</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // GAME 5: KIBER SHIFR (MASTERMIND) VIEW
  // ==========================================
  if (activeGame === 'cipherCode') {
    return (
      <div className="w-full max-w-sm mx-auto p-4 space-y-4 animate-fade-in text-center">
        {/* Top HUD */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveGame('menu')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>O'yinlar</span>
          </button>
          <div className="flex items-center gap-1 font-mono text-amber-400 text-xs font-bold">
            <Timer className="w-3.5 h-3.5" />
            <span>{cipherTimeLeft}s</span>
          </div>
          <div className="text-xs font-mono text-cyan-300">
            Urinish: <strong className="text-white font-bold">{cipherGuesses.length}/6</strong>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-orange-500/50 shadow-2xl space-y-4">
          <div>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/20 border border-orange-500 flex items-center justify-center text-orange-400 mb-1 shadow-[0_0_15px_#ea580c]">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-display font-extrabold text-white">
              KIBER SHIFR: 4 XONALI KOD QULFI
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              4 xonali maxfiy kodni 6 ta urinishda toping
            </p>
          </div>

          {/* Color Legend Help */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> O'z o'rnida
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Boshqa o'rinda
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Kodda yo'q
            </span>
          </div>

          {/* Guess History (Scrollable) */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto p-1">
            {cipherGuesses.map((item, gIdx) => (
              <div key={gIdx} className="flex items-center justify-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 w-4">#{gIdx + 1}</span>
                <div className="flex gap-1.5">
                  {item.guess.map((val, cIdx) => {
                    const fb = item.feedback[cIdx];
                    let bg = 'bg-slate-800 text-slate-400 border-slate-700';
                    if (fb === 'exact') bg = 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold shadow-[0_0_10px_#10b981]';
                    if (fb === 'present') bg = 'bg-orange-500 text-white border-orange-300 font-bold shadow-[0_0_10px_#ea580c]';
                    return (
                      <span
                        key={cIdx}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-mono font-bold ${bg}`}
                      >
                        {val}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Active Input Boxes */}
          {cipherStatus === 'playing' && (
            <div className="flex justify-center gap-2 py-1">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-11 rounded-xl border-2 flex items-center justify-center text-base font-mono font-bold transition-all ${
                    cipherInput[idx]
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                      : 'border-slate-700 bg-slate-950 text-slate-500'
                  }`}
                >
                  {cipherInput[idx] || '—'}
                </div>
              ))}
            </div>
          )}

          {/* Outcome Status / Win / Lost */}
          {cipherStatus !== 'playing' && (
            <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {cipherStatus === 'won' ? (
                <>
                  <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                  <div className="text-sm font-bold text-emerald-400">
                    KOD BUZILDI! G'ALABA!
                  </div>
                  <p className="text-xs text-orange-400 font-bold">
                    🎉 +1 Energiya Bileti yutdingiz!
                  </p>
                </>
              ) : (
                <>
                  <div className="text-sm font-bold text-rose-400">
                    Xavfsizlik Tizimi Bloklandi!
                  </div>
                  <p className="text-xs text-slate-400">
                    To'g'ri kod:{' '}
                    <span className="font-mono text-cyan-400 font-bold">
                      {secretCipherCode.join('')}
                    </span>
                  </p>
                </>
              )}

              <button
                onClick={startCipherGame}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_0_15px_#ea580c] active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yangi Kod Bilan O'ynash</span>
              </button>
            </div>
          )}

          {/* Number Pad for Mobile/Desktop */}
          {cipherStatus === 'playing' && (
            <div className="space-y-1.5 pt-1">
              <div className="grid grid-cols-5 gap-1.5">
                {['1', '2', '3', '4', '5'].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleCipherKey(d)}
                    className="h-10 rounded-xl bg-slate-950 hover:bg-slate-850 text-white font-mono font-bold text-sm border border-slate-800 active:scale-95 hover:border-cyan-400 transition-all"
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {['6', '7', '8', '9', '0'].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleCipherKey(d)}
                    className="h-10 rounded-xl bg-slate-950 hover:bg-slate-850 text-white font-mono font-bold text-sm border border-slate-800 active:scale-95 hover:border-cyan-400 transition-all"
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={handleCipherBackspace}
                  className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs active:scale-95 transition-all"
                >
                  O'chirish (⌫)
                </button>
                <button
                  onClick={handleCipherSubmit}
                  disabled={cipherInput.length !== 4}
                  className={`h-10 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                    cipherInput.length === 4
                      ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-[0_0_15px_#00d2ff]'
                      : 'bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  Tekshirish ➜
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // GAME 6: TEZKOR REAKSIYA: KIBER LAZER GRID VIEW
  // ==========================================
  if (activeGame === 'laserReflex') {
    const avgMs =
      reflexReactionTimes.length > 0
        ? Math.round(
            reflexReactionTimes.reduce((a, b) => a + b, 0) / reflexReactionTimes.length
          )
        : 0;

    return (
      <div className="w-full max-w-sm mx-auto p-4 space-y-4 animate-fade-in text-center">
        {/* Top HUD */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveGame('menu')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>O'yinlar</span>
          </button>

          {/* Hearts / Lives */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-all ${
                  i < reflexLives
                    ? 'text-rose-500 fill-rose-500 animate-pulse'
                    : 'text-slate-700 fill-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 font-mono text-cyan-400 text-xs font-bold">
            <Timer className="w-3.5 h-3.5" />
            <span>{reflexTimeLeft}s</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-400/50 shadow-2xl space-y-4">
          <div>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 mb-1 shadow-[0_0_15px_#00d2ff]">
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-display font-extrabold text-white">
              TEZKOR REAKSIYA: KIBER LAZER GRID
            </h3>
            <div className="flex items-center justify-center gap-4 text-xs font-mono mt-1 text-slate-300">
              <span>
                Ball: <strong className="text-amber-400 font-bold text-sm">{reflexScore}</strong>
              </span>
              <span>•</span>
              <span>
                Tezlik:{' '}
                <strong className="text-cyan-300 font-bold">
                  {avgMs > 0 ? `${avgMs}ms` : '—'}
                </strong>
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#00d2ff]" /> Moviy (+10)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_5px_#ea580c]" /> Sabzirang (+25)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Glitch (-15 / Jon)
            </span>
          </div>

          {/* 3x3 Grid (9 Cyber Nodes) */}
          <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-950 rounded-2xl border border-slate-800 max-w-[260px] mx-auto">
            {reflexGrid.map((val, idx) => {
              let style = 'bg-slate-900 border-slate-800 hover:border-slate-700';
              let content = null;

              if (val === 'cyan') {
                style =
                  'bg-gradient-to-tr from-cyan-500 to-sky-400 border-white text-slate-950 shadow-[0_0_20px_#00d2ff] scale-95 animate-pulse';
                content = <Zap className="w-7 h-7 fill-current mx-auto" />;
              } else if (val === 'orange') {
                style =
                  'bg-gradient-to-tr from-orange-600 to-amber-400 border-white text-slate-950 shadow-[0_0_25px_#ea580c] scale-100 animate-bounce';
                content = <Sparkles className="w-7 h-7 fill-current mx-auto" />;
              } else if (val === 'glitch') {
                style =
                  'bg-gradient-to-tr from-rose-600 to-red-500 border-red-300 text-white shadow-[0_0_20px_#f43f5e] animate-ping';
                content = <AlertCircle className="w-7 h-7 mx-auto" />;
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleReflexCellClick(idx)}
                  disabled={reflexStatus !== 'playing'}
                  className={`aspect-square rounded-2xl border flex items-center justify-center transition-all duration-150 active:scale-90 ${style}`}
                >
                  {content}
                </button>
              );
            })}
          </div>

          {/* Game Over Screen */}
          {reflexStatus === 'gameover' && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
              <div className="text-sm font-bold text-white">REAKSIYA SINTOVI YAKUNLANDI!</div>
              <div className="text-xs text-slate-300">
                O'rtacha reaksiya tezligi:{' '}
                <span className="font-mono text-cyan-400 font-bold text-sm">
                  {avgMs > 0 ? `${avgMs} ms` : '—'}
                </span>
              </div>

              {reflexScore >= 200 && reflexLives > 0 ? (
                <p className="text-xs text-orange-400 font-bold">
                  🎉 Super Reaksiya! +1 Energiya Bileti yutdingiz!
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Bilet yutish uchun kamida 200 ball to'plang (Sizda: {reflexScore} ball)
                </p>
              )}

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={startLaserReflex}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_0_15px_#00d2ff] active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Qayta O'ynash</span>
                </button>
                {reflexScore >= 200 && reflexLives > 0 && !reflexTicketClaimed && (
                  <button
                    onClick={handleClaimReflexTickets}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs active:scale-95 shadow-[0_0_15px_#ea580c]"
                  >
                    Biletni Olish (+1)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN GAMES MENU
  // ==========================================
  const limits = adminSettings?.gameLimits;
  const runnerLimit = limits?.runnerDailyLimit || 0;
  const matrixLimit = limits?.matrixDailyLimit || 0;
  const stroopLimit = limits?.stroopDailyLimit || 0;
  const mathLimit = limits?.mathDailyLimit || 0;

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Bosh Menu</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300">
            MIYA TRENAJYORLARI VA O'YINLAR
          </h2>
          <p className="text-[11px] text-slate-400">
            Kognitiv mashqlar bajaring, limitlar asosida bilet va tajriba to'plang
          </p>
        </div>

        <div className="w-8" />
      </div>

      {/* Limit Alert Modal if triggered */}
      {limitWarning && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 shadow-xl flex items-start justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="text-xs text-rose-200">{limitWarning}</div>
          </div>
          <button
            onClick={() => setLimitWarning(null)}
            className="text-rose-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Category Filter Bar (100% Qulaylik) */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="O'yin yoki kognitiv soha bo'yicha qidirish (Stroop, Matritsa, Tezlik...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
          <button
            onClick={() => {
              soundManager.playCyberClick();
              setCategoryFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.3)] font-bold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Barchasi (8)
          </button>
          <button
            onClick={() => {
              soundManager.playCyberClick();
              setCategoryFilter('new');
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === 'new'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)] font-bold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⭐ Yangilar (6)
          </button>
          <button
            onClick={() => {
              soundManager.playCyberClick();
              setCategoryFilter('reaction');
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === 'reaction'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)] font-bold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Tezlik & Reaksiya (5)
          </button>
          <button
            onClick={() => {
              soundManager.playCyberClick();
              setCategoryFilter('iq');
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === 'iq'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)] font-bold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🧠 IQ & Xotira (5)
          </button>
        </div>
      </div>

      {/* Games Cards Grid with Dynamic Filter */}
      {(() => {
        const gamesList = [
          {
            id: 'runner3d',
            title: 'Subway 4D Kiber Runner',
            desc: "Subway Surfers kabi sakrash, sirg'alish, 3 rels bo'ylab yugurish va oltin tangalar yig'ish.",
            badge: runnerLimit === 0 ? 'LIMITSIZ' : `Limit: ${dailyPlays.runner3d || 0}/${runnerLimit}`,
            badgeColor: 'border-cyan-800 bg-cyan-950 text-cyan-300',
            borderColor: 'border-cyan-400/50 hover:border-cyan-300',
            glowColor: 'bg-cyan-500/10',
            iconBg: 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_#00d2ff]',
            Icon: Zap,
            categories: ['all', 'new', 'reaction'],
            onClick: () => {
              checkLimitAndStart('runner3d', 'Subway 4D Kiber Runner', () => {
                setActiveGame('runner3d');
              });
            },
          },
          {
            id: 'colorReflex',
            title: 'Color Reflex (Kiber Stroop)',
            desc: "So'z ma'nosi va yozuv rangining mosligini gologramma sheyderlar va oqim rejimida tezkor aniqlang.",
            badge: 'YANGI (STROOP SHADER)',
            badgeColor: 'border-fuchsia-800 bg-fuchsia-950 text-fuchsia-300',
            borderColor: 'border-fuchsia-500/50 hover:border-fuchsia-400',
            glowColor: 'bg-fuchsia-500/10',
            iconBg: 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-400 shadow-[0_0_15px_#d946ef]',
            Icon: Palette,
            categories: ['all', 'new', 'reaction', 'iq'],
            onClick: () => {
              checkLimitAndStart('colorReflex', 'Color Reflex (Stroop)', () => {
                setActiveGame('colorReflex');
              });
            },
          },
          {
            id: 'patternMatch',
            title: 'Pattern Match (Neon Matritsa)',
            desc: "16 ta kartadagi 8 juft neon gologramma kiber piktogrammalarini g'alaba to'lqinlari bilan toping.",
            badge: 'YANGI (4x4 SHADER)',
            badgeColor: 'border-amber-800 bg-amber-950 text-amber-300',
            borderColor: 'border-amber-400/50 hover:border-amber-300',
            glowColor: 'bg-amber-500/10',
            iconBg: 'bg-amber-400/20 border-amber-400 text-amber-400 shadow-[0_0_15px_#fbbf24]',
            Icon: Gem,
            categories: ['all', 'new', 'iq'],
            onClick: () => {
              checkLimitAndStart('patternMatch', 'Pattern Match (Neon Matritsa)', () => {
                setActiveGame('patternMatch');
              });
            },
          },
          {
            id: 'cipherCode',
            title: 'Kiber Shifr: 4 Xonali Kod Qulfi',
            desc: "4 xonali kiber shifrni 6 ta urinishda toping. Mantiqiy tahlil va deduktiv xulosa sinovi.",
            badge: 'YANGI (IQ DEDUKSIYA)',
            badgeColor: 'border-orange-800 bg-orange-950 text-orange-300',
            borderColor: 'border-orange-500/50 hover:border-orange-400',
            glowColor: 'bg-orange-500/10',
            iconBg: 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_15px_#ea580c]',
            Icon: Lock,
            categories: ['all', 'new', 'iq'],
            onClick: () => {
              checkLimitAndStart('cipherCode', 'Kiber Shifr (Kod Qulfi)', () => {
                setActiveGame('cipherCode');
                startCipherGame();
              });
            },
          },
          {
            id: 'laserReflex',
            title: 'Tezkor Reaksiya: Kiber Lazer Grid',
            desc: "3x3 matritsada chaqnayotgan yadrolarni millisekundlarda bosing va qizil tuzoqlardan saqlaning.",
            badge: 'YANGI (FOKUS & TEZLIK)',
            badgeColor: 'border-cyan-800 bg-cyan-950 text-cyan-300',
            borderColor: 'border-cyan-400/50 hover:border-cyan-300',
            glowColor: 'bg-cyan-500/10',
            iconBg: 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_#00d2ff]',
            Icon: Target,
            categories: ['all', 'new', 'reaction'],
            onClick: () => {
              checkLimitAndStart('laserReflex', 'Kiber Lazer Grid', () => {
                setActiveGame('laserReflex');
                startLaserReflex();
              });
            },
          },
          {
            id: 'memory4x4',
            title: 'Xotira Matritsasi (Memory Matrix)',
            desc: "3 soniyada 4x4 katakchalar yonadi. Ularning joylashuvini xotirada saqlab to'g'ri bosing.",
            badge: matrixLimit === 0 ? 'LIMITSIZ' : `Limit: ${dailyPlays.memory4x4 || 0}/${matrixLimit}`,
            badgeColor: 'border-amber-800 bg-amber-950 text-amber-300',
            borderColor: 'border-amber-400/50 hover:border-amber-300',
            glowColor: 'bg-amber-400/10',
            iconBg: 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-[0_0_15px_#fbbf24]',
            Icon: Grid,
            categories: ['all', 'iq'],
            onClick: () => {
              checkLimitAndStart('memory4x4', 'Xotira Matritsasi', () => {
                setActiveGame('memory4x4');
                startMemory4x4();
              });
            },
          },
          {
            id: 'stroop',
            title: 'Stroop Testi (Reaksiya & Diqqat)',
            desc: "Miyangizni chalg'ituvchi sinov! So'zning ma'nosiga emas, uning rangiga qarab tanlang.",
            badge: stroopLimit === 0 ? 'LIMITSIZ' : `Limit: ${dailyPlays.stroop || 0}/${stroopLimit}`,
            badgeColor: 'border-rose-800 bg-rose-950 text-rose-300',
            borderColor: 'border-rose-500/50 hover:border-rose-400',
            glowColor: 'bg-rose-500/10',
            iconBg: 'bg-rose-500/20 border-rose-400 text-rose-400 shadow-[0_0_15px_#f43f5e]',
            Icon: Eye,
            categories: ['all', 'reaction', 'iq'],
            onClick: () => {
              checkLimitAndStart('stroop', 'Stroop Testi', () => {
                setActiveGame('stroop');
                startStroopGame();
              });
            },
          },
          {
            id: 'speedmath',
            title: 'Tezkor Matematika (Speed Math 1v1)',
            desc: "Raqib bilan 10 ta matematik misolni kim birinchi to'g'ri yechishi bo'yicha onlayn musobaqa.",
            badge: mathLimit === 0 ? 'LIMITSIZ' : `Limit: ${dailyPlays.speedmath || 0}/${mathLimit}`,
            badgeColor: 'border-purple-800 bg-purple-950 text-purple-300',
            borderColor: 'border-purple-500/50 hover:border-purple-400',
            glowColor: 'bg-purple-500/10',
            iconBg: 'bg-purple-500/20 border-purple-400 text-purple-400 shadow-[0_0_15px_#a855f7]',
            Icon: Swords,
            categories: ['all', 'reaction', 'iq'],
            onClick: () => {
              checkLimitAndStart('speedmath', 'Tezkor Matematika 1v1', () => {
                setActiveGame('speedmath');
                startSpeedMath();
              });
            },
          },
        ];

        const query = searchQuery.trim().toLowerCase();
        const filteredGames = gamesList.filter((g) => {
          const matchesCategory = categoryFilter === 'all' || g.categories.includes(categoryFilter);
          const matchesQuery =
            !query ||
            g.title.toLowerCase().includes(query) ||
            g.desc.toLowerCase().includes(query);
          return matchesCategory && matchesQuery;
        });

        if (filteredGames.length === 0) {
          return (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">Mos o'yin topilmadi</div>
              <p className="text-xs text-slate-400">
                "{searchQuery}" so'rovi bo'yicha o'yin chiqmadi. Boshqa kalit so'zni sinab ko'ring.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold"
              >
                Filtrlarni tozalash
              </button>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredGames.map((game) => {
              const { Icon } = game;
              return (
                <div
                  key={game.id}
                  onClick={game.onClick}
                  className={`relative p-5 rounded-3xl bg-slate-900 border ${game.borderColor} cursor-pointer group transition-all shadow-xl hover:scale-[1.01] overflow-hidden`}
                >
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 ${game.glowColor} rounded-full blur-xl pointer-events-none`}
                  />
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform ${game.iconBg}`}
                    >
                      <Icon className="w-6 h-6 animate-pulse" />
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${game.badgeColor}`}
                    >
                      {game.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300">
                    {game.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {game.desc}
                  </p>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};
