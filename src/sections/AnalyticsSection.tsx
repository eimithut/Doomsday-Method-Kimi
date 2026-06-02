import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, PieChart, Pie,
} from 'recharts';
import {
  TrendingUp, Target, Clock, Zap, Trash2, ArrowLeft, AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  getAllSessions, getAccuracyByCentury, getAccuracyByMonth, getProgressOverTime,
  getAllAnswers, getStateDistribution, getWeaknessAnalysis, clearAllData,
} from '@/lib/db';
import { getMonthNames } from '@/lib/i18n';
import type { AppView, Lang } from '@/types';

interface DashboardData {
  sessions: Awaited<ReturnType<typeof getAllSessions>>;
  accuracyByCentury: Awaited<ReturnType<typeof getAccuracyByCentury>>;
  accuracyByMonth: Awaited<ReturnType<typeof getAccuracyByMonth>>;
  progressOverTime: Awaited<ReturnType<typeof getProgressOverTime>>;
  stateDistribution: Awaited<ReturnType<typeof getStateDistribution>>;
  weaknessAnalysis: Awaited<ReturnType<typeof getWeaknessAnalysis>>;
  totalAnswers: number;
  totalCorrect: number;
  avgTime: number;
  bestStreak: number;
  withHelpCount: number;
}

interface AnalyticsSectionProps {
  onNavigate: (view: AppView) => void;
  lang: Lang;
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#f59e0b'];
const STATE_COLORS: Record<string, string> = {
  correct: '#22c55e',
  incorrect: '#ef4444',
  correct_with_help: '#3b82f6',
  incorrect_with_help: '#f59e0b',
};

export function AnalyticsSection({ onNavigate, lang }: AnalyticsSectionProps) {
  const { $t } = useTranslation(lang);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const monthNames = getMonthNames(lang);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessions, centuryData, monthData, progress, answers, stateDist, weakness] = await Promise.all([
        getAllSessions(),
        getAccuracyByCentury(),
        getAccuracyByMonth(),
        getProgressOverTime(),
        getAllAnswers(),
        getStateDistribution(),
        getWeaknessAnalysis(),
      ]);

