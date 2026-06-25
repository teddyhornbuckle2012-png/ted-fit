import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useToday } from '../hooks/useToday';
import { useStreak } from '../hooks/useStreak';
import { useAppStore } from '../store/useAppStore';
import { ChecklistItem } from '../components/ChecklistItem';
import { StreakBadge } from '../components/StreakBadge';

const REST_MESSAGES = [
  "Rest is part of the plan.",
  "Muscle grows on rest days.",
  "Recovery is training too.",
];

const CONFETTI_COLORS = ['#DE7428', '#FCB53F', '#66C7CD', '#FBE49D', '#1A1A2E'];

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${Math.random() * 100}vw`,
            y: '-10px',
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: '110vh',
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.5 + Math.random() * 1.5,
            delay: Math.random() * 0.5,
            ease: 'easeIn',
          }}
          style={{
            position: 'fixed',
            width: 8 + Math.random() * 8,
            height: 8 + Math.random() * 8,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          }}
        />
      ))}
    </div>
  );
}

export function TodayPage() {
  const navigate = useNavigate();
  const {
    todayLog,
    checklistItems,
    scheduleDay,
    weeklyKm,
    allCompleted,
    markComplete,
    markSkip,
    swapRowingBackup,
    markRestDay,
  } = useToday();

  const { currentStreak, freezesAvailable, logActivityToday, totalDaysLogged } = useStreak();
  const {
    anchor,
    reminderTime,
    celebrationVisible,
    todayCompletionMessage,
    showCelebration,
    dismissCelebration,
  } = useAppStore();

  const todayStr = format(new Date(), 'EEEE, MMM d');
  const weeklyKmTarget = 25;
  const weeklyProgress = Math.min(1, weeklyKm / weeklyKmTarget);
  const restMessage = REST_MESSAGES[new Date().getDay() % REST_MESSAGES.length];

  // First workout item for the implementation intention banner
  const firstWorkoutItem = scheduleDay?.items.find((i) => i.type === 'workout');
  const workoutLabel = firstWorkoutItem?.label ?? scheduleDay?.items[0]?.label ?? "today's workout";

  // Trigger celebration when all required items are done
  useEffect(() => {
    if (allCompleted && !celebrationVisible) {
      showCelebration();
      logActivityToday();
    }
  }, [allCompleted, celebrationVisible, showCelebration, logActivityToday]);

  const handleComplete = async (scheduleItemId: string) => {
    await markComplete(scheduleItemId);
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <AnimatePresence>{celebrationVisible && <Confetti />}</AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: '#DE7428' }}
          >
            ted fit
          </h1>
          <p className="text-sm text-forge-text-muted font-medium">{todayStr}</p>
        </div>
        <StreakBadge streak={currentStreak} />
      </div>

      {/* Implementation intention banner */}
      {!todayLog?.isRestDay && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 mb-4"
        >
          <p className="text-xs font-semibold text-forge-orange uppercase tracking-wider mb-1">
            Today's intention
          </p>
          <p className="text-sm text-forge-dark leading-relaxed">
            At <span className="font-bold">{reminderTime}</span>, after{' '}
            <span className="font-bold">{anchor}</span>, I'll do{' '}
            <span className="font-bold">{workoutLabel}</span>.
          </p>
        </motion.div>
      )}

      {/* Celebration overlay */}
      <AnimatePresence>
        {celebrationVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-br from-forge-orange to-forge-amber rounded-2xl p-5 mb-4 text-white text-center"
          >
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-lg">{todayCompletionMessage}</p>
            {totalDaysLogged >= 7 && (
              <p className="text-sm text-orange-100 mt-1">
                That's {totalDaysLogged} sessions — you're someone who trains.
              </p>
            )}
            <button
              onClick={dismissCelebration}
              className="mt-3 bg-white bg-opacity-20 rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Keep going ✨
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest day state */}
      {todayLog?.isRestDay ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-4 text-center"
        >
          <div className="text-3xl mb-2">😴</div>
          <p className="font-bold text-teal-700">{restMessage}</p>
          <p className="text-sm text-teal-500 mt-1">Rest day logged. Streak preserved.</p>
        </motion.div>
      ) : (
        <>
          {/* Checklist */}
          <div className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              {scheduleDay?.label ?? 'Today'} — Checklist
            </h2>
            <div className="space-y-3">
              {scheduleDay?.items.map((scheduleItem) => {
                const logItem = checklistItems.find(
                  (ci) => ci.scheduleItemId === scheduleItem.id
                );
                if (!logItem) return null;
                return (
                  <ChecklistItem
                    key={scheduleItem.id}
                    item={logItem}
                    scheduleItem={scheduleItem}
                    onComplete={() => handleComplete(scheduleItem.id)}
                    onSkip={() => markSkip(scheduleItem.id)}
                    onSwapBackup={(label) => swapRowingBackup(scheduleItem.id, label)}
                    onNavigateWorkout={(wId) => navigate(`/workout/${wId}`)}
                  />
                );
              })}
            </div>
          </div>

          {/* Rest day button */}
          <button
            onClick={() => markRestDay('rest')}
            className="w-full text-sm text-gray-400 py-3 border border-dashed border-gray-200 rounded-2xl mb-4 hover:border-teal-300 hover:text-teal-500 transition-colors"
          >
            😴 Mark today as rest day
          </button>
        </>
      )}

      {/* Weekly km progress */}
      <div className="bg-white border border-orange-100 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-forge-dark">Weekly km</span>
          <span className="text-sm font-bold text-forge-orange">
            {weeklyKm.toFixed(1)} / {weeklyKmTarget} km
          </span>
        </div>
        <div className="w-full bg-orange-100 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weeklyProgress * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(to right, #DE7428, #FCB53F)' }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {weeklyKm >= weeklyKmTarget
            ? "🎯 Weekly target hit!"
            : `${(weeklyKmTarget - weeklyKm).toFixed(1)} km to go`}
        </p>
      </div>

      {/* Streak freeze badge */}
      {freezesAvailable > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-blue-500 bg-blue-50 rounded-xl px-3 py-2 mb-4"
        >
          <span>❄️</span>
          <span>
            {freezesAvailable} streak freeze{freezesAvailable !== 1 ? 's' : ''} available
          </span>
        </motion.div>
      )}

      {/* Identity line */}
      {currentStreak >= 7 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2"
        >
          <p className="text-sm text-forge-text-muted italic">
            That's {currentStreak} sessions — you're someone who trains.
          </p>
        </motion.div>
      )}
    </div>
  );
}
