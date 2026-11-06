import { db, SANKALPA_TARGET } from '../db';
import { getTodayDateString } from '../utils/date';
import type { JapaBackupPayload, AppSettings, Sankalpa, DailySummary, Session, CountEvent, Mantra, Milestone } from '../types';

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Generates the full JSON backup payload
 */
export async function generateBackupData(): Promise<JapaBackupPayload> {
  const settings = (await db.settings.get('current_settings')) || {
    id: 'current_settings',
    language: 'en',
    theme: 'light',
    soundEnabled: true,
    vibrationEnabled: true,
    dailyGoal: 1000,
    activeMantraId: 'mantra-om-namah-shivaya',
    wakeLockEnabled: true,
  };

  const sankalpa = (await db.sankalpa.get('sankalpa-11-lakh')) || {
    id: 'sankalpa-11-lakh',
    targetCount: SANKALPA_TARGET,
    startDate: getTodayDateString(),
    targetDate: getTodayDateString(),
    createdAt: Date.now(),
  };

  const dailyHistory = await db.dailySummaries.toArray();
  const countEvents = await db.countEvents.toArray();
  const sessionHistory = await db.sessions.toArray();
  const mantraList = await db.mantras.toArray();
  const milestones = await db.milestones.toArray();

  const totalCount = countEvents.length;

  return {
    appName: 'Japa Sankalpa',
    backupCreationDate: new Date().toISOString(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    sankalpaTarget: SANKALPA_TARGET,
    sankalpa,
    completedRepetitions: totalCount,
    dailyHistory,
    countEvents,
    sessionHistory,
    mantraList,
    milestones,
    settings,
  };
}

/**
 * Downloads a string or blob as a file in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete JSON backup
 */
export async function exportJsonBackup(): Promise<string> {
  const backup = await generateBackupData();
  const jsonStr = JSON.stringify(backup, null, 2);
  const today = getTodayDateString();
  const filename = `japa-sankalpa-backup-${today}.json`;
  downloadFile(jsonStr, filename, 'application/json');

  // Update last backup date in settings
  await db.settings.update('current_settings', { lastBackupDate: today });

  // Record in backupMetadata
  await db.backupMetadata.add({
    id: `backup_${Date.now()}`,
    backupDate: new Date().toISOString(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    totalRepetitions: backup.completedRepetitions,
    sessionCount: backup.sessionHistory.length,
  });

  return filename;
}

/**
 * Exports Daily summaries as CSV
 */
export async function exportDailyCsv(): Promise<string> {
  const summaries = await db.dailySummaries.orderBy('date').toArray();
  const headers = ['Date', 'Repetitions', 'Malas', 'DurationSeconds', 'SessionsCount', 'GoalTarget', 'GoalMet'];
  const rows = summaries.map((s) => [
    s.date,
    s.count,
    s.malas,
    s.durationSeconds,
    s.sessionCount,
    s.goalTarget,
    s.goalMet ? 'Yes' : 'No',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const today = getTodayDateString();
  const filename = `japa-daily-history-${today}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  return filename;
}

/**
 * Exports Sessions history as CSV
 */
export async function exportSessionsCsv(): Promise<string> {
  const sessions = await db.sessions.orderBy('startTime').toArray();
  const headers = ['SessionId', 'Date', 'MantraName', 'StartTime', 'EndTime', 'DurationSeconds', 'Count', 'Malas', 'Status'];
  const rows = sessions.map((s) => [
    s.id,
    s.date,
    `"${(s.mantraName || '').replace(/"/g, '""')}"`,
    new Date(s.startTime).toISOString(),
    s.endTime ? new Date(s.endTime).toISOString() : '',
    s.durationSeconds,
    s.count,
    s.completedMalas,
    s.status,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const today = getTodayDateString();
  const filename = `japa-sessions-history-${today}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  return filename;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  payload?: JapaBackupPayload;
  summary?: {
    backupDate: string;
    totalRepetitions: number;
    sankalpaTarget: number;
    sessionCount: number;
    startDate: string;
  };
}

/**
 * Validates a parsed JSON backup object thoroughly
 */
export function validateBackupFile(data: any): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid JSON file content.' };
  }

  if (data.appName !== 'Japa Sankalpa') {
    return { isValid: false, error: 'File is not a valid Japa Sankalpa backup.' };
  }

  if (!data.schemaVersion || typeof data.schemaVersion !== 'number') {
    return { isValid: false, error: 'Unsupported or missing schema version.' };
  }

  if (data.sankalpaTarget !== SANKALPA_TARGET) {
    return { isValid: false, error: `Invalid Sankalpa target. Must be ${SANKALPA_TARGET}.` };
  }

  if (typeof data.completedRepetitions !== 'number' || data.completedRepetitions < 0) {
    return { isValid: false, error: 'Invalid completed repetitions count.' };
  }

  if (!Array.isArray(data.countEvents) || !Array.isArray(data.sessionHistory) || !Array.isArray(data.dailyHistory)) {
    return { isValid: false, error: 'Corrupt data tables in backup file.' };
  }

  // Validate ID duplicates in countEvents
  const idSet = new Set<string>();
  for (const ev of data.countEvents) {
    if (!ev.id || !ev.timestamp || !ev.date) {
      return { isValid: false, error: 'Corrupted count event records detected.' };
    }
    if (idSet.has(ev.id)) {
      return { isValid: false, error: 'Duplicate count event IDs detected in backup.' };
    }
    idSet.add(ev.id);
  }

  const startDate = data.sankalpa?.startDate || 'Unknown';

  return {
    isValid: true,
    payload: data as JapaBackupPayload,
    summary: {
      backupDate: data.backupCreationDate || 'Unknown',
      totalRepetitions: data.completedRepetitions,
      sankalpaTarget: data.sankalpaTarget,
      sessionCount: data.sessionHistory.length,
      startDate,
    },
  };
}

/**
 * Restores data atomically after safety-saving the existing local records
 */
export async function executeRestore(payload: JapaBackupPayload): Promise<void> {
  // 1. Safety backup of current records
  try {
    const currentBackup = await generateBackupData();
    const safetyFilename = `pre-restore-safety-backup-${getTodayDateString()}.json`;
    downloadFile(JSON.stringify(currentBackup, null, 2), safetyFilename, 'application/json');
  } catch (e) {
    console.warn('Safety backup before restore warning:', e);
  }

  // 2. Atomic IndexedDB replace transaction
  await db.transaction(
    'rw',
    [
      db.settings,
      db.sankalpa,
      db.mantras,
      db.sessions,
      db.countEvents,
      db.dailySummaries,
      db.milestones,
    ],
    async () => {
      // Clear all tables
      await Promise.all([
        db.settings.clear(),
        db.sankalpa.clear(),
        db.mantras.clear(),
        db.sessions.clear(),
        db.countEvents.clear(),
        db.dailySummaries.clear(),
        db.milestones.clear(),
      ]);

      // Insert restored data
      if (payload.settings) {
        await db.settings.put(payload.settings);
      }
      if (payload.sankalpa) {
        await db.sankalpa.put({
          ...payload.sankalpa,
          targetCount: SANKALPA_TARGET, // Fixed guarantee
        });
      }
      if (payload.mantraList?.length) {
        await db.mantras.bulkPut(payload.mantraList);
      }
      if (payload.sessionHistory?.length) {
        await db.sessions.bulkPut(payload.sessionHistory);
      }
      if (payload.countEvents?.length) {
        await db.countEvents.bulkPut(payload.countEvents);
      }
      if (payload.dailyHistory?.length) {
        await db.dailySummaries.bulkPut(payload.dailyHistory);
      }
      if (payload.milestones?.length) {
        await db.milestones.bulkPut(payload.milestones);
      }
    }
  );
}
