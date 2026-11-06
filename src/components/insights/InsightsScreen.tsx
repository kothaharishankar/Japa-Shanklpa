import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Flame,
  Award,
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { db, SANKALPA_TARGET } from '../../db';
import {
  getTodayDateString,
  addDays,
  formatDate,
  formatIndianNumber,
} from '../../utils/date';
import type { DevotionalStats } from '../../utils/stats';
import type { DailySummary, Mantra } from '../../types';

interface InsightsScreenProps {
  stats: DevotionalStats;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ stats }) => {
  const { t } = useI18n();

  const [last7DaysData, setLast7DaysData] = useState<{ day: string; count: number; goal: number }[]>([]);
  const [mantraBreakdown, setMantraBreakdown] = useState<Mantra[]>([]);

  useEffect(() => {
    async function loadChartData() {
      const today = getTodayDateString();
      const summaries = await db.dailySummaries.toArray();
      const sumMap = new Map<string, DailySummary>();
      summaries.forEach((s) => sumMap.set(s.date, s));

      const days7: { day: string; count: number; goal: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const dStr = addDays(today, -i);
        const s = sumMap.get(dStr);
        const dateObj = new Date(dStr);
        const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        days7.push({
          day: dayLabel,
          count: s?.count || 0,
          goal: s?.goalTarget || stats.dailyGoal,
        });
      }
      setLast7DaysData(days7);

      // Load mantra breakdown
      const mantras = await db.mantras.orderBy('totalCount').reverse().toArray();
      setMantraBreakdown(mantras);
    }

    loadChartData();
  }, [stats]);

  // Estimated completion date based on daily average
  const estimatedDaysToComplete = stats.dailyAverage > 0
    ? Math.ceil(stats.remainingCount / stats.dailyAverage)
    : 0;

  const estimatedCompletionDate = estimatedDaysToComplete > 0
    ? addDays(getTodayDateString(), estimatedDaysToComplete)
    : 'Continuously Chanting';

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-12 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          {t('insights.title')}
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Deep reflection into your spiritual discipline and progress
        </p>
      </div>

      {/* Daily Performance Section */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-3">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          {t('insights.dailyTitle')}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-primary-soft border border-primary/20">
            <span className="text-xs text-text-secondary font-medium">
              {t('insights.today')}
            </span>
            <div className="text-2xl font-bold text-primary-dark mt-0.5">
              {formatIndianNumber(stats.todayCount)}
            </div>
            <span className="text-[10px] text-text-secondary">
              Goal: {formatIndianNumber(stats.dailyGoal)} ({stats.dailyGoalMet ? 'Met' : 'Pending'})
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary-sage border border-border">
            <span className="text-xs text-text-secondary font-medium">
              {t('insights.yesterday')}
            </span>
            <div className="text-2xl font-bold text-text-primary mt-0.5">
              {formatIndianNumber(stats.yesterdayCount)}
            </div>
            <span className="text-[10px] text-text-secondary">
              {Math.floor(stats.yesterdayCount / 108)} Malas
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              {t('insights.weeklyTitle')}
            </h3>
            <span className="text-xs text-text-secondary">
              Total: {formatIndianNumber(stats.weeklyTotal)} repetitions this week
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-soft text-primary-dark border border-primary/20">
            Avg: {formatIndianNumber(Math.round(stats.weeklyTotal / 7))}/day
          </span>
        </div>

        {/* Responsive Recharts Bar Chart */}
        <div className="w-full h-48 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#718078' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#718078' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2 bg-white rounded-xl shadow-lg border border-border text-xs">
                        <span className="font-bold text-text-primary block">{data.day}</span>
                        <span className="text-primary font-bold">{formatIndianNumber(data.count)} reps</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {last7DaysData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count >= entry.goal ? '#176B45' : '#489E73'}
                    opacity={entry.count > 0 ? 1 : 0.25}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lifetime Devotion Statistics */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-3">
        <h3 className="text-sm font-bold text-text-primary">
          {t('insights.lifetimeTitle')}
        </h3>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-primary-soft border border-primary/20">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
              <Award className="w-4 h-4 text-accent-gold" />
              <span>Total Malas</span>
            </div>
            <div className="text-2xl font-bold text-primary-dark mt-1">
              {formatIndianNumber(stats.completedMalas)}
            </div>
            <span className="text-[10px] text-text-secondary">
              Of 10,185 total malas
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary-sage border border-border">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
              <Flame className="w-4 h-4 text-accent-gold" />
              <span>{t('insights.longestStreak')}</span>
            </div>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {stats.longestStreak} days
            </div>
            <span className="text-[10px] text-text-secondary">
              Current: {stats.currentStreak} days
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary-sage border border-border col-span-2 flex items-center justify-between">
            <div>
              <span className="text-xs text-text-secondary font-medium block">
                {t('insights.estCompletion')}
              </span>
              <span className="text-base font-bold text-primary-dark mt-0.5 block">
                {formatDate(estimatedCompletionDate)}
              </span>
              <span className="text-[10px] text-text-secondary">
                At your current pace of {formatIndianNumber(stats.dailyAverage)} reps/day
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-primary-soft text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Mantra Breakdown */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-3">
        <h3 className="text-sm font-bold text-text-primary">
          {t('insights.mantraBreakdown')}
        </h3>

        <div className="space-y-2">
          {mantraBreakdown.map((m) => {
            const count = m.totalCount || 0;
            const pct = stats.totalCompleted > 0
              ? Math.round((count / stats.totalCompleted) * 100)
              : 0;

            return (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-primary-sage/60 border border-border space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary text-xs font-telugu truncate max-w-[240px]">
                    {m.name}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {formatIndianNumber(count)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-secondary">
                  <span>{Math.floor(count / 108)} Malas</span>
                  <span>{pct}% of Sankalpa</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
