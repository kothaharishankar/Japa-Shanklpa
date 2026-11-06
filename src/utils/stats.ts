import { db } from '../db';
import { getTodayDateString, addDays } from './date';
import type { DailySummary } from '../types';

export interface DevotionalStats {
  totalCompleted: number;
  remainingCount: number;
  percentageCompleted: number;
  completedMalas: number;
  remainingMalas: number;
  todayCount: number;
  todayMalas: number;
  dailyGoal: number;
  remainingDaily: number;
  dailyGoalMet: boolean;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  dailyAverage: number;
  yesterdayCount: number;
  weeklyTotal: number;
  monthlyTotal: number;
}

export async function calculateDevotionalStats(): Promise<DevotionalStats> {
  const today = getTodayDateString();
  const yesterday = addDays(today, -1);

  // Total completed repetitions from source of truth
  const totalCompleted = await db.countEvents.count();
  const target = 1100000;
  const remainingCount = Math.max(0, target - totalCompleted);
  const percentageCompleted = Number(((totalCompleted / target) * 100).toFixed(2));

  const completedMalas = Math.floor(totalCompleted / 108);
  // Target: 10,185 malas + 20 repetitions
  const remainingMalas = Math.ceil(remainingCount / 108);

  // Settings
  const settings = await db.settings.get('current_settings');
  const dailyGoal = settings?.dailyGoal || 1000;

  // Summaries
  const summaries = await db.dailySummaries.toArray();
  const summaryMap = new Map<string, DailySummary>();
  summaries.forEach((s) => summaryMap.set(s.date, s));

  const todaySummary = summaryMap.get(today);
  const todayCount = todaySummary?.count || 0;
  const todayMalas = Math.floor(todayCount / 108);
  const remainingDaily = Math.max(0, dailyGoal - todayCount);
  const dailyGoalMet = todayCount >= dailyGoal;

  const yesterdayCount = summaryMap.get(yesterday)?.count || 0;

  // Streak calculation
  let currentStreak = 0;
  let checkDate = todayCount > 0 ? today : yesterday;
  while (true) {
    const sum = summaryMap.get(checkDate);
    if (sum && sum.count > 0) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }

  // Longest streak
  const sortedDates = Array.from(summaryMap.keys())
    .filter((d) => (summaryMap.get(d)?.count || 0) > 0)
    .sort();

  let longestStreak = 0;
  let tempStreak = 0;
  let prevDateStr: string | null = null;

  for (const dateStr of sortedDates) {
    if (!prevDateStr) {
      tempStreak = 1;
    } else {
      const expectedNext = addDays(prevDateStr, 1);
      if (expectedNext === dateStr) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDateStr = dateStr;
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  // Active days & average
  const activeDays = sortedDates.length;
  const dailyAverage = activeDays > 0 ? Math.round(totalCompleted / activeDays) : 0;

  // Weekly total (last 7 days)
  let weeklyTotal = 0;
  for (let i = 0; i < 7; i++) {
    const dStr = addDays(today, -i);
    weeklyTotal += summaryMap.get(dStr)?.count || 0;
  }

  // Monthly total (current calendar month)
  const currentMonthPrefix = today.substring(0, 7); // YYYY-MM
  let monthlyTotal = 0;
  summaries.forEach((s) => {
    if (s.date.startsWith(currentMonthPrefix)) {
      monthlyTotal += s.count;
    }
  });

  return {
    totalCompleted,
    remainingCount,
    percentageCompleted,
    completedMalas,
    remainingMalas,
    todayCount,
    todayMalas,
    dailyGoal,
    remainingDaily,
    dailyGoalMet,
    currentStreak,
    longestStreak,
    activeDays,
    dailyAverage,
    yesterdayCount,
    weeklyTotal,
    monthlyTotal,
  };
}
