import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  Flame,
  Award,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { db } from '../../db';
import {
  getTodayDateString,
  formatDate,
  formatDuration,
  formatIndianNumber,
  addDays,
} from '../../utils/date';
import type { DailySummary, Session } from '../../types';

export const CalendarScreen: React.FC = () => {
  const { t, language } = useI18n();

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());

  const [summaries, setSummaries] = useState<Map<string, DailySummary>>(new Map());
  const [selectedDateSessions, setSelectedDateSessions] = useState<Session[]>([]);

  // Load summaries from IndexedDB
  useEffect(() => {
    async function loadSummaries() {
      const records = await db.dailySummaries.toArray();
      const map = new Map<string, DailySummary>();
      records.forEach((r) => map.set(r.date, r));
      setSummaries(map);
    }
    loadSummaries();
  }, []);

  // Load sessions for selected date
  useEffect(() => {
    async function loadSessions() {
      const list = await db.sessions
        .where('date')
        .equals(selectedDate)
        .reverse()
        .sortBy('startTime');
      setSelectedDateSessions(list);
    }
    loadSessions();
  }, [selectedDate]);

  // Color Intensity Function (Strict adherence to section 11 palette)
  const getIntensityClass = (count: number) => {
    if (!count || count <= 0) return 'bg-white border-border text-text-secondary';
    if (count < 1000) return 'bg-[#EAF4EC] text-primary-dark font-semibold border-primary/20';
    if (count < 3000) return 'bg-[#B2D8C3] text-primary-dark font-semibold border-primary/30';
    if (count < 5000) return 'bg-[#489E73] text-white font-semibold border-[#489E73]';
    return 'bg-[#176B45] text-white font-bold border-[#176B45]'; // 5000+
  };

  // Calendar matrix calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthLabel = new Date(currentYear, currentMonth, 1).toLocaleDateString(
    language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  // Calculate Monthly Stats
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  let monthlyTotal = 0;
  let activeDaysCount = 0;
  let highestCount = 0;
  let highestDate = '';
  let goalsCompletedCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
    const sum = summaries.get(dStr);
    if (sum && sum.count > 0) {
      monthlyTotal += sum.count;
      activeDaysCount++;
      if (sum.count > highestCount) {
        highestCount = sum.count;
        highestDate = dStr;
      }
      if (sum.goalMet) {
        goalsCompletedCount++;
      }
    }
  }

  const averageDailyCount = activeDaysCount > 0 ? Math.round(monthlyTotal / activeDaysCount) : 0;
  const goalCompletionRate = activeDaysCount > 0 ? Math.round((goalsCompletedCount / activeDaysCount) * 100) : 0;

  const selectedSummary = summaries.get(selectedDate);
  const selectedCount = selectedSummary?.count || 0;
  const selectedMalas = selectedSummary?.malas || Math.floor(selectedCount / 108);
  const selectedDuration = selectedSummary?.durationSeconds || 0;
  const todayStr = getTodayDateString();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-12 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          {t('calendar.title')}
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Track your daily chanting consistency and session history
        </p>
      </div>

      {/* Monthly Calendar Card */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary capitalize">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl border border-border hover:bg-primary-soft text-text-secondary hover:text-primary transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl border border-border hover:bg-primary-soft text-text-secondary hover:text-primary transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-text-secondary">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before start of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-10 rounded-xl" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayDateStr = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
            const summary = summaries.get(dayDateStr);
            const count = summary?.count || 0;
            const isSelected = selectedDate === dayDateStr;
            const isToday = todayStr === dayDateStr;
            const intensityClass = getIntensityClass(count);

            return (
              <button
                key={dayDateStr}
                onClick={() => setSelectedDate(dayDateStr)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center border text-xs transition-all relative ${intensityClass} ${
                  isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                } ${isToday ? 'font-bold' : ''}`}
              >
                <span>{dayNum}</span>
                {count > 0 && (
                  <span className="text-[9px] leading-none opacity-85 mt-0.5">
                    {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                  </span>
                )}
                {summary?.goalMet && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-gold" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-3 border-t border-border text-[10px] text-text-secondary">
          <span>Less</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border border-border bg-white" title="0" />
            <span className="w-3.5 h-3.5 rounded bg-[#EAF4EC]" title="1-999" />
            <span className="w-3.5 h-3.5 rounded bg-[#B2D8C3]" title="1,000-2,999" />
            <span className="w-3.5 h-3.5 rounded bg-[#489E73]" title="3,000-4,999" />
            <span className="w-3.5 h-3.5 rounded bg-[#176B45]" title="5,000+" />
          </div>
          <span>5k+</span>
        </div>
      </div>

      {/* Selected Day Chanting Details */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">
              {formatDate(selectedDate, language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US')}
            </h3>
          </div>
          {selectedSummary?.goalMet && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full border border-primary/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Goal Achieved
            </span>
          )}
        </div>

        {/* Selected Date Summary Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-primary-soft/80 border border-primary/10">
            <span className="text-[10px] font-semibold text-text-secondary uppercase">
              {t('calendar.count')}
            </span>
            <div className="text-lg font-bold text-primary-dark mt-0.5">
              {formatIndianNumber(selectedCount)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-primary-sage border border-border">
            <span className="text-[10px] font-semibold text-text-secondary uppercase">
              {t('calendar.malas')}
            </span>
            <div className="text-lg font-bold text-text-primary mt-0.5">
              {selectedMalas}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-primary-sage border border-border">
            <span className="text-[10px] font-semibold text-text-secondary uppercase">
              {t('calendar.duration')}
            </span>
            <div className="text-sm font-bold text-text-primary mt-1">
              {formatDuration(selectedDuration)}
            </div>
          </div>
        </div>

        {/* Sessions on this date */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-text-secondary block mb-2">
            Sessions History ({selectedDateSessions.length})
          </span>

          {selectedDateSessions.length === 0 ? (
            <p className="text-xs text-text-secondary italic py-2">
              {t('calendar.noActivity')}
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDateSessions.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="p-3 rounded-2xl bg-primary-sage/50 border border-border flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-text-primary block font-telugu">
                      {s.mantraName}
                    </span>
                    <span className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {formatDuration(s.durationSeconds)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary text-sm">
                      +{formatIndianNumber(s.count)}
                    </span>
                    <span className="text-[10px] text-text-secondary block">
                      {s.completedMalas} Malas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Statistics Overview */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-3">
        <h3 className="text-sm font-bold text-text-primary">
          Monthly Statistics ({monthLabel})
        </h3>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-primary-soft/60 border border-primary/10">
            <span className="text-xs text-text-secondary block">Total Repetitions</span>
            <span className="text-lg font-bold text-primary-dark mt-0.5 block">
              {formatIndianNumber(monthlyTotal)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-primary-soft/60 border border-primary/10">
            <span className="text-xs text-text-secondary block">Active Days</span>
            <span className="text-lg font-bold text-primary-dark mt-0.5 block">
              {activeDaysCount} / {daysInMonth}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-primary-sage border border-border">
            <span className="text-xs text-text-secondary block">Daily Average</span>
            <span className="text-lg font-bold text-text-primary mt-0.5 block">
              {formatIndianNumber(averageDailyCount)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-primary-sage border border-border">
            <span className="text-xs text-text-secondary block">Goal Success Rate</span>
            <span className="text-lg font-bold text-text-primary mt-0.5 block">
              {goalCompletionRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
