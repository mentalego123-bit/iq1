import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { soundManager } from '../utils/audio';
import {
  ArrowLeft,
  Timer,
  Trophy,
  RotateCcw,
  Zap,
  Shield,
  Target,
  Eye,
  Crown,
  Sparkles,
  Rocket,
  Flame,
  CheckCircle,
  Gem,
  Lock,
  Volume2,
  VolumeX,
  Scan,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PatternMatchGameProps {
  onEarnTickets: (count: number) => void;
  onBack: () => void;
  onRecordScore?: (score: number, coins: number) => void;
}

interface CyberIconCard {
  id: string; // unique card instance id
  pairKey: string;
  name: string;
  iconName: 'zap' | 'atom' | 'shield' | 'target' | 'eye' | 'crown' | 'gem' | 'rocket';
  colorHex: string;
  rgb: [number, number, number];
}

const ICON_DEFINITIONS = [
  { pairKey: 'zap', name: 'Kiber Plazma', iconName: 'zap' as const, colorHex: '#00d2ff', rgb: [0.0, 0.82, 1.0] as [number, number, number] },
  { pairKey: 'atom', name: 'Kvant Yadrosi', iconName: 'atom' as const, colorHex: '#ea580c', rgb: [0.92, 0.35, 0.05] as [number, number, number] },
  { pairKey: 'shield', name: 'Aegis Qalqon', iconName: 'shield' as const, colorHex: '#10b981', rgb: [0.06, 0.72, 0.51] as [number, number, number] },
  { pairKey: 'target', name: 'Lazer Nishon', iconName: 'target' as const, colorHex: '#f43f5e', rgb: [0.96, 0.25, 0.37] as [number, number, number] },
  { pairKey: 'eye', name: 'Kiber Ko\'z', iconName: 'eye' as const, colorHex: '#a855f7', rgb: [0.66, 0.33, 0.97] as [number, number, number] },
  { pairKey: 'crown', name: 'Oltin Toj', iconName: 'crown' as const, colorHex: '#fbbf24', rgb: [0.98, 0.75, 0.14] as [number, number, number] },
  { pairKey: 'gem', name: 'Matritsa Kristali', iconName: 'gem' as const, colorHex: '#ffffff', rgb: [1.0, 1.0, 1.0] as [number, number, number] },
  { pairKey: 'rocket', name: 'Giper Tezlatgich', iconName: 'rocket' as const, colorHex: '#38bdf8', rgb: [0.22, 0.74, 0.97] as [number, number, number] },
];

export const PatternMatchGame: React.FC<PatternMatchGameProps> = ({
  onEarnTickets,
  onBack,
  onRecordScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Settings & Powerups
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hintsAvailable, setHintsAvailable] = useState(1);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);

  // Game state
  const [cards, setCards] = useState<CyberIconCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(55);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [ticketsClaimed, setTicketsClaimed] = useState(false);
  const [bestMoves, setBestMoves] = useState<number>(() => {
    return parseInt(localStorage.getItem('cyber_pattern_match_best_moves') || '0', 10);
  });

  // Shader uniforms
  const shockwaveRef = useRef(0.0);
  const matchColorRef = useRef<[number, number, number]>([0.0, 0.82, 1.0]);

  // Generate shuffled 16 cards (8 pairs)
  const initializeCards = useCallback(() => {
    const deck: CyberIconCard[] = [];
    ICON_DEFINITIONS.forEach((def) => {
      deck.push({
        id: `${def.pairKey}-1`,
        pairKey: def.pairKey,
        name: def.name,
        iconName: def.iconName,
        colorHex: def.colorHex,
        rgb: def.rgb,
      });
      deck.push({
        id: `${def.pairKey}-2`,
        pairKey: def.pairKey,
        name: def.name,
        iconName: def.iconName,
        colorHex: def.colorHex,
        rgb: def.rgb,
      });
    });

    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setHighlightedIndices([]);
    setHintsAvailable(1);
    setMoves(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(55);
    setGameOver(false);
    setGameWon(false);
    setTicketsClaimed(false);
  }, []);

  const startGame = () => {
    if (soundEnabled) soundManager.playCyberClick();
    initializeCards();
    setIsPlaying(true);
  };

  // Timer loop
  useEffect(() => {
    if (!isPlaying || gameOver || gameWon) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setIsPlaying(false);
          if (soundEnabled) soundManager.playErrorBuzz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, gameWon, soundEnabled]);

  // Scanner Powerup (100% Qulaylik): Reveals 1 unmatched pair for 1.2s
  const handleUseScannerHint = () => {
    if (hintsAvailable <= 0 || !isPlaying || gameOver || gameWon) return;
    if (soundEnabled) soundManager.playCyberClick();

    // Find first unmatched pair
    const remainingPairKeys = ICON_DEFINITIONS.map((i) => i.pairKey).filter(
      (k) => !matchedPairs.includes(k)
    );
    if (remainingPairKeys.length === 0) return;

    const targetKey = remainingPairKeys[0];
    const pairIndices = cards
      .map((c, idx) => (c.pairKey === targetKey ? idx : -1))
      .filter((idx) => idx !== -1);

    setHintsAvailable((prev) => prev - 1);
    setHighlightedIndices(pairIndices);

    // Shockwave pulse
    shockwaveRef.current = 1.0;

    setTimeout(() => {
      setHighlightedIndices([]);
    }, 1200);
  };

  // Card click logic
  const handleCardClick = (index: number) => {
    if (!isPlaying || gameOver || gameWon) return;
    if (flippedIndices.length >= 2) return;
    if (flippedIndices.includes(index)) return;
    if (matchedPairs.includes(cards[index].pairKey)) return;

    if (soundEnabled) soundManager.playCyberClick();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // If 2 cards flipped, evaluate match
    if (newFlipped.length === 2) {
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      const [idx1, idx2] = newFlipped;
      const card1 = cards[idx1];
      const card2 = cards[idx2];

      if (card1.pairKey === card2.pairKey) {
        // MATCH!
        if (soundEnabled) soundManager.playSuccessChime();
        shockwaveRef.current = 1.0;
        matchColorRef.current = card1.rgb;

        const nextMatched = [...matchedPairs, card1.pairKey];
        setMatchedPairs(nextMatched);
        setFlippedIndices([]);

        const nextCombo = combo + 1;
        setCombo(nextCombo);
        setMaxCombo((prev) => Math.max(prev, nextCombo));

        // Victory condition: all 8 pairs matched
        if (nextMatched.length === 8) {
          setGameWon(true);
          setIsPlaying(false);
          if (soundEnabled) soundManager.playVictoryFanfare();

          if (bestMoves === 0 || nextMoves < bestMoves) {
            setBestMoves(nextMoves);
            localStorage.setItem('cyber_pattern_match_best_moves', nextMoves.toString());
          }

          confetti({
            particleCount: 60,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#00d2ff', '#ea580c', '#fbbf24', '#ffffff', '#10b981'],
          });
        }
      } else {
        // MISMATCH
        if (soundEnabled) soundManager.playErrorBuzz();
        setCombo(0);
        setTimeout(() => {
          setFlippedIndices([]);
        }, 750);
      }
    }
  };

  // Keyboard shortcut Space to start or restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((!isPlaying || gameOver || gameWon) && e.code === 'Space') {
        e.preventDefault();
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, gameWon]);

  // High-Fidelity Cyberpunk Hologram Shader
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_match_color;
      uniform float u_shockwave;
      uniform float u_matched_count;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 center = vec2(0.5, 0.5);
        vec2 p = uv - center;
        p.x *= u_resolution.x / u_resolution.y;

        float dist = length(p);

        // Cyber Grid Lines
        vec2 grid = fract(uv * 18.0) - 0.5;
        float gridDist = min(abs(grid.x), abs(grid.y));
        float gridLine = smoothstep(0.04, 0.0, gridDist) * 0.12;

        // Shockwave Ripple
        float waveRadius = fract(u_time * 1.2 + u_shockwave);
        float shock = smoothstep(0.06, 0.0, abs(dist - waveRadius)) * u_shockwave * 0.9;

        // Ambient cyber glow
        float glow = smoothstep(0.9, 0.15, dist);
        vec3 base = vec3(0.015, 0.02, 0.05);

        // Progress aura: transitions from cyan to deep orange/gold
        float prog = u_matched_count / 8.0;
        vec3 progColor = mix(vec3(0.0, 0.82, 1.0), vec3(0.92, 0.35, 0.05), prog);

        vec3 finalColor = base + (progColor * glow * 0.22)
                          + (gridLine * vec3(0.0, 0.82, 1.0))
                          + (shock * u_match_color * 1.5);

        gl_FragColor = vec4(finalColor, 0.94);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_pos');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMatchColor = gl.getUniformLocation(program, 'u_match_color');
    const uShockwave = gl.getUniformLocation(program, 'u_shockwave');
    const uMatchedCount = gl.getUniformLocation(program, 'u_matched_count');

    let animationFrameId: number;
    const startTime = performance.now();

    const render = () => {
      const width = (canvas.width = canvas.clientWidth);
      const height = (canvas.height = canvas.clientHeight);
      gl.viewport(0, 0, width, height);

      gl.useProgram(program);
      gl.enableVertexAttribArray(aPos);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const currentTime = (performance.now() - startTime) * 0.001;
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, currentTime);
      gl.uniform3f(uMatchColor, matchColorRef.current[0], matchColorRef.current[1], matchColorRef.current[2]);
      gl.uniform1f(uShockwave, shockwaveRef.current);
      gl.uniform1f(uMatchedCount, matchedPairs.length);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      shockwaveRef.current = Math.max(0, shockwaveRef.current - 0.035);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [matchedPairs.length]);

  // Render Icon helper
  const renderCardIcon = (iconName: CyberIconCard['iconName'], color: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-7 h-7" style={{ color }} />;
      case 'atom':
        return <Sparkles className="w-7 h-7 animate-spin" style={{ color }} />;
      case 'shield':
        return <Shield className="w-7 h-7" style={{ color }} />;
      case 'target':
        return <Target className="w-7 h-7 animate-pulse" style={{ color }} />;
      case 'eye':
        return <Eye className="w-7 h-7" style={{ color }} />;
      case 'crown':
        return <Crown className="w-7 h-7" style={{ color }} />;
      case 'gem':
        return <Gem className="w-7 h-7" style={{ color }} />;
      case 'rocket':
        return <Rocket className="w-7 h-7" style={{ color }} />;
    }
  };

  const handleClaimReward = () => {
    if (ticketsClaimed) return;
    onEarnTickets(1);
    if (onRecordScore) {
      onRecordScore(matchedPairs.length * 35, 40);
    }
    setTicketsClaimed(true);
  };

  return (
    <div className="relative w-full max-w-md mx-auto p-4 space-y-4 animate-fade-in text-center select-none">
      {/* Top HUD */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O'yinlar</span>
        </button>

        {isPlaying ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-mono text-amber-400 text-xs font-bold bg-slate-900/80 px-2.5 py-1 rounded-xl border border-amber-400/40">
              <Timer className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-cyan-300 text-xs font-bold bg-slate-900/80 px-2.5 py-1 rounded-xl border border-cyan-400/40">
              <span>{matchedPairs.length}/8 Juft</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-xl">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Eng kam harakat: <strong>{bestMoves > 0 ? `${bestMoves} ta` : '—'}</strong></span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isPlaying && (
            <button
              onClick={handleUseScannerHint}
              disabled={hintsAvailable <= 0}
              className={`px-2 py-1 rounded-xl text-xs flex items-center gap-1 font-mono border transition-all ${
                hintsAvailable > 0
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,210,255,0.4)] active:scale-95'
                  : 'bg-slate-900 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
              }`}
              title="Kiber Skaner (Juftlikni ko'rsatish)"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{hintsAvailable}x</span>
            </button>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Ovozni yoqish/o'chirish"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-orange-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <div className="text-xs font-mono text-orange-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-orange-500/40">
            Harakat: <strong className="text-white text-sm">{moves}</strong>
          </div>
        </div>
      </div>

      {/* Main Game Screen Container with Cyber Shaders */}
      <div className="relative rounded-3xl overflow-hidden border border-orange-500/50 shadow-[0_0_30px_rgba(234,88,12,0.2)] bg-slate-950 min-h-[420px] flex flex-col items-center justify-center p-4">
        {/* Dynamic Shader Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
        />

        {/* Start Game View */}
        {!isPlaying && !gameOver && !gameWon && (
          <div className="relative z-10 space-y-4 text-center p-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center text-orange-400 shadow-[0_0_20px_#ea580c] animate-pulse">
              <Gem className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-cyan-400">
                PATTERN MATCH (NEON MATRITSA)
              </h3>
              <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                4x4 kiber matritsada yashiringan neon gologramma piktogrammalarini juftlab toping!
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-2xl text-[11px] text-slate-300 space-y-1 max-w-xs mx-auto">
              <div className="text-cyan-400 font-bold">📋 Qoida & Yordam:</div>
              <div>• 16 ta kartada 8 ta kiber juftlik yashiringan.</div>
              <div>• O'yin davomida <strong>1x Kiber Skaner</strong> dan foydalanishingiz mumkin.</div>
              <div>• Barcha juftliklar ochilgach <strong>+1 Bilet</strong> yutasiz!</div>
            </div>

            <button
              onClick={startGame}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_#ea580c] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>O'yinni Boshlash (55s)</span>
            </button>
          </div>
        )}

        {/* 4x4 Grid of Cards */}
        {isPlaying && (
          <div className="relative z-10 w-full max-w-[320px] mx-auto grid grid-cols-4 gap-2.5">
            {cards.map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx);
              const isMatched = matchedPairs.includes(card.pairKey);
              const isHighlighted = highlightedIndices.includes(idx);

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className="aspect-square cursor-pointer [perspective:1000px]"
                >
                  <div
                    className={`relative w-full h-full rounded-2xl transition-all duration-300 [transform-style:preserve-3d] ${
                      isFlipped || isMatched || isHighlighted ? '[transform:rotateY(180deg)]' : ''
                    } ${isHighlighted ? 'scale-105 ring-2 ring-cyan-400 animate-pulse' : ''}`}
                  >
                    {/* Card Back (Hidden) */}
                    <div className="absolute inset-0 rounded-2xl bg-slate-900/95 border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-center shadow-lg transition-all [backface-visibility:hidden]">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.3)]">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Card Front (Revealed Icon with Cyber Glow) */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-slate-950/95 border-2 flex items-center justify-center shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden] ${
                        isMatched
                          ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                          : 'border-orange-500 bg-slate-900/90 shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                      }`}
                      style={{
                        borderColor: isMatched ? '#10b981' : card.colorHex,
                        boxShadow: `0 0 15px ${card.colorHex}55`,
                      }}
                    >
                      {renderCardIcon(card.iconName, card.colorHex)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Victory Screen */}
        {gameWon && (
          <div className="relative z-10 space-y-4 text-center p-2">
            <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce filter drop-shadow-[0_0_20px_#fbbf24]" />
            <h3 className="text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-cyan-400">
              BARCHA JUFTLIKLAR TOPIILDI!
            </h3>

            <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-700 space-y-2 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Qolgan Vaqt:</span>
                <strong className="text-amber-400 font-bold text-sm">{timeLeft}s</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Harakatlar Soni:</span>
                <strong className="text-cyan-300 font-bold">{moves} ta</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Eng Yaxshi Natija:</span>
                <strong className="text-emerald-400 font-bold">{bestMoves} ta</strong>
              </div>
            </div>

            <p className="text-xs text-orange-400 font-bold">
              🎉 G'alaba! +1 Energiya Bileti yutdingiz!
            </p>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={startGame}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_#ea580c] active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta O'ynash</span>
              </button>

              {!ticketsClaimed && (
                <button
                  onClick={handleClaimReward}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs active:scale-95 shadow-[0_0_15px_#00d2ff]"
                >
                  Biletni Olish (+1)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && !gameWon && (
          <div className="relative z-10 space-y-4 text-center p-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400">
              <Timer className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-display font-black text-rose-400">
              VAQT TUGADI!
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Siz {matchedPairs.length}/8 ta juftlikni topishga ulgurdingiz. Qayta urinib ko'ring!
            </p>

            <button
              onClick={startGame}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_#ea580c] active:scale-95 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Qayta Urinib Ko'rish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
