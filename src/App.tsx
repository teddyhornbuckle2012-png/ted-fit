import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Layout } from './components/Layout';
import { TodayPage } from './pages/TodayPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { db } from './db/schema';
import { WEEKLY_SCHEDULE } from './db/seed';
import { useAppStore } from './store/useAppStore';

// Onboarding modal for first launch
function OnboardingModal({ onComplete }: { onComplete: (anchor: string) => void }) {
  const [anchor, setAnchor] = useState('I get home from school');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10"
      >
        <div className="text-center mb-6">
          <div
            className="text-4xl font-black mb-2"
            style={{ color: '#4D8EA8' }}
          >
            ted fit
          </div>
          <h2 className="text-xl font-bold text-forge-dark">Welcome to Forge</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your personal training partner. Let's set up your habit anchor.
          </p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold text-forge-dark block mb-2">
            Finish this sentence:
          </label>
          <div className="flex items-center gap-2 bg-dulux-blueberry-white rounded-xl p-3 border border-dulux-quintessential-blue">
            <span className="text-sm text-gray-500 whitespace-nowrap">After</span>
            <input
              type="text"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              placeholder="I get home from school"
              className="flex-1 bg-transparent text-sm font-semibold text-forge-dark focus:outline-none"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Research shows connecting your workout to an existing habit makes it 3× more likely to stick.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-lg">📅</span>
            <div>
              <p className="text-sm font-semibold text-forge-dark">7-day weekly plan</p>
              <p className="text-xs text-gray-500">Push, Pull, Arms & Core + running built in</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-sm font-semibold text-forge-dark">Streak tracking</p>
              <p className="text-xs text-gray-500">With freeze protection so life doesn't break your chain</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📴</span>
            <div>
              <p className="text-sm font-semibold text-forge-dark">Offline-first</p>
              <p className="text-xs text-gray-500">Works without internet. Your data stays on your device.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onComplete(anchor)}
          className="w-full bg-forge-orange text-white font-bold py-4 rounded-2xl text-lg"
        >
          Start Training →
        </button>
      </motion.div>
    </motion.div>
  );
}

// Initialize DB with today's log and default settings
async function initializeDB() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const dayOfWeek = new Date().getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const scheduleDay = WEEKLY_SCHEDULE.find((d) => d.dayOfWeek === dayOfWeek);

  // Ensure today's log exists
  const existingLog = await db.dailyLogs.where('date').equals(todayStr).first();
  if (!existingLog && scheduleDay) {
    await db.dailyLogs.add({
      date: todayStr,
      checklistItems: scheduleDay.items.map((item) => ({
        scheduleItemId: item.id,
        label: item.label,
        completed: false,
        skipped: false,
      })),
      isRestDay: false,
      weeklyKmSoFar: 0,
      updatedAt: new Date().toISOString(),
    });
  }

  // Ensure streak state exists
  const existingStreak = await db.streakState.toCollection().first();
  if (!existingStreak) {
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
}

export default function App() {
  const { onboardingComplete, setOnboardingComplete, setAnchor } = useAppStore();
  const [dbReady, setDbReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const setup = async () => {
      // Check settings for onboarding
      const settings = await db.settings.toCollection().first();

      if (!settings || !settings.onboardingComplete) {
        setShowOnboarding(true);
      } else {
        setOnboardingComplete(true);
        setAnchor(settings.anchor);
      }

      await initializeDB();
      setDbReady(true);
    };

    setup().catch(console.error);
  }, [setOnboardingComplete, setAnchor]);

  const handleOnboardingComplete = async (anchor: string) => {
    setAnchor(anchor);
    setOnboardingComplete(true);
    setShowOnboarding(false);

    await db.settings.add({
      anchor,
      reminderTime: '16:30',
      reminderEnabled: true,
      theme: 'forge',
      onboardingComplete: true,
      weeklyKmTarget: 25,
      updatedAt: new Date().toISOString(),
    });
  };

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-forge-cream flex items-center justify-center">
        <div className="text-center">
          <div
            className="text-4xl font-black mb-2"
            style={{ color: '#4D8EA8' }}
          >
            ted fit
          </div>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showOnboarding && !onboardingComplete && (
          <OnboardingModal onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TodayPage />} />
          <Route path="workout" element={<WorkoutPage />} />
          <Route path="workout/:id" element={<WorkoutPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
