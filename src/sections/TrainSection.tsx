import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Infinity as InfinityIcon, Pause, Play, RotateCcw, ArrowLeft, HelpCircle, X, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { calculateWeekday } from '@/lib/doomsday';
import { addAnswer, createSession } from '@/lib/db';
import type { AppView, Lang, TrainingMode, Weekday, CenturyFilter, TrainingStats } from '@/types';
import { WEEKDAY_ORDER, DEFAULT_CENTURY_FILTER, TIME_ATTACK_SECONDS } from '@/types';

const INITIAL_STATS: TrainingStats = {
  streak: 0, bestStreak: 0, totalCorrect: 0,
  totalQuestions: 0, accuracy: 0, avgTimeMs: 0, currentTimeMs: 0,
};

interface TrainSectionProps {
  onNavigate: (view: AppView) => void;
  lang: Lang;
}

export function TrainSection({ onNavigate, lang }: TrainSectionProps) {
  const { $t, $weekdaysShort } = useTranslation(lang);
  const [mode, setMode] = useState<TrainingMode>('endless');
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<TrainingStats>({ ...INITIAL_STATS });
  const [currentDate, setCurrentDate] = useState({ year: 2024, month: 1, day: 1 });
  const [correctDay, setCorrectDay] = useState<Weekday>(1);
  const [lastAnswer, setLastAnswer] = useState<{ correct: boolean; day: Weekday } | null>(null);
  const [dateKey, setDateKey] = useState(0);
  const [centuryFilter, setCenturyFilter] = useState<CenturyFilter>({ ...DEFAULT_CENTURY_FILTER });
  const [showCheat, setShowCheat] = useState(false);
  const [usedHelpThisQuestion, setUsedHelpThisQuestion] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_ATTACK_SECONDS);

  const startTimeRef = useRef<number>(0);
  const sessionIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const weekdaysShort = $weekdaysShort();

  const getAllowedCenturies = useCallback((): number[] => {
    const centuries: number[] = [];
    if (centuryFilter[1800]) centuries.push(1800);
    if (centuryFilter[1900]) centuries.push(1900);
    if (centuryFilter[2000]) centuries.push(2000);
    if (centuryFilter[2100]) centuries.push(2100);
    if (centuries.length === 0) return [1900, 2000];
    return centuries;
  }, [centuryFilter]);

  const generateNewDate = useCallback(() => {
    const allowed = getAllowedCenturies();
    const century = allowed[Math.floor(Math.random() * allowed.length)];
    const year = century + Math.floor(Math.random() * 100);
    const month = Math.floor(Math.random() * 12) + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const correct = calculateWeekday(year, month, day);
    setCurrentDate({ year, month, day });
    setCorrectDay(correct);
    setDateKey((k) => k + 1);
    startTimeRef.current = Date.now();
    setLastAnswer(null);
    setUsedHelpThisQuestion(false);
    setShowCheat(false);
  }, [getAllowedCenturies]);

  const startSession = async () => {
    setIsActive(true);
    setIsPaused(false);
    setStats({ ...INITIAL_STATS });
    setTimeLeft(TIME_ATTACK_SECONDS);
    generateNewDate();

    const id = await createSession({
      date: new Date().toISOString(),
      duration: 0, totalQuestions: 0, correctAnswers: 0, accuracy: 0, avgTimeMs: 0, mode,
    });
    sessionIdRef.current = id;

    if (mode === 'timeattack') {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // End session
            setIsActive(false);
            setIsPaused(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const toggleCheat = () => {
    if (!showCheat && isActive && !isPaused && !lastAnswer) {
      setUsedHelpThisQuestion(true);
    }
    setShowCheat((p) => !p);
  };

  const togglePause = () => {
    setIsPaused((p) => {
      if (p) startTimeRef.current = Date.now();
      return !p;
    });
  };

  const handleAnswer = async (day: Weekday) => {
    if (!isActive || isPaused || lastAnswer) return;

    const timeMs = Date.now() - startTimeRef.current;
    const isCorrect = day === correctDay;

    let state: 'correct' | 'incorrect' | 'correct_with_help' | 'incorrect_with_help';
    if (isCorrect && !usedHelpThisQuestion) state = 'correct';
    else if (isCorrect && usedHelpThisQuestion) state = 'correct_with_help';
    else if (!isCorrect && !usedHelpThisQuestion) state = 'incorrect';
    else state = 'incorrect_with_help';

    setStats((prev) => {
      const newCorrect = prev.totalCorrect + (isCorrect ? 1 : 0);
      const newTotal = prev.totalQuestions + 1;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const totalTime = prev.avgTimeMs * prev.totalQuestions + timeMs;
      return {
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalCorrect: newCorrect,
        totalQuestions: newTotal,
        accuracy: Math.round((newCorrect / newTotal) * 100),
        avgTimeMs: Math.round(totalTime / newTotal),
        currentTimeMs: timeMs,
      };
    });

    setLastAnswer({ correct: isCorrect, day });

    if (sessionIdRef.current !== null) {
      await addAnswer({
        sessionId: sessionIdRef.current,
        generatedDate: `${currentDate.year}-${currentDate.month}-${currentDate.day}`,
        generatedYear: currentDate.year, generatedMonth: currentDate.month, generatedDay: currentDate.day,
        givenAnswer: day, correctAnswer: correctDay, timeMs, state,
        century: Math.floor(currentDate.year / 100) * 100, usedHelp: usedHelpThisQuestion,
      });
    }

    setTimeout(() => generateNewDate(), isCorrect ? 500 : 1000);
  };

  const endSession = () => {
    setIsActive(false);
    setIsPaused(false);
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
  };

  useEffect(() => {
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, []);

  return (
    <section className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="section-container">
        {!isActive && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => onNavigate('hero')} className="btn-back mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {$t('backToMenu')}
          </motion.button>
        )}

        {!isActive && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="mono text-xs text-blue-400/70 tracking-[0.3em] uppercase">{$t('navTrain')}</span>
            <h2 className="text-3xl sm:text-4xl font-light text-white mt-3 mb-4">
              {$t('trainTitle').split(' ').slice(0, -1).join(' ')} <span className="text-gradient font-medium">{$t('trainTitle').split(' ').pop()}</span>
            </h2>
          </motion.div>
        )}

        {/* Century Filter */}
        {!isActive && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h4 className="text-xs text-zinc-500 uppercase tracking-widest mb-3 text-center">{$t('trainFilterCenturies')}</h4>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {([1800, 1900, 2000, 2100] as const).map((c) => (
                <button key={c}
                  onClick={() => setCenturyFilter((prev) => ({ ...prev, [c]: !prev[c] }))}
                  className={`px-4 py-2 rounded-full text-sm transition-all border ${
                    centuryFilter[c] ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.04]'
                  }`}
                >
                  {c.toString().slice(0, 2)}00s
                </button>
              ))}
              <button onClick={() => setCenturyFilter({ 1800: true, 1900: true, 2000: true, 2100: true })}
                className="px-4 py-2 rounded-full text-sm bg-white/[0.02] border border-white/[0.06] text-zinc-500 hover:bg-white/[0.04] transition-all"
              >
                {$t('trainAll')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Mode Selection */}
        {!isActive && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <button onClick={() => setMode('endless')}
              className={`glass-card p-6 text-left transition-all ${mode === 'endless' ? 'border-blue-500/30 glow-blue' : ''}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mode === 'endless' ? 'bg-blue-500/20' : 'bg-white/[0.05]'}`}>
                  <InfinityIcon className={`w-5 h-5 ${mode === 'endless' ? 'text-blue-400' : 'text-zinc-500'}`} />
                </div>
                <div>
                  <h3 className={`font-medium ${mode === 'endless' ? 'text-white' : 'text-zinc-400'}`}>{$t('trainEndless')}</h3>
                  <p className="text-xs text-zinc-600">{$t('trainEndlessDesc')}</p>
                </div>
              </div>
            </button>
            <button onClick={() => setMode('timeattack')}
              className={`glass-card p-6 text-left transition-all ${mode === 'timeattack' ? 'border-blue-500/30 glow-blue' : ''}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mode === 'timeattack' ? 'bg-blue-500/20' : 'bg-white/[0.05]'}`}>
                  <Zap className={`w-5 h-5 ${mode === 'timeattack' ? 'text-blue-400' : 'text-zinc-500'}`} />
                </div>
                <div>
                  <h3 className={`font-medium ${mode === 'timeattack' ? 'text-white' : 'text-zinc-400'}`}>{$t('trainTimeAttack')}</h3>
                  <p className="text-xs text-zinc-600">{$t('trainTimeAttackDesc')}</p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {!isActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <button onClick={startSession} className="btn-primary text-lg px-12 py-4">
              {mode === 'endless' ? $t('trainStartEndless') : $t('trainStartTimeAttack')}
            </button>
          </motion.div>
        )}

        {/* Active Game */}
        <AnimatePresence>
          {isActive && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="stat-card"><span className="stat-label">{$t('trainStreak')}</span><span className="stat-value">{stats.streak}</span></div>
                <div className="stat-card"><span className="stat-label">{$t('trainAccuracy')}</span><span className="stat-value">{stats.accuracy}%</span></div>
                <div className="stat-card"><span className="stat-label">{$t('trainAvgTime')}</span><span className="stat-value">{(stats.avgTimeMs / 1000).toFixed(1)}s</span></div>
                <div className="stat-card"><span className="stat-label">{$t('trainBestStreak')}</span><span className="stat-value">{stats.bestStreak}</span></div>
              </div>

              {/* Timer */}
              {mode === 'timeattack' && (
                <div className="text-center mb-4">
                  <span className={`text-2xl font-bold mono ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`}>{timeLeft}s</span>
                </div>
              )}

              {/* Date Display */}
              <div className="glass-card p-8 sm:p-12 mb-6 text-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div key={dateKey}
                    initial={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                    transition={{ duration: 0.25 }}
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
                    {usedHelpThisQuestion && !lastAnswer && (
                      <div className="mt-2 text-xs text-amber-400/70">{$t('cheatSheetOpen')}</div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                  {isPaused && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-10"
                    >
                      <div className="text-center">
                        <Pause className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                        <p className="text-xl text-white font-medium">{$t('trainPaused')}</p>
                        <button onClick={togglePause} className="btn-glass mt-4 flex items-center gap-2 mx-auto">
                          <Play className="w-4 h-4" />
                          {$t('trainResume')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cheat Sheet */}
              <AnimatePresence>
                {showCheat && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="glass-card p-4 mb-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-400">
                      {[
                        ['4/4, 6/6, 8/8, 10/10, 12/12', 'Easy'],
                        ['5/9, 9/5, 7/11, 11/7', '9-to-5'],
                        ['3/14, 1/3 (1/4), 2/28 (29)', 'Special'],
                        ['yy/12 + yy%12 + (yy%12)/4', 'Formula'],
                      ].map(([text, label], i) => (
                        <div key={i} className="p-2 bg-white/[0.02] rounded-lg">
                          <span className="text-zinc-500 text-[10px]">{label}</span>
                          <p className="text-zinc-300 mt-0.5">{text}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Day Selector */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
                {WEEKDAY_ORDER.map((day) => {
                  const isCorrect = lastAnswer?.day === day && lastAnswer?.correct;
                  const isWrong = lastAnswer?.day === day && !lastAnswer?.correct;
                  const showCorrect = lastAnswer && !lastAnswer.correct && day === correctDay;
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
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button onClick={toggleCheat} className={`btn-sm flex items-center gap-2 ${showCheat ? 'text-amber-400 border-amber-500/30' : ''}`}>
                  {showCheat ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                  {$t('cheatSheet')}
                </button>
                <button onClick={togglePause} className="btn-sm flex items-center gap-2">
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? $t('trainResume') : $t('trainPause')}
                </button>
                <button onClick={() => { endSession(); startSession(); }} className="btn-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  {$t('trainRestart')}
                </button>
                <button onClick={endSession} className="text-zinc-600 hover:text-red-400 text-sm transition-colors px-4 py-2">
                  {$t('trainEnd')}
                </button>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {lastAnswer && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`mt-4 text-center p-3 rounded-xl ${lastAnswer.correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
                  >
                    {lastAnswer.correct ? (
                      <span className="text-green-400 font-medium text-sm">
                        <Check className="w-4 h-4 inline mr-1" />
                        {$t('trainCorrect')}! ({(stats.currentTimeMs / 1000).toFixed(1)}s)
                        {usedHelpThisQuestion && <span className="text-amber-400/60 ml-2 text-xs">(with help)</span>}
                      </span>
                    ) : (
                      <span className="text-red-400 text-sm">
                        {$t('trainTheAnswerWas')} <span className="font-bold">{weekdaysShort[correctDay]}</span>
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
