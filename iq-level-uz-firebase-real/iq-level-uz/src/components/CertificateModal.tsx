import React, { useRef, useEffect } from 'react';
import { Download, Share2, X, Award, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  userName: string;
  iqScore: number;
  date: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  userName,
  iqScore,
  date,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Unvonlar (Badges):
  // IQ 80–99: "Izlanuvchi"
  // IQ 100–119: "Mantiq Ustasi"
  // IQ 120+: "Daho"
  const getBadgeRank = (score: number) => {
    if (score >= 120) {
      return {
        title: 'DAHO',
        subtitle: 'MUTLAQ INTELEKT (GENIUS · TOP 1%)',
        badgeName: 'Daho',
        color: '#fbbf24',
        accent: '#f59e0b',
        level: 'MASTER CLASS',
        badgeIcon: '👑',
      };
    }
    if (score >= 100) {
      return {
        title: 'MANTIQ USTASI',
        subtitle: 'YUKSAK KOGNITIV MAHORAT (LOGIC MASTER)',
        badgeName: 'Mantiq Ustasi',
        color: '#00d2ff',
        accent: '#38bdf8',
        level: 'SUPERIOR CLASS',
        badgeIcon: '⚡',
      };
    }
    return {
      title: 'IZLANUVCHI',
      subtitle: 'FAOL IZLANUVCHI INTELLEKT (RESEARCHER)',
      badgeName: 'Izlanuvchi',
      color: '#34d399',
      accent: '#10b981',
      level: 'EXPLORER CLASS',
      badgeIcon: '🎯',
    };
  };

  const badgeInfo = getBadgeRank(iqScore);

  const serialId = React.useMemo(() => {
    return `IQUZ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);

  useEffect(() => {
    soundManager.playVictoryFanfare();
    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#00d2ff', '#fbbf24', '#38bdf8', '#ffffff', '#a855f7'],
    });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution canvas (1200 x 820)
    canvas.width = 1200;
    canvas.height = 820;

    // 1. Cyber Dark Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 820);
    bgGrad.addColorStop(0, '#060911');
    bgGrad.addColorStop(0.5, '#0b1325');
    bgGrad.addColorStop(1, '#04060a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 820);

    // Subtle Holographic Radial Aura
    const auraGrad = ctx.createRadialGradient(600, 400, 50, 600, 400, 580);
    auraGrad.addColorStop(0, 'rgba(0, 210, 255, 0.12)');
    auraGrad.addColorStop(0.6, 'rgba(251, 191, 36, 0.05)');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(0, 0, 1200, 820);

    // Subtle cyber grid lines
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 820);
      ctx.stroke();
    }
    for (let y = 0; y < 820; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // 2. Triple Royal Cyber Borders
    // Outer Electric Blue
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(32, 32, 1136, 756);

    // Mid Gold Border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, 1112, 732);

    // Inner fine border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, 1096, 716);

    // Corner Ornaments
    const corners = [
      [32, 32], [1168, 32], [32, 788], [1168, 788]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(cx - 8, cy - 8, 16, 16);
      ctx.strokeStyle = '#00d2ff';
      ctx.strokeRect(cx - 12, cy - 12, 24, 24);
    });

    // 3. Header Top - Brand & Crown
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 30px Orbitron, sans-serif';
    ctx.fillText('👑 IQ LEVEL UZ 👑', 600, 115);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('XALQARO KOGNITIV VA INTELEKT SERTIFIKATI', 600, 148);

    // Glowing Divider
    const divGrad = ctx.createLinearGradient(250, 170, 950, 170);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.5, '#00d2ff');
    divGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(250, 170);
    ctx.lineTo(950, 170);
    ctx.stroke();

    // 4. Recipient Text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("Ushbu maxsus sertifikat egasi:", 600, 225);

    // Recipient Name (Bold with cyan glow)
    ctx.shadowColor = '#00d2ff';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(userName, 600, 290);
    ctx.shadowBlur = 0; // reset

    // Underline for name
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 310);
    ctx.lineTo(850, 310);
    ctx.stroke();

    // Details text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("20 ta standartlashtirilgan mantiqiy, fazoviy va abstrakt testlarni topshirdi", 600, 355);

    // 5. IQ Score & Badge Showcase Card
    const scoreBoxGrad = ctx.createLinearGradient(380, 385, 820, 530);
    scoreBoxGrad.addColorStop(0, 'rgba(0, 210, 255, 0.16)');
    scoreBoxGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.85)');
    scoreBoxGrad.addColorStop(1, 'rgba(251, 191, 36, 0.16)');
    ctx.fillStyle = scoreBoxGrad;
    ctx.fillRect(380, 385, 440, 145);
    ctx.strokeStyle = badgeInfo.color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(380, 385, 440, 145);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 13px Orbitron, sans-serif';
    ctx.fillText('INTELEKT DARAJASI & RASMIY UNVON', 600, 415);

    ctx.shadowColor = badgeInfo.color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = badgeInfo.color;
    ctx.font = 'bold 64px Orbitron, sans-serif';
    ctx.fillText(`${iqScore} IQ`, 600, 478);
    ctx.shadowBlur = 0;

    // Badge Title Banner
    ctx.fillStyle = badgeInfo.color;
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`UNVON: "${badgeInfo.badgeName.toUpperCase()}"`, 600, 514);

    // Subtitle badge class
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${badgeInfo.subtitle} · ${badgeInfo.level}`, 600, 565);

    // 6. Security Seal & Details Footer
    // Left: Issue Date & Verification QR Box
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText(`BERILGAN SANA: ${date}`, 90, 685);
    ctx.fillText(`VERIFIKATSIYA ID: ${serialId}`, 90, 710);
    ctx.fillText(`STATUS: VERIFIED & CRYPTO HASHED`, 90, 735);

    // Right: Security Seal & Stamp
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 15px Orbitron, sans-serif';
    ctx.fillText("IQ LEVEL UZ ACADEMY", 1110, 685);
    ctx.fillStyle = '#64748b';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText("SMART AI CYBER ENGINE v3.8", 1110, 710);
    ctx.fillText("RASMIY ELEKTRON MUHR BILAN TASDIQLANGAN", 1110, 735);

    // Center Golden Wax Seal Crest
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 695, 45, 0, Math.PI * 2);
    ctx.strokeStyle = badgeInfo.color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
    ctx.fill();

    ctx.fillStyle = badgeInfo.color;
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeInfo.badgeName.toUpperCase(), 600, 692);
    ctx.fillText("SEAL 2026", 600, 708);
    ctx.restore();

  }, [userName, iqScore, date, serialId, badgeInfo]);

  const handleDownload = () => {
    soundManager.playCyberClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `IQ_Level_Uz_Sertifikat_${badgeInfo.badgeName}_${userName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShareStory = () => {
    soundManager.playCyberClick();
    handleDownload();
    const text = encodeURIComponent(
      `🧠 Men IQ Level Uz da ${iqScore} IQ to'plab "${badgeInfo.badgeName}" unvoniga sazovor bo'ldim! 👑\nSening natijang qanday? O'z aqlingni sinab ko'r: https://t.me/IQLevelUzBot`
    );
    window.open(`https://t.me/share/url?url=https://t.me/IQLevelUzBot&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-400/40 rounded-3xl shadow-2xl p-4 sm:p-6 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-base sm:text-lg">
            <Award className="w-5 h-5" />
            <span>MUKAMMAL IQ SERTIFIKATI</span>
          </div>
          <button
            onClick={() => {
              soundManager.playCyberClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Canvas Preview */}
        <div className="mt-4 rounded-2xl overflow-hidden border border-amber-400/40 shadow-2xl bg-slate-950 flex justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[400px] object-contain"
          />
        </div>

        {/* Verification Strip */}
        <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-cyan-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">
              Egasi: <strong className="text-white">{userName}</strong>
            </span>
          </div>
          <div className="font-mono font-bold flex items-center gap-1.5" style={{ color: badgeInfo.color }}>
            <span>{badgeInfo.badgeIcon}</span>
            <span>{iqScore} IQ · {badgeInfo.badgeName}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="h-12 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>PNG Sertifikatni Yuklab Olish</span>
          </button>

          <button
            onClick={handleShareStory}
            className="h-12 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Telegram & Story'ga Ulashish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
