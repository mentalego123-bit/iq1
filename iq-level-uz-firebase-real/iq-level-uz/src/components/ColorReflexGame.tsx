import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { soundManager } from '../utils/audio';
import {
  ArrowLeft,
  Timer,
  Zap,
  Trophy,
  RotateCcw,
  Flame,
  CheckCircle,
  XCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Keyboard,
  Gauge,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ColorReflexGameProps {
  onEarnTickets: (count: number) => void;
  onBack: () => void;
  onRecordScore?: (score: number, coins: number) => void;
}

interface ColorDef {
  id: string;
  name: string; // Uzbek name
  hex: string;
  rgb: [number, number, number];
}

const CYBER_COLORS: ColorDef[] = [
  { id: 'cyan', name: "FIRO'ZA", hex: '#00d2ff', rgb: [0.0, 0.82, 1.0] },
  { id: 'orange', name: 'SABZIRANG', hex: '#ea580c', rgb: [0.92, 0.35, 0.05] },
  { id: 'green', name: 'YASHIL', hex: '#10b981', rgb: [0.06, 0.72, 0.51] },
  { id: 'rose', name: 'QIZIL', hex: '#f43f5e', rgb: [0.96, 0.25, 0.37] },
  { id: 'yellow', name: 'SARIQ', hex: '#fbbf24', rgb: [0.98, 0.75, 0.14] },
  { id: 'purple', name: 'BINAFSHA', hex: '#a855f7', rgb: [0.66, 0.33, 0.97] },
  { id: 'white', name: 'OQ', hex: '#ffffff', rgb: [1.0, 1.0, 1.0] },
];

export const ColorReflexGame: React.FC<ColorReflexGameProps> = ({
  onEarnTickets,
  onBack,
  onRecordScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Difficulty Mode: standard (30s) vs hyper (20s with 2x score multiplier)
  const [gameMode, setGameMode] = useState<'standard' | 'hyper'>('standard');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [ticketsClaimed, setTicketsClaimed] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('cyber_color_reflex_best') || '0', 10);
  });

  // Current problem
  const [wordDef, setWordDef] = useState<ColorDef>(CYBER_COLORS[0]);
  const [inkDef, setInkDef] = useState<ColorDef>(CYBER_COLORS[1]);
  const [isMatch, setIsMatch] = useState(false);
  const [questionMode, setQuestionMode] = useState<'yesno' | 'pick'>('yesno');
  const [options, setOptions] = useState<ColorDef[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Shader animation uniforms
  const glitchRef = useRef(0.0);
  const pulseRef = useRef(0.0);
  const promptTimestamp = useRef(Date.now());

  // Generate a new round question
  const generateQuestion = useCallback(() => {
    promptTimestamp.current = Date.now();
    // 50% chance of yes/no question, 50% 4-color choice
    const mode = Math.random() > 0.45 ? 'yesno' : 'pick';
    setQuestionMode(mode);

    const willMatch = Math.random() < 0.45;
    const randomWord = CYBER_COLORS[Math.floor(Math.random() * CYBER_COLORS.length)];
    let randomInk: ColorDef;

    if (willMatch) {
      randomInk = randomWord;
    } else {
      const candidates = CYBER_COLORS.filter((c) => c.id !== randomWord.id);
      randomInk = candidates[Math.floor(Math.random() * candidates.length)];
    }

    setWordDef(randomWord);
    setInkDef(randomInk);
    setIsMatch(willMatch);

    if (mode === 'pick') {
      const opts = new Set<ColorDef>([randomInk]);
      while (opts.size < 4) {
        const c = CYBER_COLORS[Math.floor(Math.random() * CYBER_COLORS.length)];
        opts.add(c);
      }
      setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    }
  }, []);

  // Start game
  const startGame = () => {
    if (soundEnabled) soundManager.playCyberClick();
    const duration = gameMode === 'hyper' ? 20 : 30;
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(duration);
    setReactionTimes([]);
    setTicketsClaimed(false);
    setGameOver(false);
    setIsPlaying(true);
    setFeedback(null);
    generateQuestion();
  };

  // Timer loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setIsPlaying(false);
          if (soundEnabled) soundManager.playVictoryFanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, soundEnabled]);

  // Answer handling
  const handleAnswer = useCallback((selectedYes: boolean | ColorDef) => {
    if (!isPlaying || gameOver) return;
    const reactMs = Date.now() - promptTimestamp.current;
    setReactionTimes((prev) => [...prev, reactMs]);

    let correct = false;
    if (questionMode === 'yesno') {
      correct = selectedYes === isMatch;
    } else {
      correct = (selectedYes as ColorDef).id === inkDef.id;
    }

    if (correct) {
      if (soundEnabled) soundManager.playSuccessChime();
      pulseRef.current = 1.0;
      setFeedback('correct');
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));

      // Combo points calculation with Hyper mode multiplier
      const basePoints = newCombo >= 5 ? 30 : newCombo >= 3 ? 20 : 15;
      const points = gameMode === 'hyper' ? basePoints * 2 : basePoints;
      setScore((prev) => {
        const nextScore = prev + points;
        if (nextScore > highScore) {
          setHighScore(nextScore);
          localStorage.setItem('cyber_color_reflex_best', nextScore.toString());
        }
        return nextScore;
      });

      // Trigger celebratory confetti burst on streak
      if (newCombo % 6 === 0) {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00d2ff', '#ea580c', '#fbbf24', '#ffffff'],
        });
      }
    } else {
      if (soundEnabled) soundManager.playErrorBuzz();
      glitchRef.current = 1.0;
      setFeedback('wrong');
      setCombo(0);
      setScore((prev) => Math.max(0, prev - (gameMode === 'hyper' ? 15 : 10)));
    }

    setTimeout(() => {
      setFeedback(null);
      generateQuestion();
    }, 180);
  }, [isPlaying, gameOver, questionMode, isMatch, inkDef, soundEnabled, combo, gameMode, highScore, generateQuestion]);

  // Keyboard Shortcuts Support for Instant Desktop Play (100% Qulaylik)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) {
        if (e.code === 'Space') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (questionMode === 'yesno') {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === '1') {
          e.preventDefault();
          handleAnswer(false);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '2') {
          e.preventDefault();
          handleAnswer(true);
        }
      } else if (questionMode === 'pick') {
        if (e.key === '1' && options[0]) {
          e.preventDefault();
          handleAnswer(options[0]);
        } else if (e.key === '2' && options[1]) {
          e.preventDefault();
          handleAnswer(options[1]);
        } else if (e.key === '3' && options[2]) {
          e.preventDefault();
          handleAnswer(options[2]);
        } else if (e.key === '4' && options[3]) {
          e.preventDefault();
          handleAnswer(options[3]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, questionMode, options, handleAnswer]);

  // WebGL Cyberpunk Shader Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Vertex shader
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // High-Fidelity Cyberpunk Fragment Shader
    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_color;
      uniform float u_pulse;
      uniform float u_glitch;
      uniform float u_combo;

      // Pseudo-random noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 center = vec2(0.5, 0.5);
        vec2 p = uv - center;
        p.x *= u_resolution.x / u_resolution.y;

        // Glitch twitch offset
        if (u_glitch > 0.01) {
          float twitch = hash(vec2(floor(uv.y * 30.0), u_time)) * u_glitch * 0.08;
          p.x += (twitch - 0.04);
        }

        float dist = length(p);

        // Cyberpunk Scanlines
        float scanline = sin(uv.y * 180.0 + u_time * 5.0) * 0.06;

        // Expanding Hologram Shockwave Ring
        float ringRadius = fract(u_time * 0.75 + u_pulse);
        float ring = smoothstep(0.04, 0.0, abs(dist - ringRadius * 0.9)) * u_pulse * 0.7;

        // Perspective Grid Lines
        float gridY = 1.0 / (abs(p.y) + 0.1);
        float gridX = p.x * gridY;
        float gridLines = step(0.94, fract(gridX * 1.5)) + step(0.94, fract(gridY * 0.3 - u_time * 1.2));
        float gridMask = smoothstep(0.0, 0.7, abs(p.y)) * 0.12;

        // Vignette & Core Glow
        float coreGlow = smoothstep(0.85, 0.1, dist);
        vec3 baseDark = vec3(0.02, 0.03, 0.07);

        // Dynamic theme mix (Cyan, Orange, or current Ink Color)
        vec3 neonColor = u_color;
        if (u_combo > 3.0) {
          // Flow state mix: electric cyan and warm gold/orange
          neonColor = mix(vec3(0.0, 0.82, 1.0), vec3(0.92, 0.35, 0.05), sin(u_time * 3.0) * 0.5 + 0.5);
        }

        vec3 finalColor = baseDark + (neonColor * coreGlow * 0.25)
                          + (gridLines * neonColor * gridMask)
                          + (ring * neonColor * 1.2)
                          + vec3(scanline);

        // Chromatic split on glitch
        if (u_glitch > 0.05) {
          finalColor.r += 0.35 * u_glitch;
          finalColor.b += 0.45 * u_glitch;
        }

        gl_FragColor = vec4(finalColor, 0.95);
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

    const aPos = gl.getAttribLocation(program, 'a_position');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uColor = gl.getUniformLocation(program, 'u_color');
    const uPulse = gl.getUniformLocation(program, 'u_pulse');
    const uGlitch = gl.getUniformLocation(program, 'u_glitch');
    const uCombo = gl.getUniformLocation(program, 'u_combo');

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
      gl.uniform3f(uColor, inkDef.rgb[0], inkDef.rgb[1], inkDef.rgb[2]);
      gl.uniform1f(uPulse, pulseRef.current);
      gl.uniform1f(uGlitch, glitchRef.current);
      gl.uniform1f(uCombo, combo);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      pulseRef.current = Math.max(0, pulseRef.current - 0.04);
      glitchRef.current = Math.max(0, glitchRef.current - 0.05);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [inkDef, combo]);

  const avgReactionMs = useMemo(() => {
    if (reactionTimes.length === 0) return 0;
    return Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
  }, [reactionTimes]);

  const handleClaimReward = () => {
    if (ticketsClaimed) return;
    const targetScore = gameMode === 'hyper' ? 240 : 180;
    if (score >= targetScore) {
      onEarnTickets(1);
    }
    if (onRecordScore) {
      onRecordScore(score, Math.floor(score / 4));
    }
    setTicketsClaimed(true);
  };

  return (
    <div className="relative w-full max-w-md mx-auto p-4 space-y-4 animate-fade-in text-center select-none">
      {/* Top HUD with Audio Mute & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O'yinlar</span>
        </button>

        {isPlaying ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 font-mono text-amber-400 text-xs font-bold bg-slate-900/80 px-2.5 py-1 rounded-xl border border-amber-400/40">
              <Timer className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-orange-400 text-xs font-bold bg-slate-900/80 px-2.5 py-1 rounded-xl border border-orange-500/40">
              <Flame className="w-3.5 h-3.5" />
              <span>x{combo}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-xl">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Rekord: <strong>{highScore}</strong></span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Ovozni yoqish/o'chirish"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <div className="text-xs font-mono text-cyan-300 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-cyan-400/40">
            Ball: <strong className="text-white text-sm">{score}</strong>
          </div>
        </div>
      </div>

      {/* Main Game Screen Container with Cyber Shaders */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-400/50 shadow-[0_0_30px_rgba(0,210,255,0.2)] bg-slate-950 min-h-[380px] flex flex-col items-center justify-center p-6">
        {/* Dynamic Background Shader Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
        />

        {/* Start Game View */}
        {!isPlaying && !gameOver && (
          <div className="relative z-10 space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_#00d2ff] animate-pulse">
              <Zap className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-orange-400">
                COLOR REFLEX (STROOP TEST)
              </h3>
              <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                Miyangizning kognitiv tezligini sinang! So'zning ma'nosi va yozilgan rangini zudlik bilan tahlil qiling.
              </p>
            </div>

            {/* Mode Selector (100% Qulaylik) */}
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
              <button
                onClick={() => setGameMode('standard')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  gameMode === 'standard'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                Standart (30s)
              </button>
              <button
                onClick={() => setGameMode('hyper')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                  gameMode === 'hyper'
                    ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-[0_0_12px_rgba(234,88,12,0.4)]'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Giper (20s, 2x)</span>
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-2xl text-[11px] text-slate-300 space-y-1 max-w-xs mx-auto">
              <div className="text-amber-400 font-bold flex items-center justify-between">
                <span>📋 Qoidalar & Klaviatura:</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Keyboard className="w-3 h-3" /> A/D yoki 1/2
                </span>
              </div>
              <div>• <strong>HA / YO'Q</strong>: So'z ma'nosi va rangi mosmi?</div>
              <div>• <strong>Rang tanlash</strong>: So'z yozilgan haqiqiy rangni tanlang!</div>
              <div>• {gameMode === 'hyper' ? '240+' : '180+'} ballga <strong>+1 Bilet</strong> yutasiz!</div>
            </div>

            <button
              onClick={startGame}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-slate-950 font-bold text-sm shadow-[0_0_20px_#00d2ff] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>O'yinni Boshlash ({gameMode === 'hyper' ? '20s' : '30s'})</span>
            </button>
          </div>
        )}

        {/* Active Gameplay View */}
        {isPlaying && (
          <div className="relative z-10 w-full space-y-6">
            {/* Prompt Instruction */}
            <div className="text-xs font-mono tracking-wider uppercase text-slate-300 bg-slate-900/70 py-1 px-3 rounded-full border border-slate-700 inline-block shadow-md">
              {questionMode === 'yesno'
                ? "Rang so'z ma'nosiga mosmi?"
                : "Yozuvning haqiqiy rangini bosing:"}
            </div>

            {/* Stimulus Word with Cyber Dynamic Glow */}
            <div className="relative py-4">
              <div
                className="text-5xl sm:text-6xl font-display font-black tracking-widest transition-transform duration-100"
                style={{
                  color: inkDef.hex,
                  textShadow: `0 0 25px ${inkDef.hex}, 0 0 50px ${inkDef.hex}66`,
                }}
              >
                {wordDef.name}
              </div>

              {/* Feedback flash overlay */}
              {feedback === 'correct' && (
                <div className="absolute inset-0 flex items-center justify-center animate-ping pointer-events-none">
                  <CheckCircle className="w-16 h-16 text-emerald-400 opacity-70" />
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="absolute inset-0 flex items-center justify-center animate-ping pointer-events-none">
                  <XCircle className="w-16 h-16 text-rose-500 opacity-70" />
                </div>
              )}
            </div>

            {/* Controls: Mode A (Yes / No) with Desktop Hotkey badges */}
            {questionMode === 'yesno' && (
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <button
                  onClick={() => handleAnswer(false)}
                  className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border-2 border-rose-500/60 hover:border-rose-400 text-rose-400 font-display font-bold text-base shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5 relative group"
                >
                  <XCircle className="w-5 h-5" />
                  <span>YO'Q</span>
                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-rose-500/80 bg-slate-950 px-1 rounded">
                    ← / A
                  </span>
                </button>

                <button
                  onClick={() => handleAnswer(true)}
                  className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border-2 border-emerald-400/60 hover:border-emerald-300 text-emerald-400 font-display font-bold text-base shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5 relative group"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>HA (MOS)</span>
                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-emerald-400/80 bg-slate-950 px-1 rounded">
                    → / D
                  </span>
                </button>
              </div>
            )}

            {/* Controls: Mode B (Pick Color) with 1, 2, 3, 4 Hotkeys */}
            {questionMode === 'pick' && (
              <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
                {options.map((opt, idx) => (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(opt)}
                    className="h-12 rounded-xl bg-slate-900/90 hover:bg-slate-850 border-2 text-xs font-bold transition-all active:scale-95 flex items-center justify-between px-3 shadow-lg"
                    style={{
                      borderColor: opt.hex,
                      color: opt.hex,
                      boxShadow: `0 0 12px ${opt.hex}33`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white"
                        style={{ backgroundColor: opt.hex }}
                      />
                      <span>{opt.name}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-70 bg-slate-950 px-1.5 py-0.5 rounded">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="relative z-10 space-y-4 text-center">
            <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce filter drop-shadow-[0_0_15px_#fbbf24]" />
            <h3 className="text-xl font-display font-black text-white">
              SINOV YAKUNLANDI!
            </h3>

            <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-700 space-y-2 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>To'plangan Ball:</span>
                <strong className="text-amber-400 font-bold text-sm">{score}</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Maksimal Streak:</span>
                <strong className="text-orange-400 font-bold">x{maxCombo}</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>O'rtacha Reaksiya:</span>
                <strong className="text-cyan-300 font-bold">
                  {avgReactionMs > 0 ? `${avgReactionMs} ms` : '—'}
                </strong>
              </div>
              <div className="flex justify-between text-xs text-slate-300 font-mono pt-1 border-t border-slate-800">
                <span>Shaxsiy Rekord:</span>
                <strong className="text-emerald-400 font-bold">{highScore} ball</strong>
              </div>
            </div>

            {score >= (gameMode === 'hyper' ? 240 : 180) ? (
              <p className="text-xs text-orange-400 font-bold">
                🎉 Ajoyib Natija! +1 Energiya Bileti yutdingiz!
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Bilet yutish uchun kamida {gameMode === 'hyper' ? '240' : '180'} ball to'plang (Sizda: {score} ball)
              </p>
            )}

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={startGame}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_#00d2ff] active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta O'ynash</span>
              </button>

              {score >= (gameMode === 'hyper' ? 240 : 180) && !ticketsClaimed && (
                <button
                  onClick={handleClaimReward}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs active:scale-95 shadow-[0_0_15px_#ea580c]"
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
};
