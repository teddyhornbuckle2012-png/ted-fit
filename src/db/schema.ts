import Dexie, { type Table } from 'dexie';
import type { DailyLog, SetLog, RunLog, StreakState, PersonalBest, UserSettings } from '../types';

export class ForgeDB extends Dexie {
  dailyLogs!: Table<DailyLog>;
  setLogs!: Table<SetLog>;
  runLogs!: Table<RunLog>;
  streakState!: Table<StreakState>;
  personalBests!: Table<PersonalBest>;
  settings!: Table<UserSettings>;

  constructor() {
    super('ForgeDB');
    this.version(1).stores({
      dailyLogs: '++id, date, updatedAt',
      setLogs: '++id, date, exerciseId, updatedAt',
      runLogs: '++id, date, updatedAt',
      streakState: '++id',
      personalBests: '++id, exerciseId, type, updatedAt',
      settings: '++id',
    });
  }
}

export const db = new ForgeDB();