      const totalCorrect = answers.filter((a) => a.state === 'correct' || a.state === 'correct_with_help').length;
      const avgTime = answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.timeMs, 0) / answers.length) : 0;
      const withHelpCount = answers.filter((a) => a.usedHelp).length;

      // Best streak
      let bestStreak = 0, currentStreak = 0;
      answers.forEach((a) => {
        if (a.state === 'correct' || a.state === 'correct_with_help') { currentStreak++; bestStreak = Math.max(bestStreak, currentStreak); }
        else { currentStreak = 0; }
      });

      // Month data with labels
      const fullMonthData = monthData.map((m) => ({
        month: monthNames[m.monthIdx - 1]?.slice(0, 3) || String(m.monthIdx),
        accuracy: m.accuracy,
        monthIdx: m.monthIdx,
      }));

      setData({
        sessions,
        accuracyByCentury: centuryData,
        accuracyByMonth: fullMonthData,
        progressOverTime: progress,
        stateDistribution: stateDist,
        weaknessAnalysis: weakness,
        totalAnswers: answers.length,
        totalCorrect,
        avgTime,
        bestStreak,
        withHelpCount,
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleReset = async () => {
    await clearAllData();
    setShowResetConfirm(false);
    loadData();
  };

  if (loading) {
    return (
      <section className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  if (!data || data.totalAnswers === 0) {
    return (
      <section className="min-h-screen pt-32 pb-16 px-4">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => onNavigate('hero')} className="btn-back mb-6 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              {$t('backToMenu')}
            </button>
            <Target className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
            <h2 className="text-3xl font-light text-white mb-4">{$t('analyticsTitle')}</h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">{$t('analyticsNoData')}</p>
          </motion.div>
        </div>
      </section>
    );
  }

  const overallAccuracy = data.totalAnswers > 0 ? Math.round((data.totalCorrect / data.totalAnswers) * 100) : 0;
  const statePieData = Object.entries(data.stateDistribution).map(([key, value]) => ({
    name: key,
    value,
    fill: STATE_COLORS[key] || '#6b7280',
  }));
  const weaknessData = data.weaknessAnalysis
    .filter((w) => w.total > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 6)
    .map((w) => ({
      month: monthNames[w.month - 1]?.slice(0, 3) || String(w.month),
      errorRate: w.errorRate,
      total: w.total,
    }));

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="mono text-xs text-blue-400/70 tracking-[0.3em] uppercase">{$t('navAnalytics')}</span>
          <h2 className="text-3xl sm:text-4xl font-light text-white mt-3 mb-4">
            {$t('analyticsTitle').split(' ').slice(0, -1).join(' ')} <span className="text-gradient font-medium">{$t('analyticsTitle').split(' ').pop()}</span>
          </h2>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
          {[
            { icon: Target, label: $t('analyticsAccuracy'), value: `${overallAccuracy}%` },
            { icon: Zap, label: $t('streakBest'), value: String(data.bestStreak) },
            { icon: Clock, label: $t('analyticsAvgTime'), value: `${(data.avgTime / 1000).toFixed(1)}s` },
            { icon: TrendingUp, label: $t('analyticsTotalAnswers'), value: String(data.totalAnswers) },
            { icon: BarChart3, label: $t('cheatSheet'), value: String(data.withHelpCount) },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="stat-card"
            >
              <stat.icon className="w-4 h-4 text-blue-400/60 mb-1" />
              <span className="stat-value text-xl">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Accuracy Over Time */}
          <ChartCard title={$t('analyticsOverTime')} delay={0.3}>
            {data.progressOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.progressOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'lv' ? 'lv-LV' : 'en-US', { month: 'short', day: 'numeric' })} stroke="rgba(255,255,255,0.06)" />
                  <YAxis domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 10 }} stroke="rgba(255,255,255,0.06)" tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<GlassTooltip />} />
                  <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <NoData />}
          </ChartCard>

          {/* Accuracy by Century */}
          <ChartCard title={$t('analyticsByCentury')} delay={0.4}>
            {data.accuracyByCentury.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.accuracyByCentury}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="century" tick={{ fill: '#52525b', fontSize: 10 }} tickFormatter={(v) => `${v}s`} stroke="rgba(255,255,255,0.06)" />
                  <YAxis domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 10 }} stroke="rgba(255,255,255,0.06)" tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {data.accuracyByCentury.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <NoData />}
          </ChartCard>

          {/* Accuracy by Month (Radar) */}
          <ChartCard title={$t('analyticsByMonth')} delay={0.5}>
            {data.accuracyByMonth.some((m) => m.accuracy > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={data.accuracyByMonth}>
                  <PolarGrid stroke="rgba(255,255,255,0.04)" />
                  <PolarAngleAxis dataKey="month" tick={{ fill: '#52525b', fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} />
                  <Radar name="Accuracy" dataKey="accuracy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip content={<GlassTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <NoData />}
          </ChartCard>

          {/* State Distribution */}
          <ChartCard title={$t('analyticsWeakness')} delay={0.6}>
            {statePieData.some((d) => d.value > 0) ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={statePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {statePieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<GlassTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {statePieData.filter((d) => d.value > 0).map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                      <span className="text-zinc-400">{$t(d.name as any)}: <span className="text-zinc-300 mono">{d.value}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <NoData />}
          </ChartCard>

          {/* Weakness Analysis */}
          <ChartCard title={$t('analyticsWeakness')} delay={0.7}>
            {weaknessData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weaknessData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 10 }} stroke="rgba(255,255,255,0.06)" tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="month" type="category" tick={{ fill: '#52525b', fontSize: 10 }} stroke="rgba(255,255,255,0.06)" width={40} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="errorRate" radius={[0, 6, 6, 0]}>
                    {weaknessData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <NoData />}
          </ChartCard>

          {/* Response Time Trend */}
          <ChartCard title={$t('analyticsTimeTrend')} delay={0.8}>
            {data.progressOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.progressOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'lv' ? 'lv-LV' : 'en-US', { month: 'short', day: 'numeric' })} stroke="rgba(255,255,255,0.06)" />
                  <YAxis tick={{ fill: '#52525b', fontSize: 10 }} stroke="rgba(255,255,255,0.06)" tickFormatter={(v) => `${v}s`} />
                  <Tooltip content={<GlassTooltip />} />
                  <Line type="monotone" dataKey="avgTime" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <NoData />}
          </ChartCard>
        </div>

        {/* Recent Sessions */}
        {data.sessions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="glass-card p-6 mb-10 overflow-x-auto"
          >
            <h3 className="text-sm text-zinc-400 uppercase tracking-widest mb-4">{$t('analyticsRecentSessions')}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 border-b border-white/[0.06]">
                  <th className="text-left py-3 px-2 font-medium text-xs">{$t('analyticsDate')}</th>
                  <th className="text-left py-3 px-2 font-medium text-xs">{$t('analyticsMode')}</th>
                  <th className="text-center py-3 px-2 font-medium text-xs">{$t('analyticsQuestions')}</th>
                  <th className="text-center py-3 px-2 font-medium text-xs">{$t('analyticsAccuracy')}</th>
                  <th className="text-center py-3 px-2 font-medium text-xs">{$t('analyticsAvgTime')}</th>
                </tr>
              </thead>
              <tbody>
                {data.sessions.slice(-10).reverse().map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2 text-zinc-300 mono text-xs">{new Date(s.date).toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'lv' ? 'lv-LV' : 'en-US')}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${s.mode === 'endless' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {s.mode === 'endless' ? 'Endless' : 'Time Attack'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-zinc-300 mono text-xs">{s.totalQuestions}</td>
                    <td className="py-3 px-2 text-center mono text-xs">
                      <span className={(s.accuracy || 0) >= 80 ? 'text-green-400' : (s.accuracy || 0) >= 50 ? 'text-amber-400' : 'text-red-400'}>
                        {Math.round(s.accuracy || 0)}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-zinc-400 mono text-xs">{((s.avgTimeMs || 0) / 1000).toFixed(1)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Reset */}
        <div className="text-center relative z-10">
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)} className="text-zinc-600 hover:text-red-400 text-sm transition-colors flex items-center gap-2 mx-auto">
              <Trash2 className="w-4 h-4" />
              {$t('analyticsReset')}
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass p-4 rounded-xl inline-flex items-center gap-4"
            >
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-zinc-400">{$t('analyticsResetConfirm')}</span>
              <button onClick={handleReset} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
                {$t('analyticsResetYes')}
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-zinc-500 rounded-lg text-sm hover:text-zinc-300 transition-colors">
                {$t('analyticsResetCancel')}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Chart Card Wrapper ───────────────────────────────────────────

function ChartCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 min-h-[320px]"
    >
      <h3 className="text-xs text-zinc-400 uppercase tracking-widest mb-4">{title}</h3>
      <div className="min-h-[280px]">
        {children}
      </div>
    </motion.div>
  );
}

// ── Glassmorphism Tooltip ────────────────────────────────────────

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong px-3 py-2 rounded-lg text-xs">
      {label && <p className="text-zinc-400 mb-1">{String(label).match(/^\d{4}-\d{2}-\d{2}T?/) ? new Date(label).toLocaleDateString() : label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || '#e4e4e7' }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? `${Math.round(p.value)}%` : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── No Data placeholder ──────────────────────────────────────────

function NoData() {
  return (
    <div className="h-[280px] flex items-center justify-center text-zinc-600 text-sm">
      No data yet
    </div>
  );
}
