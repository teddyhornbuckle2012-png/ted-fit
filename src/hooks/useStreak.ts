import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, differenceInCalendarDays } from 'date-fns';
import { db } from '../db/schema';

function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function getYesterdayStr(): string {
  return format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
}

export function useStreak() {
  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();

  const streakState = useLiveQuery(async () => {
    return db.streakState.toCollection().first();
  }, []);

  // Initialize streak state if not present
  useEffect(() => {
    const init = async () => {
      const existing = await db.streakState.toCollection().first();
      if (!existing) {
        await db.streakState.add({
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: '',
          freezesAvailable: 1,
          freezesUsed: 0,
          totalDaysLogged: 0,
          updatedAt: new Date().toISOString(),
        });
      }
    };
    init();
  }, []);

  // Auto-check streak on app open
  useEffect(() => {
    const checkStreak = async () => {
      const streak = await db.streakState.toCollection().first();
      if (!streak) return;

      const lastActive = streak.lastActiveDate;
      if (!lastActive || lastActive === todayStr) return;

      const daysSince = differenceInCalendarDays(
        new Date(todayStr),
        new Date(lastActive)
      );

      if (daysSince === 1) {
        // Yesterday was logged — streak is fine, nothing to do yet
        return;
      }

      if (daysSince === 2) {
        // Yesterday was missed — try to use a freeze
        if (streak.freezesAvailable > 0) {
          await db.streakState.update(streak.id!, {
            freezesAvailable: streak.freezesAvailable - 1,
            freezesUsed: streak.freezesUsed + 1,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // No freezes — reset streak
          await db.streakState.update(streak.id!, {
            currentStreak: 0,
            updatedAt: new Date().toISOString(),
          });
        }
        return;
      }

      if (daysSince > 2) {
        // Multiple days missed — reset streak
        await db.streakState.update(streak.id!, {
          currentStreak: 0,
          updatedAt: new Date().toISOString(),
        });
      }
    };

    checkStreak();
  }, [todayStr]);

  // Auto-earn freeze every 7 days (max 2)
  useEffect(() => {
    const checkFreezeEarn = async () => {
      const streak = await db.streakState.toCollection().first();
      if (!streak) return;
      if (streak.currentStreak > 0 && streak.currentStreak % 7 === 0) {
        if (streak.freezesAvailable < 2) {
          await db.streakState.update(streak.id!, {
            freezesAvailable: Math.min(2, streak.freezesAvailable + 1),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    };
    checkFreezeEarn();
  }, [streakState?.currentStreak]);

  const logActivityToday = async () => {
    const streak = await db.streakState.toCollection().first();
    if (!streak) return;

    if (streak.lastActiveDate === todayStr) return; // Already logged today

    const lastActive = streak.lastActiveDate;
    const daysSince = lastActive
      ? differenceInCalendarDays(new Date(todayStr), new Date(lastActive))
      : 999;

    const newStreak = daysSince <= 2 ? streak.currentStreak + 1 : 1;
    const newLongest = Math.max(streak.longestStreak, newStreak);

    await db.streakState.update(streak.id!, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: todayStr,
      totalDaysLogged: streak.totalDaysLogged + 1,
      updatedAt: new Date().toISOString(),
    });
  };

  const streakAtRisk =
    streakState?.lastActiveDate === yesterdayStr &&
    streakState?.freezesAvailable === 0;

  return {
    currentStreak: streakState?.currentStreak ?? 0,
    longestStreak: streakState?.longestStreak ?? 0,
    freezesAvailable: streakState?.freezesAvailable ?? 1,
    totalDaysLogged: streakState?.totalDaysLogged ?? 0,
    streakAtRisk,
    logActivityToday,
  };
}
