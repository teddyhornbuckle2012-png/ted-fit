export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'core' | 'legs' | 'rear-delts' | 'lats' | 'forearms';
export type Equipment = 'dumbbell' | 'machine' | 'bodyweight' | 'cable';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: MuscleGroup[];
  equipment: Equipment;
  defaultSets: number;
  repRange: string;
  tempo: string;
  cues: string[];
  commonMistakes: string[];
  animationKeyframes: string[];
  animationUrl: string | null;
}

export interface WorkoutDefinition {
  id: string;
  name: string;
  label: string;
  location: 'home' | 'gym';
  exerciseIds: string[];
  miniVersion: string[];
}

export interface ScheduleDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  items: ScheduleItem[];
}

export interface ScheduleItem {
  id: string;
  type: 'workout' | 'run' | 'rowing' | 'core' | 'mobility' | 'rest';
  label: string;
  optional: boolean;
  workoutId?: string;
  backupOptions?: BackupOption[];
  durationMinutes?: number;
  distanceKm?: number;
}

export interface BackupOption {
  label: string;
  type: 'run' | 'workout';
  workoutId?: string;
  distanceKm?: number;
}

export interface DailyLog {
  id?: number;
  date: string;
  checklistItems: ChecklistItemLog[];
  isRestDay: boolean;
  restReason?: 'rest' | 'sick' | 'injured';
  weeklyKmSoFar?: number;
  updatedAt: string;
}

export interface ChecklistItemLog {
  scheduleItemId: string;
  label: string;
  completed: boolean;
  skipped: boolean;
  backupUsed?: string;
  completedAt?: string;
}

export interface SetLog {
  id?: number;
  date: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  notes?: string;
  updatedAt: string;
}

export interface RunLog {
  id?: number;
  date: string;
  distanceKm: number;
  durationMinutes?: number;
  type: 'track' | 'easy' | 'parkrun' | 'rowing-backup';
  updatedAt: string;
}

export interface StreakState {
  id?: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  freezesAvailable: number;
  freezesUsed: number;
  totalDaysLogged: number;
  updatedAt: string;
}

export interface PersonalBest {
  id?: number;
  exerciseId: string;
  type: 'weight' | 'reps' | 'distance' | 'duration';
  value: number;
  date: string;
  updatedAt: string;
}

export interface UserSettings {
  id?: number;
  reminderTime: string;
  reminderEnabled: boolean;
  anchor: string;
  theme: 'forge' | 'dark';
  onboardingComplete: boolean;
  weeklyKmTarget: number;
  updatedAt: string;
}
