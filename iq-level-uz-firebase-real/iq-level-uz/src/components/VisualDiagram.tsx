import React from 'react';

interface VisualDiagramProps {
  svgType?: 'matrix3x3' | 'patternSeries' | 'shapes' | 'clockMath' | 'cube';
}

export const VisualDiagram: React.FC<VisualDiagramProps> = ({ svgType }) => {
  if (!svgType) return null;

  if (svgType === 'matrix3x3') {
    return (
      <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-col items-center">
        <div className="text-xs text-cyan-400 font-mono tracking-wider mb-2">3×3 VISUAL MATRIX</div>
        <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/90 rounded-lg border border-slate-700">
          {/* Row 1 */}
          <div className="w-14 h-14 bg-slate-950 rounded border border-cyan-500/40 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <line x1="8" y1="20" x2="32" y2="20" stroke="#00d2ff" strokeWidth="2" />
              <line x1="20" y1="8" x2="20" y2="32" stroke="#00d2ff" strokeWidth="2" />
            </svg>
          </div>
          <div className="w-14 h-14 bg-slate-950 rounded border border-cyan-500/40 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <line x1="8" y1="14" x2="32" y2="14" stroke="#00d2ff" strokeWidth="2" />
              <line x1="8" y1="26" x2="32" y2="26" stroke="#00d2ff" strokeWidth="2" />
              <line x1="20" y1="8" x2="20" y2="32" stroke="#00d2ff" strokeWidth="2" />
            </svg>
          </div>
          <div className="w-14 h-14 bg-slate-950 rounded border border-cyan-500/40 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <line x1="8" y1="12" x2="32" y2="12" stroke="#00d2ff" strokeWidth="2" />
              <line x1="8" y1="20" x2="32" y2="20" stroke="#00d2ff" strokeWidth="2" />
              <line x1="8" y1="28" x2="32" y2="28" stroke="#00d2ff" strokeWidth="2" />
              <line x1="20" y1="8" x2="20" y2="32" stroke="#00d2ff" strokeWidth="2" />
            </svg>
          </div>

          {/* Row 2 */}
          <div className="w-14 h-14 bg-slate-950 rounded border border-cyan-500/40 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="10" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <circle cx="20" cy="20" r="3" fill="#fbbf24" />
            </svg>
          </div>
          <div className="w-14 h-14 bg-slate-950 rounded border border-cyan-500/40 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="12" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <circle cx="15" cy="20" r="2.5" fill="#fbbf24" />
              <circle cx="25" cy="20" r="2.5" fill="#fbbf24" />
            </svg>
          </div>
          <div className="w-14 h-14 bg-slate-950 rounded border border-cyan-500/40 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="14" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <circle cx="13" cy="20" r="2" fill="#fbbf24" />
              <circle cx="20" cy="20" r="2" fill="#fbbf24" />
              <circle cx="27" cy="20" r="2" fill="#fbbf24" />
            </svg>
          </div>

          {/* Row 3 */}
          <div className="w-14 h-14 bg-slate-950 rounded border border-cyan-500/40 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <polygon points="20,10 32,30 8,30" stroke="#38bdf8" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <div className="w-14 h-14 bg-slate-950 rounded border border-cyan-500/40 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <polygon points="20,8 33,28 7,28" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <line x1="20" y1="8" x2="20" y2="28" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </div>
          <div className="w-14 h-14 bg-cyan-950/40 rounded border-2 border-dashed border-amber-400/80 flex items-center justify-center animate-pulse">
            <span className="text-xl font-bold text-amber-400 font-display">?</span>
          </div>
        </div>
      </div>
    );
  }

  if (svgType === 'shapes') {
    return (
      <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-col items-center">
        <div className="text-xs text-cyan-400 font-mono tracking-wider mb-2">SHAKLLAR KETMA-KETLIGI</div>
        <div className="flex items-center gap-3 overflow-x-auto p-2">
          {/* 3 sides */}
          <div className="w-12 h-12 rounded bg-slate-900 border border-cyan-500/50 flex flex-col items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <polygon points="16,6 27,26 5,26" stroke="#00d2ff" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-[10px] text-cyan-400 font-mono">3</span>
          </div>
          <span className="text-slate-500">→</span>
          {/* 4 sides */}
          <div className="w-12 h-12 rounded bg-slate-900 border border-cyan-500/50 flex flex-col items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <rect x="7" y="7" width="18" height="18" stroke="#00d2ff" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-[10px] text-cyan-400 font-mono">4</span>
          </div>
          <span className="text-slate-500">→</span>
          {/* 5 sides */}
          <div className="w-12 h-12 rounded bg-slate-900 border border-cyan-500/50 flex flex-col items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <polygon points="16,6 27,14 23,26 9,26 5,14" stroke="#00d2ff" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-[10px] text-cyan-400 font-mono">5</span>
          </div>
          <span className="text-slate-500">→</span>
          {/* 6 sides */}
          <div className="w-12 h-12 rounded bg-slate-900 border border-cyan-500/50 flex flex-col items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <polygon points="16,5 26,11 26,21 16,27 6,21 6,11" stroke="#00d2ff" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-[10px] text-cyan-400 font-mono">6</span>
          </div>
          <span className="text-slate-500">→</span>
          {/* ? */}
          <div className="w-12 h-12 rounded bg-amber-950/40 border-2 border-dashed border-amber-400 flex items-center justify-center">
            <span className="text-lg font-bold text-amber-400 font-display">?</span>
          </div>
        </div>
      </div>
    );
  }

  if (svgType === 'cube') {
    return (
      <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-col items-center">
        <div className="text-xs text-cyan-400 font-mono tracking-wider mb-2">KUBIK YOYILMASI (ZAR)</div>
        <div className="grid grid-cols-4 gap-1 p-2">
          <div className="w-8 h-8"></div>
          <div className="w-8 h-8 rounded bg-slate-800 border border-cyan-400/50 flex items-center justify-center text-xs font-bold text-white">1</div>
          <div className="w-8 h-8"></div>
          <div className="w-8 h-8"></div>

          <div className="w-8 h-8 rounded bg-slate-800 border border-cyan-400/50 flex items-center justify-center text-xs font-bold text-white">2</div>
          <div className="w-8 h-8 rounded bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-xs font-bold text-amber-300">3</div>
          <div className="w-8 h-8 rounded bg-cyan-900/50 border border-cyan-400 flex items-center justify-center text-xs font-bold text-cyan-200">?</div>
          <div className="w-8 h-8 rounded bg-slate-800 border border-cyan-400/50 flex items-center justify-center text-xs font-bold text-white">5</div>

          <div className="w-8 h-8"></div>
          <div className="w-8 h-8 rounded bg-slate-800 border border-cyan-400/50 flex items-center justify-center text-xs font-bold text-white">6</div>
          <div className="w-8 h-8"></div>
          <div className="w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (svgType === 'patternSeries') {
    return (
      <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-col items-center">
        <div className="text-xs text-cyan-400 font-mono tracking-wider mb-2">AYLANMA HARAKAT BURILISHI</div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border border-cyan-500/60 bg-slate-900 flex items-center justify-center relative">
            <div className="w-1 h-4 bg-cyan-400 absolute top-2 rounded-full origin-bottom" style={{ transform: 'rotate(0deg)' }}></div>
            <div className="w-2 h-2 rounded-full bg-cyan-300"></div>
          </div>
          <span className="text-slate-500 text-xs">→ +45° →</span>
          <div className="w-12 h-12 rounded-full border border-cyan-500/60 bg-slate-900 flex items-center justify-center relative">
            <div className="w-1 h-4 bg-cyan-400 absolute top-2 rounded-full origin-bottom" style={{ transform: 'rotate(45deg)' }}></div>
            <div className="w-2 h-2 rounded-full bg-cyan-300"></div>
          </div>
          <span className="text-slate-500 text-xs">→ ... →</span>
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400 bg-amber-950/30 flex items-center justify-center">
            <span className="text-amber-400 font-bold">5x?</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
