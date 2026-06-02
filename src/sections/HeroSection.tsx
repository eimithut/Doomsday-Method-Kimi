import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, CalendarDays, Zap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getOrCreateUserStats, hasCompletedDaily } from '@/lib/db';
import { getTodayKey } from '@/lib/prng';
import type { AppView, Lang } from '@/types';

interface HeroSectionProps {
  onNavigate: (view: AppView) => void;
  lang: Lang;
}

const FLOATING_SYMBOLS = ['\u03C0', '\u2211', '\u221A', '\u00F7', '\u00D7', '\u00B1', '\u221E', '\u222B', '\u2202', '\u2248', '\u2260', '\u2264'];

export function HeroSection({ onNavigate, lang }: HeroSectionProps) {
  const { $t } = useTranslation(lang);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streak, setStreak] = useState(0);
  const [dailyDone, setDailyDone] = useState(false);

  // Load streak + daily status
  useEffect(() => {
    const load = async () => {
      const stats = await getOrCreateUserStats();
      setStreak(stats.streakCount);
      const done = await hasCompletedDaily(getTodayKey());
      setDailyDone(done);
    };
    load();
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; symbol: string;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles.length = 0;
      const count = Math.min(25, Math.floor(window.innerWidth / 50));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: 12 + Math.random() * 18,
          opacity: 0.04 + Math.random() * 0.12,
          symbol: FLOATING_SYMBOLS[Math.floor(Math.random() * FLOATING_SYMBOLS.length)],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;

        ctx.font = `${p.size}px "Space Grotesk"`;
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, p.x, p.y);
      });

      // Connecting lines
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.025 * (1 - dist / 200)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => { resize(); createParticles(); });
    return () => { cancelAnimationFrame(animId); };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-x-hidden pt-40 pb-20 mt-4">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.03)_0%,_transparent_70%)]" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto w-full">
        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <span className="mono text-xs text-blue-400/70 tracking-[0.3em] uppercase">
            {$t('heroEyebrow')}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-light text-white mb-6 leading-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          {$t('heroTitle').split('.')[0]}
          <span className="text-gradient font-medium">.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed"
        >
          {$t('heroSubtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <button onClick={() => onNavigate('learn')} className="btn-primary">
            {$t('heroCtaLesson')}
          </button>
          <button onClick={() => onNavigate('train')} className="btn-glass">
            {$t('heroCtaTrain')}
          </button>
        </motion.div>

        {/* Daily Challenge Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-10"
        >
          <button
            onClick={() => onNavigate('daily')}
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 ${
              dailyDone
                ? 'glass border-green-500/30 text-green-400/80'
                : 'glass border-amber-500/30 text-amber-400/80 hover:border-amber-500/50 animate-pulse-glow'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-sm font-medium">{$t('heroDaily')}</span>
            {!dailyDone && (
              <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" />
                {$t('dailyNew')}
              </span>
            )}
            {dailyDone && (
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                Done
              </span>
            )}
          </button>
        </motion.div>

        {/* Streak + Quick stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Streak Counter */}
          {streak > 0 && (
            <div className="glass-strong rounded-full px-5 py-2 flex items-center gap-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-zinc-300">
                {$t('streakLabel')}: <span className="text-amber-400 font-bold mono">{streak}</span>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-xs text-zinc-500">{streak === 1 ? $t('streakDay') : $t('streakDays')}</span>
            </div>
          )}

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-8 text-zinc-600 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>{$t('qsSteps')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>{$t('qsPractice')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>{$t('qsTracking')}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-zinc-600"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
