import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, startOfWeek, eachDayOfInterval, endOfWeek } from 'date-fns';
import { db } from '../db/schema';
import { SCHEDULE_MAP } from '../db/seed';
import type { DailyLog, ChecklistItemLog } from '../types';

function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function useToday() {
  const todayStr = getTodayStr();
  const dayOfWeek = new Date().getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const scheduleDay = SCHEDULE_MAP.get(dayOfWeek);
  const [isLoading, setIsLoading] = useState(false);

  const todayLog = useLiveQuery(async () => {
    return db.dailyLogs.where('date').equals(todayStr).first();
  }, [todayStr]);

  // Weekly km from run logs this week
  const weeklyKm = useLiveQuery(async () => {
    const days = eachDayOfInterval({
      start: startOfWeek(new Date(), { weekStartsOn: 1 }),
      end: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }).map((d) => format(d, 'yyyy-MM-dd'));

    const logs = await db.runLogs.where('date').anyOf(days).toArray();
    return logs.reduce((sum, l) => sum + l.distanceKm, 0);
  }, []) ?? 0;

  // Ensure today's log exists
  const ensureTodayLog = useCallback(async (): Promise<DailyLog> => {
    const existing = await db.dailyLogs.where('date').equals(todayStr).first();
    if (existing) return existing;

    const items: ChecklistItemLog[] = (scheduleDay?.items ?? []).map((item) => ({
      scheduleItemId: item.id,
      label: item.label,
      completed: false,
      skipped: false,
    }));

    const newLog: DailyLog = {
      date: todayStr,
      checklistItems: items,
      isRestDay: false,
      weeklyKmSoFar: 0,
      updatedAt: new Date().toISOString(),
    };
    await db.dailyLogs.add(newLog);
    return newLog;
  }, [todayStr, scheduleDay]);

  const markComplete = useCallback(
    async (scheduleItemId: string) => {
      setIsLoading(true);
      try {
        const log = await ensureTodayLog();
        const updated: ChecklistItemLog[] = log.checklistItems.map((item) =>
          item.scheduleItemId === scheduleItemId
            ? { ...item, completed: true, skipped: false, completedAt: new Date().toISOString() }
            : item
        );
        await db.dailyLogs.update(log.id!, {
          checklistItems: updated,
          updatedAt: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [ensureTodayLog]
  );

  const markSkip = useCallback(
    async (scheduleItemId: string) => {
      setIsLoading(true);
      try {
        const log = await ensureTodayLog();
        const updated: ChecklistItemLog[] = log.checklistItems.map((item) =>
          item.scheduleItemId === scheduleItemId
            ? { ...item, skipped: true, completed: false }
            : item
        );
        await db.dailyLogs.update(log.id!, {
          checklistItems: updated,
          updatedAt: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [ensureTodayLog]
  );

  const swapRowingBackup = useCallback(
    async (scheduleItemId: string, backupLabel: string) => {
      setIsLoading(true);
      try {
        const log = await ensureTodayLog();
        const updated: ChecklistItemLog[] = log.checklistItems.map((item) =>
          item.scheduleItemId === scheduleItemId
            ? {
                ...item,
                backupUsed: backupLabel,
                completed: true,
                completedAt: new Date().toISOString(),
              }
            : item
        );
        await db.dailyLogs.update(log.id!, {
          checklistItems: updated,
          updatedAt: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [ensureTodayLog]
  );

  const markRestDay = useCallback(
    async (reason: 'rest' | 'sick' | 'injured' = 'rest') => {
      setIsLoading(true);
      try {
        const log = await ensureTodayLog();
        await db.dailyLogs.update(log.id!, {
          isRestDay: true,
          restReason: reason,
          updatedAt: new Date().toISOString(),
        });

        // Update streak — rest day counts as active
        const streak = await db.streakState.toCollection().first();
        if (streak) {
          const yesterday = format(
            new Date(Date.now() - 86400000),
            'yyyy-MM-dd'
          );
          const isConsecutive =
            streak.lastActiveDate === yesterday ||
            streak.lastActiveDate === todayStr;
          await db.streakState.update(streak.id!, {
            currentStreak: isConsecutive ? streak.currentStreak + 1 : 1,
            longestStreak: Math.max(
              streak.longestStreak,
              isConsecutive ? streak.currentStreak + 1 : 1
            ),
            lastActiveDate: todayStr,
            totalDaysLogged: streak.totalDaysLogged + 1,
            updatedAt: new Date().toISOString(),
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [ensureTodayLog, todayStr]
  );

  const checklistItems = todayLog?.checklistItems ?? [];
  const scheduleItems = scheduleDay?.items ?? [];
  const allRequired = checklistItems.filter((item) => {
    const sched = scheduleItems.find((s) => s.id === item.scheduleItemId);
    return sched && !sched.optional;
  });
  const allCompleted =
    allRequired.length > 0 && allRequired.every((item) => item.completed || item.skipped);

  return {
    todayLog,
    checklistItems,
    scheduleDay,
    weeklyKm,
    allCompleted,
    isLoading,
    markComplete,
    markSkip,
    swapRowingBackup,
    markRestDay,
    ensureTodayLog,
  };
}
