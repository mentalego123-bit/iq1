import React, { useRef, useEffect, useState, useMemo } from 'react';
import { soundManager } from '../utils/audio';
import {
  Download,
  Share2,
  Check,
  Copy,
  Award,
  ShieldCheck,
  Sparkles,
  Maximize2,
  X,
  ExternalLink,
} from 'lucide-react';

export interface CertificateGeneratorProps {
  userName: string;
  iqScore: number;
  date?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  userName,
  iqScore,
  date = new Date().toISOString().split('T')[0],
  onClose,
  isModal = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Unvonlar (Badges) tizimi:
  // IQ 80–99: "Izlanuvchi"
  // IQ 100–119: "Mantiq Ustasi"
  // IQ 120+: "Daho"
  const badgeRank = useMemo(() => {
    if (iqScore >= 120) {
      return {
        badgeName: 'DAHO',
        subtitle: 'MUTLAQ KOGNITIV INTELEKT (TOP 1% GENIUS)',
        accentColor: '#fbbf24', // Deep Yellow / Royal Gold
        secondaryColor: '#f59e0b',
        glowColor: 'rgba(251, 191, 36, 0.45)',
        badgeIcon: '👑',
        levelClass: 'LEGENDARY TIER',
      };
    }
    if (iqScore >= 100) {
      return {
        badgeName: 'MANTIQ USTASI',
        subtitle: 'YUKSAK MANTIQIY SALOHIYAT (SUPERIOR MASTER)',
        accentColor: '#00d2ff', // Transparent Cyan / Electric Blue
        secondaryColor: '#38bdf8',
        glowColor: 'rgba(0, 210, 255, 0.45)',
        badgeIcon: '⚡',
        levelClass: 'SUPERIOR TIER',
      };
    }
    return {
      badgeName: 'IZLANUVCHI',
      subtitle: 'FAOL KOGNITIV TADQIQOTCHI (ACTIVE EXPLORER)',
      accentColor: '#34d399', // Emerald / Mint
      secondaryColor: '#10b981',
      glowColor: 'rgba(52, 211, 153, 0.45)',
      badgeIcon: '🎯',
      levelClass: 'EXPLORER TIER',
    };
  }, [iqScore]);

  // Unique cryptographic verification serial
  const serialId = useMemo(() => {
    const cleanName = (userName || 'USER').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    const hash = Math.floor(100000 + Math.random() * 900000);
    return `IQ-${cleanName}-${new Date().getFullYear()}-${hash}`;
  }, [userName]);

  // High-Resolution 1200x800 Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 800;

