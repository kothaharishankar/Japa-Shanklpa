import React from 'react';
import { Play, Target, Calendar, Sparkles, Flame, CheckCircle2, ChevronRight } from 'lucide-react';
import { useI18n } from '../../i18n';
import { CircularProgress } from '../common/CircularProgress';
import { formatIndianNumber, getTodayDateString } from '../../utils/date';
import type { DevotionalStats } from '../../utils/stats';
import type { Mantra } from '../../types';

interface HomeDashboardProps {
  stats: DevotionalStats;
  activeMantra: Mantra | null;
  onNavigate: (tab: 'counter' | 'sankalpa' | 'calendar' | 'insights') => void;
  onOpenMantraSelect: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  stats,
  activeMantra,
  onNavigate,
  onOpenMantraSelect,
}) => {
  const { t, language } = useI18n();

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greetingMorning');
    if (hour < 17) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  };

  const todayFormatted = new Date().toLocaleDateString(
    language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-fade-in pb-24 md:pb-12">
      {/* Header Greeting & Date */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-gold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            {getGreeting()}
          </span>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mt-0.5">
            {t('app.title')}
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">{todayFormatted}</p>
        </div>

        {/* Current Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-soft rounded-full border border-primary/20 text-primary-dark">
          <Flame className="w-4 h-4 text-accent-gold fill-accent-gold" />
          <span className="text-xs font-bold">{stats.currentStreak} {t('home.days')}</span>
        </div>
      </div>

      {/* Active Mantra Banner Card */}
      {activeMantra && (
        <div
          onClick={onOpenMantraSelect}
          className="p-3.5 rounded-2xl bg-primary-sage border border-border flex items-center justify-between cursor-pointer hover:bg-primary-soft/50 transition-colors shadow-subtle group"
        >
          <div className="flex-1 pr-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
              {t('home.activeMantra')}
            </span>
            <div className="text-base sm:text-lg font-semibold text-primary-dark font-telugu mt-0.5 leading-snug truncate">
              {activeMantra.name}
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-primary group-hover:translate-x-0.5 transition-transform flex-shrink-0">
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Main Sankalpa Progress Ring Card */}
      <div className="p-6 rounded-3xl bg-white border border-border shadow-card flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle decorative background motif */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary-soft/60 pointer-events-none" />

        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          {t('home.fixedTarget')}
        </span>

        {/* Circular Ring */}
        <CircularProgress
          percentage={stats.percentageCompleted}
          size={190}
          strokeWidth={14}
          color="#176B45"
          trackColor="#EAF4EC"
          className="my-1 drop-shadow-sm"
        >
          <div className="flex flex-col items-center px-2">
            <span className="text-3xl font-extrabold text-primary-dark tracking-tight">
              {stats.percentageCompleted}%
            </span>
            <span className="text-[11px] text-text-secondary mt-0.5 font-medium">
              {t('sankalpa.completed')}
            </span>
          </div>
        </CircularProgress>

        {/* Counts Breakdown */}
        <div className="w-full grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border/80">
          <div className="flex flex-col items-center p-2 rounded-xl bg-primary-sage/60">
            <span className="text-[11px] text-text-secondary font-medium">
              {t('home.totalCompleted')}
            </span>
            <span className="text-lg font-bold text-primary-dark mt-0.5">
              {formatIndianNumber(stats.totalCompleted)}
            </span>
            <span className="text-[10px] text-text-secondary">
              ({formatIndianNumber(stats.completedMalas)} malas)
            </span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-primary-sage/60">
            <span className="text-[11px] text-text-secondary font-medium">
              {t('home.remaining')}
            </span>
            <span className="text-lg font-bold text-text-primary mt-0.5">
              {formatIndianNumber(stats.remainingCount)}
            </span>
            <span className="text-[10px] text-text-secondary">
              ({formatIndianNumber(stats.remainingMalas)} malas)
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button: Start / Continue Japa */}
      <button
        onClick={() => onNavigate('counter')}
        className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-[0.99] transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
        </div>
        <span>{stats.todayCount > 0 ? t('home.continueJapa') : t('home.startJapa')}</span>
      </button>

      {/* 4 Soft Green Statistic Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Chanting */}
        <div className="p-4 rounded-2xl bg-primary-soft/80 border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-text-secondary text-xs font-medium">
              <span>{t('home.todayChanting')}</span>
              {stats.dailyGoalMet && (
                <span title={t('home.goalReached')}>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-primary-dark mt-1">
              {formatIndianNumber(stats.todayCount)}
            </div>
          </div>
          <div className="text-[11px] text-text-secondary mt-2 flex items-center justify-between">
            <span>Goal: {formatIndianNumber(stats.dailyGoal)}</span>
            <span className="font-semibold text-primary">
              {stats.dailyGoalMet ? 'Done' : `${formatIndianNumber(stats.remainingDaily)} left`}
            </span>
          </div>
        </div>

        {/* Today's Malas */}
        <div className="p-4 rounded-2xl bg-primary-soft/80 border border-border flex flex-col justify-between">
          <span className="text-text-secondary text-xs font-medium">
            {t('home.todayMalas')}
          </span>
          <div className="text-2xl font-bold text-primary-dark mt-1">
            {formatIndianNumber(stats.todayMalas)}
          </div>
          <span className="text-[11px] text-text-secondary mt-2">
            {stats.todayCount % 108}/108 current round
          </span>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-2xl bg-primary-sage border border-border flex flex-col justify-between">
          <span className="text-text-secondary text-xs font-medium">
            {t('home.currentStreak')}
          </span>
          <div className="text-2xl font-bold text-primary-dark mt-1 flex items-baseline gap-1">
            {stats.currentStreak}
            <span className="text-xs font-normal text-text-secondary">{t('home.days')}</span>
          </div>
          <span className="text-[11px] text-text-secondary mt-2">
            Record: {stats.longestStreak} days
          </span>
        </div>

        {/* Daily Average */}
        <div className="p-4 rounded-2xl bg-primary-sage border border-border flex flex-col justify-between">
          <span className="text-text-secondary text-xs font-medium">
            {t('home.dailyAverage')}
          </span>
          <div className="text-2xl font-bold text-primary-dark mt-1">
            {formatIndianNumber(stats.dailyAverage)}
          </div>
          <span className="text-[11px] text-text-secondary mt-2">
            Over {stats.activeDays} active days
          </span>
        </div>
      </div>

      {/* Secondary Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => onNavigate('sankalpa')}
          className="p-3.5 rounded-2xl bg-white border border-border hover:bg-primary-sage text-primary-dark text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-subtle"
        >
          <Target className="w-4 h-4 text-primary" />
          <span>{t('home.viewSankalpa')}</span>
        </button>

        <button
          onClick={() => onNavigate('calendar')}
          className="p-3.5 rounded-2xl bg-white border border-border hover:bg-primary-sage text-primary-dark text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-subtle"
        >
          <Calendar className="w-4 h-4 text-primary" />
          <span>{t('home.openCalendar')}</span>
        </button>
      </div>
    </div>
  );
};
