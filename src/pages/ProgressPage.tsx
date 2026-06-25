import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import {
  format,
  subWeeks,
  startOfWeek,
  eachDayOfInterval,
  endOfWeek,
  eachWeekOfInterval,
  differenceInCalendarDays,
} from 'date-fns';
import { db } from '../db/schema';
import { EXERCISE_MAP } from '../db/seed';
import clsx from 'clsx';

const WEEKS_SHOWN = 8;

function CalendarGrid() {
  const today = new Date();
  const start = subWeeks(startOfWeek(today, { weekStartsOn: 1 }), WEEKS_SHOWN - 1);
  const weeks = eachWeekOfInterval(
    { start, end: endOfWeek(today, { weekStartsOn: 1 }) },
    { weekStartsOn: 1 }
  );

  const dailyLogs = useLiveQuery(() => db.dailyLogs.toArray(), []);
  const logMap = new Map(dailyLogs?.map((l) => [l.date, l]) ?? []);

  const todayStr = format(today, 'yyyy-MM-dd');

  const getDayColor = (dateStr: string) => {
    const log = logMap.get(dateStr);
    const isFuture = differenceInCalendarDays(new Date(dateStr), today) > 0;
    if (isFuture) return 'bg-gray-100';
    if (!log) return 'bg-gray-200';
    if (log.isRestDay) return 'bg-forge-teal';
    const hasCompleted = log.checklistItems.some((i) => i.completed);
    if (hasCompleted) return 'bg-forge-orange';
    return 'bg-gray-200';
  };

  return (
    <div>
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-400 font-medium">
            {d}
          </div>
        ))}
      </div>
      {/* Weeks */}
      {weeks.map((weekStart, wi) => {
        const days = eachDayOfInterval({
          start: weekStart,
          end: endOfWeek(weekStart, { weekStartsOn: 1 }),
        });
        return (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isToday = dateStr === todayStr;
              return (
                <motion.div
                  key={dateStr}
                  whileTap={{ scale: 0.8 }}
                  className={clsx(
                    'aspect-square rounded-md',
                    getDayColor(dateStr),
                    isToday && 'ring-2 ring-forge-amber ring-offset-1'
                  )}
                />
              );
            })}
          </div>
        );
      })}
      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-forge-orange" /> Completed
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-forge-teal" /> Rest
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-200" /> Missed
        </div>
      </div>
    </div>
  );
}

function WeeklyKmChart() {
  const WEEKS = 6;
  const today = new Date();

  const weeklyData = useLiveQuery(async () => {
    const results: { label: string; km: number }[] = [];
    for (let i = WEEKS - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).map((d) =>
        format(d, 'yyyy-MM-dd')
      );
      const logs = await db.runLogs.where('date').anyOf(days).toArray();
      const km = logs.reduce((sum, l) => sum + l.distanceKm, 0);
      results.push({ label: format(weekStart, 'MMM d'), km });
    }
    return results;
  }, []);

  const maxKm = Math.max(25, ...(weeklyData?.map((w) => w.km) ?? []));

  return (
    <div>
      <div className="flex items-end gap-2 h-28">
        {(weeklyData ?? Array.from({ length: WEEKS }, () => ({ label: '', km: 0 }))).map(
          (week, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(week.km / maxKm) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="w-full rounded-t-md"
                style={{
                  background:
                    week.km >= 25
                      ? 'linear-gradient(to top, #E8873A, #F5A623)'
                      : 'linear-gradient(to top, #FED7AA, #E8873A)',
                  minHeight: week.km > 0 ? 4 : 0,
                }}
              />
            </div>
          )
        )}
      </div>
      {/* Target line */}
      <div className="relative -mt-28 h-28 pointer-events-none">
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-forge-amber opacity-50"
          style={{ bottom: `${(25 / maxKm) * 100}%` }}
        />
      </div>
      <div className="flex gap-2 mt-1">
        {(weeklyData ?? []).map((week, i) => (
          <div key={i} className="flex-1 text-center text-xs text-gray-400 truncate">
            {week.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonalBestsTable() {
  const bests = useLiveQuery(() => db.personalBests.toArray(), []);

  if (!bests?.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        Log sets during workouts to see personal bests.
      </p>
    );
  }

  const grouped = bests.reduce<Record<string, typeof bests>>((acc, pb) => {
    if (!acc[pb.exerciseId]) acc[pb.exerciseId] = [];
    acc[pb.exerciseId].push(pb);
    return acc;
  }, {});

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([exId, records]) => {
        const exercise = EXERCISE_MAP.get(exId);
        if (!exercise) return null;
        const best = records.find((r) => r.type === 'weight');
        return (
          <div
            key={exId}
            className="flex items-center justify-between py-2 border-b border-dulux-blueberry-white last:border-0"
          >
            <span className="text-sm text-forge-dark font-medium">{exercise.name}</span>
            {best && (
              <span className="text-sm font-bold text-forge-orange">
                {best.value} kg
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ProgressPage() {
  const streak = useLiveQuery(() => db.streakState.toCollection().first(), []);
  const longestStreak = streak?.longestStreak ?? 0;
  const totalSessions = streak?.totalDaysLogged ?? 0;

  // Deload suggestion: if last deload was 4+ weeks ago (simplified: if 28+ sessions without reset)
  const showDeload = totalSessions > 0 && totalSessions % 28 >= 24;

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-black text-forge-dark mb-1">Progress</h1>
      <p className="text-sm text-forge-text-muted mb-6">Your consistency story</p>

      {/* Identity stat */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-forge-orange to-forge-amber rounded-2xl p-4 text-white mb-5"
      >
        <div className="text-4xl font-black">{totalSessions}</div>
        <div className="text-sm font-medium opacity-90">total sessions logged</div>
        <div className="text-xs opacity-75 mt-1">
          {totalSessions >= 30
            ? "You've built a real habit. Keep the chain going."
            : totalSessions >= 7
            ? "One week in — the foundation is forming."
            : "Every session counts. Keep showing up."}
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="forge-card text-center">
          <div className="text-2xl font-black text-forge-orange">{streak?.currentStreak ?? 0}</div>
          <div className="text-xs text-gray-500">current streak 🔥</div>
        </div>
        <div className="forge-card text-center">
          <div className="text-2xl font-black text-forge-orange">{longestStreak}</div>
          <div className="text-xs text-gray-500">longest streak</div>
        </div>
      </div>

      {/* Deload suggestion */}
      {showDeload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-5"
        >
          <h3 className="font-semibold text-teal-700 text-sm mb-1">💆 Deload suggestion</h3>
          <p className="text-xs text-teal-600">
            You've been training hard for 4+ weeks. Consider a lighter deload week — reduce
            weight by 40%, keep the reps. It's not weakness, it's periodisation.
          </p>
        </motion.div>
      )}

      {/* Calendar */}
      <div className="forge-card mb-5">
        <h2 className="text-sm font-bold text-forge-dark mb-3">Consistency Calendar</h2>
        <CalendarGrid />
      </div>

      {/* Weekly km chart */}
      <div className="forge-card mb-5">
        <h2 className="text-sm font-bold text-forge-dark mb-3">Weekly km (target: 25)</h2>
        <WeeklyKmChart />
      </div>

      {/* Personal bests */}
      <div className="forge-card">
        <h2 className="text-sm font-bold text-forge-dark mb-3">Personal Bests</h2>
        <PersonalBestsTable />
      </div>
    </div>
  );
}