    // 1. Deep Cyber Dark Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
    bgGrad.addColorStop(0, '#060913');
    bgGrad.addColorStop(0.5, '#0b1120');
    bgGrad.addColorStop(1, '#05070e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 800);

    // 2. Ambient Cyberpunk Glow Spheres (Shaffof Moviy, To'q Sariq, Oq)
    // Cyan glow on top-left
    const cyanAura = ctx.createRadialGradient(180, 140, 20, 180, 140, 380);
    cyanAura.addColorStop(0, 'rgba(0, 210, 255, 0.22)');
    cyanAura.addColorStop(1, 'rgba(0, 210, 255, 0)');
    ctx.fillStyle = cyanAura;
    ctx.fillRect(0, 0, 700, 500);

    // Deep Gold / Yellow glow on bottom-right
    const goldAura = ctx.createRadialGradient(1020, 660, 20, 1020, 660, 380);
    goldAura.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
    goldAura.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = goldAura;
    ctx.fillRect(500, 300, 700, 500);

    // Pure White center highlights
    const whiteAura = ctx.createRadialGradient(600, 400, 10, 600, 400, 260);
    whiteAura.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    whiteAura.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = whiteAura;
    ctx.fillRect(300, 200, 600, 400);

    // 3. Cyberpunk Geometric Grid
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 40; x < 1200; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, 760);
      ctx.stroke();
    }
    for (let y = 40; y < 800; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(1160, y);
      ctx.stroke();
    }

    // 4. Outer Dual Frame with Neon Corners
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 1120, 720);

    ctx.strokeStyle = badgeRank.accentColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(52, 52, 1096, 696);

    // Cyber Chamfered Corner Accents
    const cornerSize = 28;
    const corners = [
      [40, 40],
      [1160, 40],
      [40, 760],
      [1160, 760],
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = badgeRank.accentColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = badgeRank.accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx > 600 ? cx - cornerSize : cx, cy);
      ctx.lineTo(cx > 600 ? cx : cx + cornerSize, cy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy > 400 ? cy - cornerSize : cy);
      ctx.lineTo(cx, cy > 400 ? cy : cy + cornerSize);
      ctx.stroke();
    });

    // 5. Header Branding
    ctx.textAlign = 'center';

    // Academy Badge Pill
    ctx.fillStyle = 'rgba(0, 210, 255, 0.12)';
    ctx.fillRect(450, 78, 300, 32);
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(450, 78, 300, 32);

    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 12px Orbitron, monospace, sans-serif';
    ctx.fillText('IQ LEVEL UZ · OFFICIAL CERTIFICATION', 600, 99);

    // Main Certificate Title
    ctx.shadowColor = badgeRank.accentColor;
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Orbitron, monospace, sans-serif';
    ctx.fillText('RASMIY IQ SERTIFIKATI', 600, 160);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Ushbu rasmiy hujjat quyidagi ishtirokchining mantiqiy salohiyatini tasdiqlaydi:', 600, 195);

    // 6. User Name Presentation
    ctx.shadowColor = '#00d2ff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(userName || 'Mantiq Dahosi', 600, 268);
    ctx.shadowBlur = 0;

    // Neon Accent underline under Name
    const nameLineGrad = ctx.createLinearGradient(340, 288, 860, 288);
    nameLineGrad.addColorStop(0, 'transparent');
    nameLineGrad.addColorStop(0.5, badgeRank.accentColor);
    nameLineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = nameLineGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(320, 288);
    ctx.lineTo(880, 288);
    ctx.stroke();

    // 7. Middle Glass Showcase Card (IQ Score & Badge)
    const cardGrad = ctx.createLinearGradient(350, 330, 850, 500);
    cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
    cardGrad.addColorStop(1, 'rgba(8, 12, 22, 0.94)');
    ctx.fillStyle = cardGrad;
    ctx.fillRect(350, 325, 500, 170);

    ctx.strokeStyle = badgeRank.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(350, 325, 500, 170);

    // Score Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.fillText('INTELEKT KOEFFITSIYENTI (IQ SCORE)', 600, 360);

    // Score Value Big Glow
    ctx.shadowColor = badgeRank.accentColor;
    ctx.shadowBlur = 25;
    ctx.fillStyle = badgeRank.accentColor;
    ctx.font = 'bold 72px Orbitron, monospace, sans-serif';
    ctx.fillText(`${iqScore} IQ`, 600, 432);
    ctx.shadowBlur = 0;

    // Badge Title Strip
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`UNVON: "${badgeRank.badgeName}"`, 600, 474);

    // Subtitle Description
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${badgeRank.subtitle} · ${badgeRank.levelClass}`, 600, 528);

    // 8. Security Footers & Wax Seal
    // Left: Metadata & Crypto Verification
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`BERILGAN SANA: ${date}`, 80, 680);
    ctx.fillText(`VERIFIKATSIYA ID: ${serialId}`, 80, 705);
    ctx.fillText(`STATUS: HASH VERIFIED & BLOCK-LOCKED`, 80, 730);

    // Right: Issuer & Validation
    ctx.textAlign = 'right';
    ctx.fillStyle = badgeRank.accentColor;
    ctx.font = 'bold 14px Orbitron, sans-serif';
    ctx.fillText('IQ LEVEL UZ ACADEMY', 1120, 680);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('AI CYBER ENGINE v4.2 PRO', 1120, 705);
    ctx.fillText('RASMIY ELEKTRON MUHR BILAN TASDIQLANGAN', 1120, 730);

    // Center Golden Royal Wax Seal
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 690, 48, 0, Math.PI * 2);
    ctx.strokeStyle = badgeRank.accentColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(600, 690, 40, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = badgeRank.accentColor;
    ctx.font = 'bold 11px Orbitron, sans-serif';
    ctx.fillText(badgeRank.badgeName, 600, 686);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Orbitron, sans-serif';
    ctx.fillText('SEAL 2026', 600, 702);
    ctx.restore();
  }, [userName, iqScore, date, badgeRank, serialId]);

  // Download Handler (PNG)
  const handleSaveImage = () => {
    soundManager.playCyberClick();
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `IQ_Level_Uz_Sertifikat_${badgeRank.badgeName}_${userName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Telegram Story / Direct Share Handler
  const handleShareStory = () => {
    soundManager.playCyberClick();
    handleSaveImage(); // Auto saves high-res image for uploading to story
    const challengeText = encodeURIComponent(
      `🧠 Men IQ Level Uz da ${iqScore} ball to'plab rasmiy "${badgeRank.badgeName}" unvoniga ega bo'ldim! 👑\nSening mantiqiy darajang qanday? O'zingni sinab ko'r: https://t.me/IQLevelUzBot`
    );
    window.open(`https://t.me/share/url?url=https://t.me/IQLevelUzBot&text=${challengeText}`, '_blank');
  };

  // Copy Verification Link
  const handleCopyLink = () => {
    soundManager.playCyberClick();
    const link = `https://t.me/IQLevelUzBot?start=cert_${serialId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const content = (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl bg-slate-900/95 border border-cyan-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-display font-bold text-sm tracking-wide">
          <Award className="w-5 h-5 text-amber-400" />
          <span>RASMIY IQ SERTIFIKATI</span>
        </div>
        {onClose && (
          <button
            onClick={() => {
              soundManager.playCyberClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Canvas Live Certificate Preview */}
      <div className="mt-4 rounded-2xl overflow-hidden border border-amber-400/40 shadow-2xl bg-[#060913] flex justify-center p-1">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[380px] object-contain rounded-xl"
        />
      </div>

      {/* Certificate Owner Badge Strip */}
      <div className="mt-3.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Egasi: <strong className="text-white">{userName}</strong>
          </span>
        </div>
        <div className="font-mono font-bold flex items-center gap-1.5" style={{ color: badgeRank.accentColor }}>
          <span>{badgeRank.badgeIcon}</span>
          <span>{iqScore} IQ · {badgeRank.badgeName}</span>
        </div>
      </div>

      {/* Action Buttons: Save & Share */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleSaveImage}
          disabled={isGenerating}
          className="h-12 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{isGenerating ? 'Yuklanmoqda...' : 'Sertifikatni Saqlash (PNG)'}</span>
        </button>

        <button
          onClick={handleShareStory}
          className="h-12 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Telegram & Story'ga Ulashish</span>
        </button>
      </div>

      {/* Copy Verification Link */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
        <span>ID: {serialId}</span>
        <button
          onClick={handleCopyLink}
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Havola nusxalandi!' : 'Verifikatsiya havolasi'}</span>
        </button>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      {content}
    </div>
  );
};
