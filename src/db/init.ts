import { db, DEFAULT_MANTRAS, DEFAULT_MILESTONES, SANKALPA_TARGET } from './index';
import { getTodayDateString, addDays } from '../utils/date';
import type { AppSettings, Sankalpa } from '../types';

export async function initDatabase(): Promise<void> {
  // Check settings
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    const defaultSettings: AppSettings = {
      id: 'current_settings',
      language: 'en',
      theme: 'light',
      soundEnabled: true,
      vibrationEnabled: true,
      dailyGoal: 1000,
      activeMantraId: DEFAULT_MANTRAS[0].id,
      wakeLockEnabled: true,
    };
    await db.settings.put(defaultSettings);
  }

  // Check sankalpa
  const sankalpaCount = await db.sankalpa.count();
  if (sankalpaCount === 0) {
    const today = getTodayDateString();
    const defaultSankalpa: Sankalpa = {
      id: 'sankalpa-11-lakh',
      targetCount: SANKALPA_TARGET,
      startDate: today,
      targetDate: addDays(today, 365), // Default 1 year preset
      createdAt: Date.now(),
    };
    await db.sankalpa.put(defaultSankalpa);
  }

  // Check mantras
  const mantrasCount = await db.mantras.count();
  if (mantrasCount === 0) {
    const mantrasWithCount = DEFAULT_MANTRAS.map((m) => ({
      ...m,
      totalCount: 0,
    }));
    await db.mantras.bulkPut(mantrasWithCount);
  }

  // Check milestones
  const milestonesCount = await db.milestones.count();
  if (milestonesCount === 0) {
    const milestones = DEFAULT_MILESTONES.map((m) => ({
      ...m,
      reached: false,
    }));
    await db.milestones.bulkPut(milestones);
  }
}
