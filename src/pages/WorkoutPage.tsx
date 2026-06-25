import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { WORKOUT_MAP, EXERCISE_MAP, WORKOUTS } from '../db/seed';
import { db } from '../db/schema';
import { ExerciseCard } from '../components/ExerciseCard';
import { useAppStore } from '../store/useAppStore';
import { WorkoutCard } from '../components/WorkoutCard';
import clsx from 'clsx';

interface SetCounts {
  [exerciseId: string]: number;
}

export function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isMiniMode, setMiniMode } = useAppStore();
  const [setCounts, setSetCounts] = useState<SetCounts>({});
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const workout = id ? WORKOUT_MAP.get(id) : null;

  // Load most recent logged set per exercise for this workout
  const lastSets = useLiveQuery(async () => {
    if (!workout) return {};
    const allLogs = await db.setLogs
      .where('exerciseId')
      .anyOf(workout.exerciseIds)
      .toArray();
    const result: Record<string, { weightKg: number; reps: number; date: string }> = {};
    for (const log of allLogs) {
      if (!result[log.exerciseId] || log.date > result[log.exerciseId].date) {
        result[log.exerciseId] = { weightKg: log.weightKg, reps: log.reps, date: log.date };
      }
    }
    return result;
  }, [workout?.id]) ?? {};

  const exerciseIds = workout
    ? isMiniMode
      ? workout.miniVersion
      : workout.exerciseIds
    : [];

  const exercises = exerciseIds
    .map((eid) => EXERCISE_MAP.get(eid))
    .filter(Boolean) as NonNullable<ReturnType<typeof EXERCISE_MAP.get>>[];

  const totalSets = exercises.reduce((sum, ex) => sum + ex.defaultSets, 0);
  const completedSets = Object.values(setCounts).reduce((a, b) => a + b, 0);
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  const allDone =
    exercises.length > 0 &&
    exercises.every((ex) => (setCounts[ex.id] ?? 0) >= ex.defaultSets);

  const handleLogSet = useCallback(
    async (exerciseId: string, setNumber: number, reps: number, weightKg: number) => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');

      await db.setLogs.add({
        date: todayStr,
        exerciseId,
        setNumber,
        reps,
        weightKg,
        updatedAt: new Date().toISOString(),
      });

      // Check for personal best
      const existingBest = await db.personalBests
        .where('exerciseId')
        .equals(exerciseId)
        .and((pb) => pb.type === 'weight')
        .first();

      if (!existingBest || weightKg > existingBest.value) {
        if (existingBest) {
          await db.personalBests.update(existingBest.id!, {
            value: weightKg,
            date: todayStr,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await db.personalBests.add({
            exerciseId,
            type: 'weight',
            value: weightKg,
            date: todayStr,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      setSetCounts((prev) => ({
        ...prev,
        [exerciseId]: (prev[exerciseId] ?? 0) + 1,
      }));
    },
    []
  );

  const handleComplete = async () => {
    setWorkoutComplete(true);
    // Mark today's workout checklist item as complete
    if (workout) {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const log = await db.dailyLogs.where('date').equals(todayStr).first();
      if (log) {
        const updated = log.checklistItems.map((item) =>
          item.scheduleItemId.includes(workout.id.split('-')[1])
            ? { ...item, completed: true, completedAt: new Date().toISOString() }
            : item
        );
        await db.dailyLogs.update(log.id!, {
          checklistItems: updated,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  };

  // If no id, show workout library
  if (!id) {
    return (
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-black text-forge-dark mb-1">Workouts</h1>
        <p className="text-sm text-forge-text-muted mb-6">Pick a session to start</p>
        <div className="space-y-3">
          {WORKOUTS.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-gray-500">Workout not found.</p>
        <button
          onClick={() => navigate('/workout')}
          className="mt-4 text-forge-orange font-semibold"
        >
          ← Back
        </button>
      </div>
    );
  }

  if (workoutComplete) {
    return (
      <div className="px-4 pt-12 pb-4 max-w-lg mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-7xl mb-4"
        >
          🏆
        </motion.div>
        <h2 className="text-2xl font-black text-forge-dark mb-2">
          {workout.name} done!
        </h2>
        <p className="text-forge-text-muted mb-6">
          {isMiniMode ? '5-min version' : 'Full session'} complete. Great work.
        </p>
        <button
          onClick={() => navigate('/')}
          className="forge-btn-primary w-full max-w-xs"
        >
          Back to Today →
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-forge-text-muted text-lg"
        >
          ←
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-forge-orange">
              {workout.label}
            </span>
            {isMiniMode && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                5-min
              </span>
            )}
          </div>
          <h1 className="text-xl font-black text-forge-dark">{workout.name}</h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{completedSets} / {totalSets} sets</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full bg-orange-100 rounded-full h-2 overflow-hidden">
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full rounded-full bg-forge-orange"
          />
        </div>
      </div>

      {/* Warm-up reminder */}
      <div className="bg-forge-cream border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-forge-dark">
        <span className="font-semibold">Warm up first:</span> 3–5 min easy movement, then one light warm-up set of the first exercise.
      </div>

      {/* Mini mode toggle */}
      <button
        onClick={() => {
          setMiniMode(!isMiniMode);
          setSetCounts({});
        }}
        className={clsx(
          'w-full text-sm font-semibold py-2.5 rounded-xl mb-4 transition-colors',
          isMiniMode
            ? 'bg-forge-orange text-white'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        )}
      >
        {isMiniMode ? '📋 Switch to full workout' : '⚡ Too tired? 5-min version'}
      </button>

      {/* Exercise list */}
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            completedSets={setCounts[exercise.id] ?? 0}
            lastSet={lastSets[exercise.id] ?? null}
            onLogSet={(setNum, reps, weight) =>
              handleLogSet(exercise.id, setNum, reps, weight)
            }
          />
        ))}
      </div>

      {/* Complete button */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <button
              onClick={handleComplete}
              className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-lg"
            >
              🎉 Complete Workout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!allDone && completedSets > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={handleComplete}
            className="text-sm text-gray-400 underline"
          >
            Finish early
          </button>
        </div>
      )}
    </div>
  );
}
