import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Zap, Share2, X, Check, Copy, HelpCircle,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { calculateWeekday } from '@/lib/doomsday';
import {
  getOrCreateUserStats, updateUserStats, hasCompletedDaily,
  saveDailyResult,
} from '@/lib/db';
import {
  dateSeed, generateSeededDates, getTodayKey, getTimeUntilNextDay,
  formatCountdown,
} from '@/lib/prng';
import type { AppView, Lang, Weekday, DailyResult } from '@/types';
import { WEEKDAY_ORDER, DAILY_QUESTION_COUNT } from '@/types';

interface DailySectionProps {
  onNavigate: (view: AppView) => void;
  lang: Lang;
}

export function DailySection({ onNavigate, lang }: DailySectionProps) {
  const { $t, $weekdaysShort } = useTranslation(lang);
  const [dates, setDates] = useState<Array<{ year: number; month: number; day: number; correct: Weekday }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [answers, setAnswers] = useState<DailyResult['answers']>([]);
  const [lastAnswer, setLastAnswer] = useState<{ correct: boolean; day: Weekday } | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCheat, setShowCheat] = useState(false);
  const [usedHelp, setUsedHelp] = useState(false);
  const [streak, setStreak] = useState(0);
  const [countdown, setCountdown] = useState('');

  const startTimeRef = useRef<number>(0);
  const weekdaysShort = $weekdaysShort();
  const todayKey = getTodayKey();

  // Load daily data
  useEffect(() => {
    const load = async () => {
      const done = await hasCompletedDaily(todayKey);
      setAlreadyDone(done);

      const stats = await getOrCreateUserStats();
      setStreak(stats.streakCount);

      // Generate seeded dates
      const seed = dateSeed(new Date());
      const generated = generateSeededDates(seed, DAILY_QUESTION_COUNT, 1800, 2399);
      const withCorrect = generated.map((d) => ({
        ...d,
        correct: calculateWeekday(d.year, d.month, d.day),
      }));
      setDates(withCorrect);
      startTimeRef.current = Date.now();
    };
    load();
  }, [todayKey]);

  // Countdown timer
  useEffect(() => {
    const update = () => setCountdown(formatCountdown(getTimeUntilNextDay()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const currentDate = dates[currentIndex];
  const totalTimeMs = answers.reduce((s, a) => s + a.timeMs, 0);

  const handleAnswer = async (day: Weekday) => {
    if (!currentDate || completed || lastAnswer) return;

    const timeMs = Date.now() - startTimeRef.current;
    const isCorrect = day === currentDate.correct;

    let state: 'correct' | 'incorrect' | 'correct_with_help' | 'incorrect_with_help';
    if (isCorrect && !usedHelp) state = 'correct';
    else if (isCorrect && usedHelp) state = 'correct_with_help';
    else if (!isCorrect && !usedHelp) state = 'incorrect';
    else state = 'incorrect_with_help';

    const newAnswer = {
      year: currentDate.year,
      month: currentDate.month,
      day: currentDate.day,
      correctAnswer: currentDate.correct,
      givenAnswer: day,
      state,
      timeMs,
      usedHelp,
    };

    setAnswers((prev) => [...prev, newAnswer]);
    setLastAnswer({ correct: isCorrect, day });

    // Move to next or complete
    if (currentIndex + 1 < DAILY_QUESTION_COUNT) {
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setLastAnswer(null);
        setUsedHelp(false);
        setShowCheat(false);
        startTimeRef.current = Date.now();
      }, isCorrect ? 500 : 1000);
    } else {
      // Complete
      setTimeout(async () => {
        const finalAnswers = [...answers, newAnswer];
        const totalTime = finalAnswers.reduce((s, a) => s + a.timeMs, 0);

        // Update streak
        const stats = await getOrCreateUserStats();
        const today = new Date().toISOString().split('T')[0];

        // Check if streak continues
        let newStreak = stats.streakCount;
        if (stats.lastCompletedDate) {
          const lastDate = new Date(stats.lastCompletedDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            newStreak = stats.streakCount + 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        await updateUserStats({
          ...stats,
          lastCompletedDate: today,
          streakCount: newStreak,
          bestStreak: Math.max(stats.bestStreak, newStreak),
          totalDailyCompleted: stats.totalDailyCompleted + 1,
        });

        await saveDailyResult({
          date: todayKey,
          answers: finalAnswers,
          totalTimeMs: totalTime,
          streak: newStreak,
        });

        setStreak(newStreak);
        setCompleted(true);
      }, isCorrect ? 500 : 1000);
    }
  };

  const toggleCheat = () => {
    if (!showCheat && !lastAnswer && !completed) {
      setUsedHelp(true);
    }
    setShowCheat((p) => !p);
  };

  // Generate share text
  const getShareText = useCallback((): string => {
    const today = new Date();
    const mnStr = (today.getMonth() + 1).toString().padStart(2, '0');
    const ddStr = today.getDate().toString().padStart(2, '0');
    const dateStr = lang === 'en' ? `${today.getFullYear()}-${mnStr}-${ddStr}` : `${ddStr}.${mnStr}.`;
    const correctCount = answers.filter((a) => a.state === 'correct' || a.state === 'correct_with_help').length;
    const squares = answers.map((a) => (a.state === 'correct' || a.state === 'correct_with_help' ? '\u25A0' : '\u25A1')).join(' ');
    const timeStr = (totalTimeMs / 1000).toFixed(1);

    return `Doomsday Daily ${dateStr}\n${$t('streakLabel')}: ${streak} \u2726\n${$t('dailyTime')}: ${timeStr}s\n${squares}\n${correctCount}/${DAILY_QUESTION_COUNT} ${$t('trainCorrect')}`;
  }, [answers, streak, totalTimeMs, $t]);

  const handleShare = async () => {
    const text = getShareText();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Doomsday Daily', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentDate && dates.length === 0) {
    return (
      <section className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section className="min-h-screen pt-32 pb-16 px-4 sm:px-6">
      <div className="section-container">
        {/* Back button */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => onNavigate('hero')} className="btn-back mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {$t('backToMenu')}
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <CalendarIcon />
            <span className="mono text-xs text-blue-400/70 tracking-[0.3em] uppercase">{$t('navDaily')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white">
            {$t('dailyTitle').split(' ').slice(0, -1).join(' ')} <span className="text-gradient font-medium">{$t('dailyTitle').split(' ').pop()}</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-2">{$t('dailySubtitle')}</p>
        </motion.div>

        {/* Streak badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-8">
          <div className="glass-strong rounded-full px-5 py-2 flex items-center gap-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-zinc-300">{$t('streakLabel')}: <span className="text-amber-400 font-bold mono">{streak}</span></span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs text-zinc-500">{streak === 1 ? $t('streakDay') : $t('streakDays')}</span>
          </div>
        </motion.div>

        {/* Already completed today */}
        {alreadyDone && !completed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card p-8 text-center mb-8"
          >
            <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl text-white font-medium mb-2">{$t('dailyComplete')}</h3>
            <p className="text-zinc-500 text-sm mb-4">{$t('dailyNext')}: {countdown}</p>
            <button onClick={() => setShowShare(true)} className="btn-glass flex items-center gap-2 mx-auto">
              <Share2 className="w-4 h-4" />
              {$t('dailyShare')}
            </button>
          </motion.div>
        )}

        {/* Active quiz */}
        {!alreadyDone && !completed && currentDate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-zinc-500">{$t('dailyProgress')}</span>
              <div className="flex gap-1">
                {Array.from({ length: DAILY_QUESTION_COUNT }, (_, i) => (
                  <div key={i}
                    className={`w-8 h-1.5 rounded-full transition-all ${
                      i < currentIndex ? 'bg-green-500/60' :
                      i === currentIndex ? 'bg-blue-500' : 'bg-white/[0.06]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-500 mono">{currentIndex + 1}/{DAILY_QUESTION_COUNT}</span>
            </div>

            {/* Question */}
            <div className="glass-card p-8 sm:p-12 mb-6 text-center relative">
              <AnimatePresence mode="wait">
                <motion.div key={currentIndex}
                  initial={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-xs text-zinc-500 mb-2 mono">{$t('step4Question')}</div>
                  <div className="text-4xl sm:text-5xl font-light text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                    {lang === 'en' ? (
                      <>
                        <span className="mono text-blue-400">{currentDate.month}</span>
                        <span className="text-zinc-600 mx-2">/</span>
                        <span className="mono text-blue-400">{currentDate.day}</span>
                        <span className="text-zinc-600 mx-2">/</span>
                        <span className="mono">{currentDate.year}</span>
                      </>
                    ) : (
                      <>
                        <span className="mono text-blue-400">{currentDate.day}</span>
                        <span className="text-zinc-600 mx-2">.</span>
                        <span className="mono text-blue-400">{currentDate.month}</span>
                        <span className="text-zinc-600 mx-2">.</span>
                        <span className="mono">{currentDate.year}</span>
                      </>
                    )}
                  </div>
                  {usedHelp && !lastAnswer && (
                    <div className="mt-2 text-xs text-amber-400/70">{$t('cheatSheetOpen')}</div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Cheat Sheet */}
            {showCheat && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="glass-card p-4 mb-4 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                  <div className="p-2 bg-white/[0.02] rounded-lg"><span className="text-zinc-500">Easy</span><p className="text-zinc-300 mt-0.5">4/4, 6/6, 8/8, 10/10, 12/12</p></div>
                  <div className="p-2 bg-white/[0.02] rounded-lg"><span className="text-zinc-500">9-to-5</span><p className="text-zinc-300 mt-0.5">5/9, 9/5, 7/11, 11/7</p></div>
                  <div className="p-2 bg-white/[0.02] rounded-lg"><span className="text-zinc-500">Special</span><p className="text-zinc-300 mt-0.5">3/14, 1/3 (1/4), 2/28 (29)</p></div>
                  <div className="p-2 bg-white/[0.02] rounded-lg"><span className="text-zinc-500">Formula</span><p className="text-zinc-300 mt-0.5 mono">yy/12 + yy%12 + (yy%12)/4</p></div>
                </div>
              </motion.div>
            )}

            {/* Day Selector */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
              {WEEKDAY_ORDER.map((day) => {
                const isCorrect = lastAnswer?.day === day && lastAnswer?.correct;
                const isWrong = lastAnswer?.day === day && !lastAnswer?.correct;
                const showCorrect = lastAnswer && !lastAnswer.correct && day === currentDate.correct;
                return (
                  <motion.button key={day} onClick={() => handleAnswer(day)} disabled={!!lastAnswer}
                    whileHover={!lastAnswer ? { scale: 1.1 } : {}}
                    whileTap={!lastAnswer ? { scale: 0.9 } : {}}
                    className={`btn-day ${isCorrect ? 'btn-day-correct' : ''} ${isWrong ? 'btn-day-wrong' : ''} ${showCorrect ? 'btn-day-highlight' : ''}`}
                  >
                    <span className="text-xs sm:text-sm">{weekdaysShort[day]}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center">
              <button onClick={toggleCheat} className={`btn-sm flex items-center gap-2 ${showCheat ? 'text-amber-400 border-amber-500/30' : ''}`}>
                {showCheat ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                {$t('cheatSheet')}
              </button>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {lastAnswer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mt-4 text-center p-3 rounded-xl ${lastAnswer.correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
                >
                  {lastAnswer.correct ? (
                    <span className="text-green-400 font-medium text-sm"><Check className="w-4 h-4 inline mr-1" />{$t('trainCorrect')}</span>
                  ) : (
                    <span className="text-red-400 text-sm">{$t('trainTheAnswerWas')} <span className="font-bold">{weekdaysShort[currentDate.correct]}</span></span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Completion screen */}
        {completed && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <Zap className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl text-white font-light mb-2">{$t('dailyComplete')}</h3>

            {/* Results grid */}
            <div className="flex items-center justify-center gap-3 my-6">
              {answers.map((a, i) => (
                <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                  a.state === 'correct' || a.state === 'correct_with_help'
                    ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  {a.state === 'correct' || a.state === 'correct_with_help' ? '\u2713' : '\u2717'}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 max-w-sm mx-auto">
              <div className="stat-card p-3">
                <span className="stat-value text-lg">{answers.filter((a) => a.state === 'correct' || a.state === 'correct_with_help').length}/{DAILY_QUESTION_COUNT}</span>
                <span className="stat-label">{$t('trainCorrect')}</span>
              </div>
              <div className="stat-card p-3">
                <span className="stat-value text-lg">{(totalTimeMs / 1000).toFixed(1)}s</span>
                <span className="stat-label">{$t('dailyTime')}</span>
              </div>
              <div className="stat-card p-3">
                <span className="stat-value text-lg text-amber-400">{streak}</span>
                <span className="stat-label">{$t('streakLabel')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={handleShare} className="btn-primary flex items-center gap-2">
                {copied ? <Copy className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied ? $t('shareCopied') : $t('dailyShare')}
              </button>
              <button onClick={() => onNavigate('hero')} className="btn-glass">
                {$t('backToMenu')}
              </button>
            </div>

            <p className="text-zinc-600 text-xs mt-6">{$t('dailyNext')}: {countdown}</p>
          </motion.div>
        )}

        {/* Share Modal */}
        <AnimatePresence>
          {showShare && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setShowShare(false)}
            >
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">{$t('shareTitle')}</h3>
                  <button onClick={() => setShowShare(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <pre className="glass p-4 rounded-xl text-sm text-zinc-300 mono whitespace-pre-wrap mb-4 overflow-auto max-h-48">
                  {getShareText()}
                </pre>
                <button onClick={handleShare} className="btn-primary w-full flex items-center justify-center gap-2">
                  {copied ? <Copy className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? $t('shareCopied') : $t('dailyShare')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
