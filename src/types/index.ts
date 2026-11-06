export interface Mantra {
  id: string;
  name: string; // The mantra text (e.g. ॐ नमः शिवाय)
  translation?: string;
  language: 'sa' | 'te' | 'hi' | 'en';
  isDefault: boolean;
  totalCount: number;
  createdAt: number;
}

export interface Sankalpa {
  id: string; // 'sankalpa-11-lakh'
  targetCount: number; // Always 1,100,000
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  createdAt: number;
  completedAt?: number;
}

export interface Session {
  id: string;
  mantraId: string;
  mantraName: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  count: number;
  completedMalas: number;
  status: 'active' | 'paused' | 'completed';
  date: string; // YYYY-MM-DD
}

export interface CountEvent {
  id: string;
  sessionId: string;
  mantraId: string;
  timestamp: number;
  delta: 1 | -1; // 1 for repetition, -1 for undo
  date: string; // YYYY-MM-DD
}

export interface DailySummary {
  date: string; // Primary key: YYYY-MM-DD
  count: number;
  malas: number;
  durationSeconds: number;
  sessionCount: number;
  goalMet: boolean;
  goalTarget: number;
  updatedAt: number;
}

export interface Milestone {
  id: string;
  targetCount: number;
  label: string;
  reached: boolean;
  reachedAt?: number;
}

export interface AppSettings {
  id: 'current_settings';
  language: 'en' | 'te' | 'hi';
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  dailyGoal: number; // e.g. 1000, 2000, etc.
  activeMantraId: string;
  wakeLockEnabled: boolean;
  lastBackupDate?: string;
}

export interface BackupMetadata {
  id: string;
  backupDate: string;
  schemaVersion: number;
  totalRepetitions: number;
  sessionCount: number;
  notes?: string;
}

export interface JapaBackupPayload {
  appName: 'Japa Sankalpa';
  backupCreationDate: string;
  schemaVersion: number;
  sankalpaTarget: number; // 1,100,000
  sankalpa: Sankalpa;
  completedRepetitions: number;
  dailyHistory: DailySummary[];
  countEvents: CountEvent[];
  sessionHistory: Session[];
  mantraList: Mantra[];
  milestones: Milestone[];
  settings: AppSettings;
}
