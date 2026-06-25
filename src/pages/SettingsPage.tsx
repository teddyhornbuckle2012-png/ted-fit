import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { useAppStore } from '../store/useAppStore';

export function SettingsPage() {
  const { anchor, reminderTime, setAnchor, setReminderTime } = useAppStore();
  const [localAnchor, setLocalAnchor] = useState(anchor);
  const [localTime, setLocalTime] = useState(reminderTime);
  const [saved, setSaved] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);

  useEffect(() => {
    if (settings) {
      setLocalAnchor(settings.anchor);
      setLocalTime(settings.reminderTime);
      setReminderEnabled(settings.reminderEnabled);
    }
  }, [settings]);

  const handleSave = async () => {
    setAnchor(localAnchor);
    setReminderTime(localTime);

    const existing = await db.settings.toCollection().first();
    const now = new Date().toISOString();

    if (existing) {
      await db.settings.update(existing.id!, {
        anchor: localAnchor,
        reminderTime: localTime,
        reminderEnabled,
        updatedAt: now,
      });
    } else {
      await db.settings.add({
        anchor: localAnchor,
        reminderTime: localTime,
        reminderEnabled,
        theme: 'forge',
        onboardingComplete: true,
        weeklyKmTarget: 25,
        updatedAt: now,
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    if (!confirm('Reset all data? This cannot be undone.')) return;
    await db.dailyLogs.clear();
    await db.setLogs.clear();
    await db.runLogs.clear();
    await db.streakState.clear();
    await db.personalBests.clear();
    await db.settings.clear();
    window.location.reload();
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-black text-forge-dark mb-1">Settings</h1>
      <p className="text-sm text-forge-text-muted mb-6">Customise your Forge experience</p>

      {/* Reminder time */}
      <div className="forge-card mb-4">
        <h2 className="text-sm font-bold text-forge-dark mb-3">Daily Reminder</h2>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Enable reminder</span>
          <button
            onClick={() => setReminderEnabled((v) => !v)}
            className={`w-12 h-6 rounded-full transition-colors ${
              reminderEnabled ? 'bg-forge-orange' : 'bg-gray-200'
            }`}
          >
            <motion.div
              animate={{ x: reminderEnabled ? 24 : 2 }}
              className="w-5 h-5 bg-white rounded-full shadow"
            />
          </button>
        </div>
        {reminderEnabled && (
          <div>
            <label className="text-xs text-gray-500 block mb-1">Reminder time</label>
            <input
              type="time"
              value={localTime}
              onChange={(e) => setLocalTime(e.target.value)}
              className="w-full border border-dulux-quintessential-blue rounded-xl px-3 py-2 font-semibold text-forge-dark focus:outline-none focus:border-forge-orange"
            />
          </div>
        )}
      </div>

      {/* Anchor / implementation intention */}
      <div className="forge-card mb-4">
        <h2 className="text-sm font-bold text-forge-dark mb-1">Implementation Intention</h2>
        <p className="text-xs text-gray-500 mb-3">
          This appears on your Today screen to help you stay consistent.
        </p>
        <label className="text-xs text-gray-500 block mb-1">
          After I ___, I open Forge
        </label>
        <input
          type="text"
          value={localAnchor}
          onChange={(e) => setLocalAnchor(e.target.value)}
          placeholder="get home from school"
          className="w-full border border-dulux-quintessential-blue rounded-xl px-3 py-2 text-forge-dark focus:outline-none focus:border-forge-orange"
        />
        <p className="text-xs text-gray-400 mt-2">
          Preview: "At {localTime}, after {localAnchor || '…'}, I'll train."
        </p>
      </div>

      {/* Account (Phase 7 placeholder) */}
      <div className="forge-card mb-4 opacity-60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-forge-dark">Account & Sync</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            Phase 7
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email address"
            disabled
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-400 bg-gray-50 cursor-not-allowed"
          />
          <input
            type="password"
            placeholder="Password"
            disabled
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-400 bg-gray-50 cursor-not-allowed"
          />
          <button
            disabled
            className="w-full bg-gray-200 text-gray-400 rounded-xl py-2.5 font-semibold cursor-not-allowed"
          >
            Sign in with Supabase
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Cloud sync coming in Phase 7. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
        </p>
      </div>

      {/* Strava (placeholder) */}
      <div className="forge-card mb-4 opacity-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-forge-dark">Connect Strava</h2>
            <p className="text-xs text-gray-500">Auto-log runs from Strava</p>
          </div>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSave} className="forge-btn-primary w-full mb-4">
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>

      {/* App info */}
      <div className="text-center text-xs text-gray-400 space-y-1 mb-4">
        <p>Forge v0.1.0</p>
        <p>🔒 Forge is offline-first — your data lives on your device.</p>
      </div>

      {/* Danger zone */}
      <div className="forge-card border-red-100">
        <h2 className="text-sm font-bold text-red-500 mb-2">Danger Zone</h2>
        <button
          onClick={handleReset}
          className="w-full text-sm text-red-500 border border-red-200 rounded-xl py-2.5 font-semibold"
        >
          Reset all data
        </button>
      </div>
    </div>
  );
}
