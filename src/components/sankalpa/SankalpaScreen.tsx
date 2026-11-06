import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Sparkles,
  Trophy,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { CircularProgress } from '../common/CircularProgress';
import {
  getTodayDateString,
  addDays,
  getDaysRemaining,
  formatIndianNumber,
  formatDate,
} from '../../utils/date';
import { db, SANKALPA_TARGET } from '../../db';
import type { Sankalpa, Milestone, AppSettings } from '../../types';

interface SankalpaScreenProps {
  lifetimeCount: number;
  todayCount: number;
  onRefresh: () => void;
}

export const SankalpaScreen: React.FC<SankalpaScreenProps> = ({
  lifetimeCount,
  todayCount,
  onRefresh,
}) => {
  const { t } = useI18n();

  const [sankalpa, setSankalpa] = useState<Sankalpa | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Load Sankalpa and Milestones
  useEffect(() => {
    async function loadData() {
      const s = await db.sankalpa.get('sankalpa-11-lakh');
      if (s) setSankalpa(s);

      const ms = await db.milestones.orderBy('targetCount').toArray();
      setMilestones(ms);

      const sett = await db.settings.get('current_settings');
      if (sett) setSettings(sett);
    }
    loadData();
  }, [lifetimeCount]);

  if (!sankalpa) return null;

  const today = getTodayDateString();
  const remainingCount = Math.max(0, SANKALPA_TARGET - lifetimeCount);
  const percentage = Number(((lifetimeCount / SANKALPA_TARGET) * 100).toFixed(2));
  const completedMalas = Math.floor(lifetimeCount / 108);
  const remainingMalas = Math.ceil(remainingCount / 108);

  // Calculator logic
  const daysRemaining = getDaysRemaining(sankalpa.targetDate);
  const isExpired = daysRemaining <= 0 && remainingCount > 0;
  const isCompleted = remainingCount === 0;

  let requiredDaily = 0;
  let requiredMalas = 0;

  if (isCompleted) {
    requiredDaily = 0;
    requiredMalas = 0;
  } else if (daysRemaining <= 0) {
    requiredDaily = remainingCount;
    requiredMalas = Math.ceil(remainingCount / 108);
  } else {
    requiredDaily = Math.ceil(remainingCount / daysRemaining);
    requiredMalas = Math.ceil(requiredDaily / 108);
  }

  // Ahead / Behind status
  // Total elapsed days since start
  const totalSankalpaDays = Math.max(1, getDaysRemaining(sankalpa.targetDate) + Math.max(0, Math.round((new Date(today).getTime() - new Date(sankalpa.startDate).getTime()) / (1000 * 60 * 60 * 24))));
  const expectedIdealCount = Math.min(SANKALPA_TARGET, Math.round((SANKALPA_TARGET / totalSankalpaDays) * Math.max(1, totalSankalpaDays - daysRemaining)));
  const paceStatus = lifetimeCount >= expectedIdealCount ? 'ahead' : 'behind';

  // Handle preset selection
  const applyPresetDays = async (days: number) => {
    const newTargetDate = addDays(today, days);
    await db.sankalpa.update(sankalpa.id, { targetDate: newTargetDate });
    setSankalpa((prev) => (prev ? { ...prev, targetDate: newTargetDate } : null));
    onRefresh();
  };

  // Handle custom date change
  const handleCustomDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    if (!dateVal) return;
    await db.sankalpa.update(sankalpa.id, { targetDate: dateVal });
    setSankalpa((prev) => (prev ? { ...prev, targetDate: dateVal } : null));
    onRefresh();
  };

  // Handle daily goal change
  const handleDailyGoalChange = async (goal: number) => {
    if (!settings) return;
    await db.settings.update('current_settings', { dailyGoal: goal });
    setSettings((prev) => (prev ? { ...prev, dailyGoal: goal } : null));
    onRefresh();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-12 animate-fade-in">
      {/* Sacred Fixed Target Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary-dark text-xs font-semibold border border-primary/20">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>{t('sankalpa.fixedTargetNotice')}</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          {t('sankalpa.title')}
        </h1>
        <p className="text-xs text-text-secondary">
          11,00,000 Mantra Repetitions (10,185 Malas + 20 Repetitions)
        </p>
      </div>

      {/* Main Circular Progress Ring */}
      <div className="p-6 rounded-3xl bg-white border border-border shadow-card flex flex-col items-center text-center">
        <CircularProgress
          percentage={percentage}
          size={210}
          strokeWidth={16}
          color="#176B45"
          trackColor="#EAF4EC"
          className="my-2 drop-shadow-sm"
        >
          <div className="flex flex-col items-center px-2">
            <span className="text-4xl font-black text-primary-dark tracking-tight">
              {percentage}%
            </span>
            <span className="text-xs font-semibold text-text-secondary mt-0.5">
              {t('sankalpa.completed')}
            </span>
          </div>
        </CircularProgress>

        {/* Breakdown Stats */}
        <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border">
          <div className="p-3 rounded-2xl bg-primary-soft/70 border border-primary/10">
            <span className="text-xs text-text-secondary font-medium block">
              {t('sankalpa.completed')}
            </span>
            <span className="text-xl font-bold text-primary-dark mt-0.5 block">
              {formatIndianNumber(lifetimeCount)}
            </span>
            <span className="text-[11px] text-text-secondary">
              {formatIndianNumber(completedMalas)} {t('sankalpa.completedMalas')}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-primary-sage border border-border">
            <span className="text-xs text-text-secondary font-medium block">
              {t('sankalpa.remaining')}
            </span>
            <span className="text-xl font-bold text-text-primary mt-0.5 block">
              {formatIndianNumber(remainingCount)}
            </span>
            <span className="text-[11px] text-text-secondary">
              {formatIndianNumber(remainingMalas)} {t('sankalpa.remainingMalas')}
            </span>
          </div>
        </div>
      </div>

      {/* Smart Daily Target Calculator */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary-soft text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {t('sankalpa.calculatorTitle')}
              </h3>
              <span className="text-xs text-text-secondary">
                Auto-calculated to reach 11 Lakh on time
              </span>
            </div>
          </div>
        </div>

        {/* Preset Duration Buttons */}
        <div>
          <span className="text-xs font-semibold text-text-secondary block mb-2">
            {t('sankalpa.presets')}
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { days: 30, label: t('sankalpa.days30') },
              { days: 90, label: t('sankalpa.days90') },
              { days: 180, label: t('sankalpa.days180') },
              { days: 365, label: t('sankalpa.days365') },
            ].map((p) => {
              const pTarget = addDays(today, p.days);
              const isActive = sankalpa.targetDate === pTarget;
              return (
                <button
                  key={p.days}
                  onClick={() => applyPresetDays(p.days)}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-primary-sage/70 text-text-primary border-border hover:bg-primary-soft'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Input */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-primary-sage border border-border">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-text-primary">
              {t('sankalpa.targetDate')}:
            </span>
          </div>
          <input
            type="date"
            value={sankalpa.targetDate}
            min={today}
            onChange={handleCustomDateChange}
            className="text-xs font-semibold bg-white border border-border rounded-lg px-2.5 py-1 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Calculator Output Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-primary-soft border border-primary/20 text-center">
            <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider block">
              {t('sankalpa.requiredDaily')}
            </span>
            <div className="text-2xl font-black text-primary-dark mt-1">
              {formatIndianNumber(requiredDaily)}
            </div>
            <span className="text-[10px] text-text-secondary font-medium">
              ≈ {requiredMalas} malas / day
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary-sage border border-border text-center">
            <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider block">
              {t('sankalpa.daysRemaining')}
            </span>
            <div className="text-2xl font-black text-text-primary mt-1">
              {daysRemaining}
            </div>
            <div className="text-[10px] font-semibold flex items-center justify-center gap-1 mt-0.5">
              {paceStatus === 'ahead' ? (
                <span className="text-primary flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {t('sankalpa.ahead')}
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" /> {t('sankalpa.behind')}
                </span>
              )}
            </div>
          </div>
        </div>

        {isExpired && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Target date has passed. Choose a new preset or deadline to recalibrate.</span>
          </div>
        )}
      </div>

      {/* Independent Daily Goal Config */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-text-primary">
            {t('settings.dailyGoal')}
          </span>
          <span className="text-xs font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary-soft border border-primary/20">
            {todayCount} / {settings?.dailyGoal || 1000} today
          </span>
        </div>
        <p className="text-xs text-text-secondary">
          Track personal daily targets without changing your sacred 11 Lakh Sankalpa.
        </p>
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[1000, 2000, 5000, 10000].map((goal) => {
            const isSelected = settings?.dailyGoal === goal;
            return (
              <button
                key={goal}
                onClick={() => handleDailyGoalChange(goal)}
                className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-primary-sage/60 text-text-primary border-border hover:bg-primary-soft'
                }`}
              >
                {formatIndianNumber(goal)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Milestones Roadmap */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-gold" />
          <h3 className="text-base font-bold text-text-primary">
            {t('sankalpa.milestones')}
          </h3>
        </div>

        <div className="space-y-2.5">
          {milestones.map((m) => {
            const isReached = lifetimeCount >= m.targetCount;
            return (
              <div
                key={m.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                  isReached
                    ? 'bg-primary-soft/60 border-primary/20 text-primary-dark'
                    : 'bg-primary-sage/40 border-border text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isReached
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text-primary block">
                      {m.label}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      {Math.floor(m.targetCount / 108)} Malas
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      isReached
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary'
                    }`}
                  >
                    {isReached ? t('sankalpa.achieved') : t('sankalpa.pending')}
                  </span>
                  {m.reachedAt && (
                    <span className="text-[10px] text-text-secondary block mt-0.5">
                      {new Date(m.reachedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
