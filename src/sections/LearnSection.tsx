import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Lightbulb, Calendar, Hash, Award, ArrowLeft, HelpCircle, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import {
  getCenturyAnchor, getYearDoomsday, getMonthDoomsday, calculateWeekday,
  isLeapYear, COMMON_CENTURY_ANCHORS,
} from '../lib/doomsday';
import type { AppView, Lang, LearnStep } from '../types';

interface LearnSectionProps {
  onNavigate: (view: AppView) => void;
  lang: Lang;
}

const TOTAL_STEPS = 4;

export function LearnSection({ onNavigate, lang }: LearnSectionProps) {
  const { $t } = useTranslation(lang);
  const [step, setStep] = useState<LearnStep>(0);
  const [direction, setDirection] = useState(1);
  const [showCheat, setShowCheat] = useState(false);

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) { setDirection(1); setStep((prev) => (prev + 1) as LearnStep); }
  };
  const goPrev = () => {
    if (step > 0) { setDirection(-1); setStep((prev) => (prev - 1) as LearnStep); }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  const stepIcons = [Calendar, Lightbulb, Hash, Award];
  const stepTitles = [$t('step1Title'), $t('step2Title'), $t('step3Title'), $t('step4Title')];

  return (
    <section className="min-h-screen pt-32 pb-16 px-4 sm:px-6">
      <div className="section-container">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => onNavigate('hero')}
          className="btn-back mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {$t('backToMenu')}
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="mono text-xs text-blue-400/70 tracking-[0.3em] uppercase">{$t('navLearn')}</span>
          <h2 className="text-3xl sm:text-4xl font-light text-white mt-3 mb-4">
            {$t('learnTitle').split(' ').slice(0, -1).join(' ')} <span className="text-gradient font-medium">{$t('learnTitle').split(' ').pop()}</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm">{$t('learnSubtitle')}</p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => { setDirection(i > step ? 1 : -1); setStep(i as LearnStep); }}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    i === step ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400' :
                    i < step ? 'bg-white/[0.04] border border-white/[0.08] text-zinc-400' :
                    'bg-transparent border border-transparent text-zinc-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{stepTitles[i]}</span>
                </button>
                {i < TOTAL_STEPS - 1 && <ChevronRight className="w-4 h-4 text-zinc-700" />}
              </div>
            );
          })}
        </div>

        {/* Cheat Sheet Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCheat(!showCheat)}
            className={`btn-sm flex items-center gap-2 ${showCheat ? 'text-amber-400 border-amber-500/30' : ''}`}
          >
            {showCheat ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
            {$t('cheatSheet')}
          </button>
        </div>

        {/* Cheat Sheet Content */}
        <AnimatePresence>
          {showCheat && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <CheatSheetContent lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <div className="relative min-h-[420px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              {step === 0 && <Step1AnchorDays lang={lang} />}
              {step === 1 && <Step2CenturyAnchor lang={lang} />}
              {step === 2 && <Step3YearCalculation lang={lang} />}
              {step === 3 && <Step4FinalCalculation lang={lang} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={goPrev} disabled={step === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
              step === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            {$t('learnPrev')}
          </button>
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-blue-500 w-6' : 'bg-zinc-700'}`} />
            ))}
          </div>
          <button onClick={goNext} disabled={step === TOTAL_STEPS - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
              step === TOTAL_STEPS - 1 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {$t('learnNext')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Cheat Sheet ──────────────────────────────────────────────────

function CheatSheetContent({ lang }: { lang: Lang }) {
  const { $t, $weekdays } = useTranslation(lang);
  const wdays = $weekdays();

  return (
    <div className="cheat-sheet-panel mb-6">
      <h4 className="text-sm text-amber-400/80 font-medium mb-3 flex items-center gap-2">
        <Lightbulb className="w-4 h-4" />
        {$t('cheatSheet')}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-400">
        <div>
          <p className="text-zinc-300 font-medium mb-1">{$t('step1Title')}</p>
          {lang === 'en' ? (
            <>
              <p>4/4, 6/6, 8/8, 10/10, 12/12</p>
              <p>5/9, 9/5, 7/11, 11/7</p>
              <p>3/14 ({'\u03A0'}), 1/3 (1/4), 2/28 (2/29)</p>
            </>
          ) : (
            <>
              <p>4.4., 6.6., 8.8., 10.10., 12.12.</p>
              <p>9.5., 5.9., 11.7., 7.11.</p>
              <p>14.3. ({'\u03A0'}), 3.1. (4.1.), 28.2. (29.2.)</p>
            </>
          )}
        </div>
        <div>
          <p className="text-zinc-300 font-medium mb-1">{$t('step2Title')}</p>
          <p>1800s: {wdays[5]}, 1900s: {wdays[3]}</p>
          <p>2000s: {wdays[2]}, 2100s: {wdays[0]}</p>
        </div>
        <div>
          <p className="text-zinc-300 font-medium mb-1">{$t('step3Title')}</p>
          <p className="mono">yy/12 + yy%12 + (yy%12)/4 + anchor</p>
        </div>
        <div>
          <p className="text-zinc-300 font-medium mb-1">{$t('step4Title')}</p>
          <p>{$t('step4Desc')}</p>
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Anchor Days ──────────────────────────────────────────

function Step1AnchorDays({ lang }: { lang: Lang }) {
  const { $t } = useTranslation(lang);
  const [selectedMonth, setSelectedMonth] = useState(4);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();

  const easyMonths = [4, 6, 8, 10, 12];
  const workMonths = [5, 9, 7, 11];

  const mnemonics: Record<number, string> = {
    1: `Jan 3 (${$t('step1Leap')}: 4)`,
    2: `Feb 28 (${$t('step1Leap')}: 29)`,
    3: lang === 'en' ? `3/14 - ${($t as any)('mnemonics')['3/14']}` : `14.3. - ${($t as any)('mnemonics')['3/14']}`,
    4: ($t as any)('mnemonics')['4/4'],
    5: ($t as any)('mnemonics')['5/9'],
    6: ($t as any)('mnemonics')['6/6'],
    7: ($t as any)('mnemonics')['7/11'],
    8: ($t as any)('mnemonics')['8/8'],
    9: ($t as any)('mnemonics')['9/5'],
    10: ($t as any)('mnemonics')['10/10'],
    11: ($t as any)('mnemonics')['11/7'],
    12: ($t as any)('mnemonics')['12/12'],
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <h3 className="text-lg font-medium text-white mb-2">{$t('step1Title')}</h3>
      <p className="text-zinc-400 text-sm mb-6">{$t('step1Desc')}</p>

      <div className="mb-6">
        <h4 className="text-xs text-blue-400/70 uppercase tracking-widest mb-3">{$t('step1Easy')}</h4>
        <div className="grid grid-cols-5 gap-2">
          {easyMonths.map((m) => (
            <button key={m} onClick={() => { setSelectedMonth(m); setQuizAnswer(null); }}
              className={`p-3 rounded-xl border transition-all text-center ${
                selectedMonth === m ? 'bg-blue-500/10 border-blue-500/30 glow-blue' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
              }`}
            >
              <div className="text-base font-bold text-white mono">{m}/{m}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-xs text-blue-400/70 uppercase tracking-widest mb-3">{$t('step1Work')}</h4>
        <div className="grid grid-cols-4 gap-2">
          {workMonths.map((m) => (
            <button key={m} onClick={() => { setSelectedMonth(m); setQuizAnswer(null); }}
              className={`p-3 rounded-xl border transition-all text-center ${
                selectedMonth === m ? 'bg-blue-500/10 border-blue-500/30 glow-blue' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
              }`}
            >
              <div className="text-base font-bold text-white mono">{m}/{getMonthDoomsday(m, currentYear)}</div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selectedMonth} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="glass p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500/70 flex-shrink-0" />
            <p className="text-sm text-zinc-300">{$t('step1Mnemonic')}{mnemonics[selectedMonth]}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Micro Quiz */}
      <div className="mt-6 pt-6 border-t border-white/[0.06]">
        <button onClick={() => setQuizMode(!quizMode)} className="text-sm text-blue-400/70 hover:text-blue-400 transition-colors mb-4">
          {quizMode ? 'Hide Quiz' : 'Quick Check'}
        </button>
        <AnimatePresence>
          {quizMode && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-zinc-400 mb-3">What is the anchor date for month {selectedMonth}?</p>
              <div className="flex gap-2 flex-wrap">
                {[getMonthDoomsday(selectedMonth, currentYear), getMonthDoomsday(selectedMonth, currentYear) + 1, getMonthDoomsday(selectedMonth, currentYear) - 1].map((d, i) => (
                  <button key={i}
                    onClick={() => setQuizAnswer(d)}
                    className={`px-4 py-2 rounded-lg border text-sm mono transition-all ${
                      quizAnswer === d
                        ? d === getMonthDoomsday(selectedMonth, currentYear) ? 'bg-green-500/15 border-green-500/40 text-green-400' : 'bg-red-500/15 border-red-500/40 text-red-400'
                        : 'bg-white/[0.02] border-white/[0.08] text-zinc-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    {selectedMonth}/{d}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Step 2: Century Anchor ───────────────────────────────────────

function Step2CenturyAnchor({ lang }: { lang: Lang }) {
  const { $t, $weekdays } = useTranslation(lang);
  const [selectedCentury, setSelectedCentury] = useState(2000);
  const wdays = $weekdays();

  const centuries = [1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300];

  return (
    <div className="glass-card p-6 sm:p-8">
      <h3 className="text-lg font-medium text-white mb-2">{$t('step2Title')}</h3>
      <p className="text-zinc-400 text-sm mb-6">{$t('step2Desc')}</p>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
        {centuries.map((c) => (
          <button key={c} onClick={() => setSelectedCentury(c)}
            className={`p-3 rounded-xl border transition-all text-center ${
              selectedCentury === c ? 'bg-blue-500/10 border-blue-500/30 glow-blue' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
            }`}
          >
            <div className="text-sm font-bold text-white mono">{c.toString().slice(0, 2)}</div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selectedCentury} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="glass p-5 rounded-xl text-center"
        >
          <div className="text-xs text-zinc-500 mb-1">{$t('step2Result')} {selectedCentury}s</div>
          <div className="text-3xl font-bold text-gradient mono mb-1">
            {wdays[COMMON_CENTURY_ANCHORS[selectedCentury]?.anchor ?? 0]}
          </div>
          <div className="text-xs text-zinc-600 mono">Code: {getCenturyAnchor(selectedCentury)}</div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <p className="text-xs text-zinc-500 mono">{$t('step2Formula')}: (5 x (century mod 4) + 2) mod 7</p>
      </div>
    </div>
  );
}

// ── Step 3: Year Calculation ─────────────────────────────────────

function Step3YearCalculation({ lang }: { lang: Lang }) {
  const { $t, $weekdays } = useTranslation(lang);
  const [yy, setYy] = useState(24);
  const century = 2000;
  const year = century + yy;
  const wdays = $weekdays();

  const a = Math.floor(yy / 12);
  const b = yy % 12;
  const c = Math.floor(b / 4);
  const sum = a + b + c;
  const centuryAnchor = getCenturyAnchor(century);
  const doomsday = getYearDoomsday(year);

  return (
    <div className="glass-card p-6 sm:p-8">
      <h3 className="text-lg font-medium text-white mb-2">{$t('step3Title')}</h3>
      <p className="text-zinc-400 text-sm mb-6">{$t('step3Desc')}</p>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-zinc-500">{$t('step3Year')}: {century} + </span>
          <span className="text-xl font-bold text-blue-400 mono">{yy.toString().padStart(2, '0')}</span>
          <span className="text-xs text-zinc-500">= {year}</span>
        </div>
        <input type="range" min="0" max="99" value={yy}
          onChange={(e) => setYy(parseInt(e.target.value))}
          className="w-full h-2 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-zinc-600 mt-1 mono">
          <span>00</span><span>25</span><span>50</span><span>75</span><span>99</span>
        </div>
      </div>

      <div className="space-y-2">
        {[
          { label: 'Step 1', text: `${yy} / 12 = `, value: a, note: $t('step3Quotient') },
          { label: 'Step 2', text: `${yy} mod 12 = `, value: b, note: $t('step3Remainder') },
          { label: 'Step 3', text: `${b} / 4 = `, value: c, note: $t('step3Div4') },
          { label: $t('step3Sum'), text: `${a} + ${b} + ${c} = `, value: sum, note: '' },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
            <span className="text-[10px] text-blue-400/60 mono w-14">{step.label}</span>
            <span className="text-zinc-300 text-sm mono">{step.text}</span>
            <span className="text-white font-bold mono">{step.value}</span>
            {step.note && <span className="text-zinc-600 text-xs">({step.note})</span>}
          </div>
        ))}

        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-500/[0.05] border border-blue-500/15">
          <span className="text-[10px] text-blue-400 mono w-14">Result</span>
          <span className="text-zinc-300 text-sm mono">{sum} + anchor = </span>
          <span className="text-blue-400 font-bold mono">{(sum + centuryAnchor) % 7}</span>
          <span className="text-zinc-600 text-xs">mod 7</span>
        </div>

        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/15 text-center">
          <span className="text-xs text-zinc-400">{$t('step2Result')} {year} {$t('step2Is')} </span>
          <span className="text-lg font-bold text-blue-400 mono ml-1">{wdays[doomsday]}</span>
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Final Calculation ────────────────────────────────────

function Step4FinalCalculation({ lang }: { lang: Lang }) {
  const { $t, $weekdays, $formatDate } = useTranslation(lang);
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(7);
  const [day, setDay] = useState(15);

  const wdays = $weekdays();
  const doomsday = getYearDoomsday(year);
  const monthDoomsday = getMonthDoomsday(month, year);
  const result = calculateWeekday(year, month, day);
  const diff = day - monthDoomsday;
  const maxDay = new Date(year, month, 0).getDate();
  const leap = isLeapYear(year);

  const randomize = () => {
    const rYear = 1900 + Math.floor(Math.random() * 200);
    const rMonth = Math.floor(Math.random() * 12) + 1;
    const rMaxDay = new Date(rYear, rMonth, 0).getDate();
    const rDay = Math.floor(Math.random() * rMaxDay) + 1;
    setYear(rYear); setMonth(rMonth); setDay(rDay);
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <h3 className="text-lg font-medium text-white mb-2">{$t('step4Title')}</h3>
      <p className="text-zinc-400 text-sm mb-6">{$t('step4Desc')}</p>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
          className="glass bg-transparent text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1} className="bg-zinc-900">{i + 1}</option>
          ))}
        </select>
        <span className="text-zinc-600">/</span>
        <input type="number" min={1} max={maxDay} value={day}
          onChange={(e) => setDay(Math.min(parseInt(e.target.value) || 1, maxDay))}
          className="glass bg-transparent text-white px-3 py-2.5 rounded-xl text-sm w-16 text-center mono"
        />
        <span className="text-zinc-600">/</span>
        <input type="number" min={1600} max={2400} value={year}
          onChange={(e) => setYear(parseInt(e.target.value) || 2000)}
          className="glass bg-transparent text-white px-3 py-2.5 rounded-xl text-sm w-24 text-center mono"
        />
        <button onClick={randomize} className="btn-sm ml-auto">{$t('step4Randomize')}</button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
          <span className="text-[10px] text-blue-400/60 mono w-20">{$t('step4YearDD')}</span>
          <span className="text-zinc-300 text-sm">{$t('step2Result')} {year} = </span>
          <span className="text-white font-bold mono text-sm">{wdays[doomsday]}</span>
        </div>
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
          <span className="text-[10px] text-blue-400/60 mono w-20">{$t('step4MonthDD')}</span>
          <span className="text-zinc-300 text-sm">{month}/{monthDoomsday}{leap && (month === 1 || month === 2) ? ` (${$t('step1Leap')})` : ''}</span>
        </div>
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
          <span className="text-[10px] text-blue-400/60 mono w-20">{$t('step4Diff')}</span>
          <span className="text-zinc-300 text-sm">{day} - {monthDoomsday} = </span>
          <span className="text-white font-bold mono text-sm">{diff > 0 ? `+${diff}` : diff} {$t('step4Days')}</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/15 text-center">
        <span className="text-xs text-zinc-400 block mb-1">{$formatDate(year, month, day)}</span>
        <span className="text-xl font-bold text-gradient mono">{wdays[result]}</span>
      </div>
    </div>
  );
}
