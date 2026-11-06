import Dexie, { type Table } from 'dexie';
import type {
  Mantra,
  Sankalpa,
  Session,
  CountEvent,
  DailySummary,
  Milestone,
  AppSettings,
  BackupMetadata,
} from '../types';

export class JapaDatabase extends Dexie {
  settings!: Table<AppSettings, string>;
  sankalpa!: Table<Sankalpa, string>;
  mantras!: Table<Mantra, string>;
  sessions!: Table<Session, string>;
  countEvents!: Table<CountEvent, string>;
  dailySummaries!: Table<DailySummary, string>;
  milestones!: Table<Milestone, string>;
  backupMetadata!: Table<BackupMetadata, string>;

  constructor() {
    super('JapaSankalpaDB');
    this.version(1).stores({
      settings: 'id',
      sankalpa: 'id',
      mantras: 'id, isDefault, totalCount',
      sessions: 'id, mantraId, startTime, date, status',
      countEvents: 'id, sessionId, mantraId, timestamp, date',
      dailySummaries: 'date, count, goalMet',
      milestones: 'id, targetCount, reached',
      backupMetadata: 'id, backupDate',
    });
  }
}

export const db = new JapaDatabase();

export const SANKALPA_TARGET = 1100000;
export const MALA_BEADS = 108;

export const DEFAULT_MANTRAS: Omit<Mantra, 'totalCount'>[] = [
  {
    id: 'mantra-om-namah-shivaya',
    name: 'ॐ नमः शिवाय',
    translation: 'Om Namah Shivaya',
    language: 'sa',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'mantra-sri-rama',
    name: 'శ్రీ రామ జయ రామ జయ జయ రామ',
    translation: 'Sri Rama Jaya Rama Jaya Jaya Rama',
    language: 'te',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'mantra-hare-krishna',
    name: 'హరే కృష్ణ హరే కృష్ణ',
    translation: 'Hare Krishna Hare Krishna',
    language: 'te',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'mantra-om-namo-bhagavate',
    name: 'ఓం నమో భగవతే వాసుదేవాయ',
    translation: 'Om Namo Bhagavate Vasudevaya',
    language: 'te',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'mantra-sri-gurudeva-datta',
    name: 'శ్రీ గురుదేవ దత్త',
    translation: 'Sri Gurudeva Datta',
    language: 'te',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'mantra-gayatri',
    name: 'గాయత్రీ మంత్రం',
    translation: 'Gayatri Mantra',
    language: 'te',
    isDefault: true,
    createdAt: Date.now(),
  },
];

export const DEFAULT_MILESTONES: { id: string; targetCount: number; label: string }[] = [
  { id: 'm-10k', targetCount: 10000, label: '10,000' },
  { id: 'm-50k', targetCount: 50000, label: '50,000' },
  { id: 'm-100k', targetCount: 100000, label: '1,00,000 (1 Lakh)' },
  { id: 'm-250k', targetCount: 250000, label: '2,50,000 (2.5 Lakh)' },
  { id: 'm-500k', targetCount: 500000, label: '5,00,000 (5 Lakh)' },
  { id: 'm-750k', targetCount: 750000, label: '7,50,000 (7.5 Lakh)' },
  { id: 'm-1000k', targetCount: 1000000, label: '10,00,000 (10 Lakh)' },
  { id: 'm-1100k', targetCount: 1100000, label: '11,00,000 (11 Lakh Purna)' },
];
