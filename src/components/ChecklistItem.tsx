import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import type { ChecklistItemLog, ScheduleItem } from '../types';

interface ChecklistItemProps {
  item: ChecklistItemLog;
  scheduleItem: ScheduleItem;
  onComplete: () => void;
  onSkip: () => void;
  onSwapBackup?: (backupLabel: string) => void;
  onNavigateWorkout?: (workoutId: string) => void;
}

export function ChecklistItem({
  item,
  scheduleItem,
  onComplete,
  onSkip,
  onSwapBackup,
  onNavigateWorkout,
}: ChecklistItemProps) {
  const [showRowingOptions, setShowRowingOptions] = useState(false);
  const isRowingType = scheduleItem.type === 'rowing';
  const isWorkout = scheduleItem.type === 'workout';

  const handleTap = () => {
    if (item.completed || item.skipped) return;

    if (isRowingType) {
      setShowRowingOptions(true);
      return;
    }

    if (isWorkout && scheduleItem.workoutId && onNavigateWorkout) {
      onNavigateWorkout(scheduleItem.workoutId);
      return;
    }

    onComplete();
  };

  const typeIcon = () => {
    switch (scheduleItem.type) {
      case 'workout': return '🏋️';
      case 'run': return '🏃';
      case 'rowing': return '🚣';
      case 'core': return '🔥';
      case 'mobility': return '🧘';
      case 'rest': return '😴';
      default: return '✓';
    }
  };

  const typeBadgeColor = () => {
    switch (scheduleItem.type) {
      case 'workout': return 'bg-dulux-mineral-mist text-dulux-stonewashed-blue';
      case 'run': return 'bg-dulux-blissful-blue text-dulux-vast-lake';
      case 'rowing': return 'bg-blue-100 text-blue-700';
      case 'core': return 'bg-red-100 text-red-700';
      case 'mobility': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'rounded-2xl border p-4 transition-colors duration-200',
        item.completed
          ? 'bg-green-50 border-green-200'
          : item.skipped
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : 'bg-white border-dulux-mineral-mist shadow-sm'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleTap}
          disabled={item.completed || item.skipped}
          className={clsx(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            item.completed
              ? 'bg-green-500 border-green-500'
              : item.skipped
              ? 'bg-gray-300 border-gray-300'
              : 'border-dulux-quintessential-blue hover:border-forge-orange'
          )}
        >
          <AnimatePresence>
            {item.completed && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-white text-sm font-bold"
              >
                ✓
              </motion.span>
            )}
            {item.skipped && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-gray-500 text-xs"
              >
                –
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                'font-semibold text-sm',
                item.completed ? 'text-green-700 line-through' : 'text-forge-dark'
              )}
            >
              {item.label}
            </span>
            {scheduleItem.optional && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                optional
              </span>
            )}
          </div>

          {/* Type badge */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className={clsx(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                typeBadgeColor()
              )}
            >
              {typeIcon()} {scheduleItem.type}
            </span>
            {scheduleItem.distanceKm && (
              <span className="text-xs text-gray-500">{scheduleItem.distanceKm}km</span>
            )}
            {scheduleItem.durationMinutes && (
              <span className="text-xs text-gray-500">{scheduleItem.durationMinutes}min</span>
            )}
          </div>

          {/* Backup used */}
          {item.backupUsed && (
            <span className="text-xs text-dulux-sky-view mt-1 block">
              ✓ {item.backupUsed}
            </span>
          )}
        </div>

        {/* Right action */}
        {!item.completed && !item.skipped && isWorkout && scheduleItem.workoutId && (
          <button
            onClick={() => onNavigateWorkout?.(scheduleItem.workoutId!)}
            className="text-forge-orange font-semibold text-sm shrink-0"
          >
            Start →
          </button>
        )}
      </div>

      {/* Rowing swap options */}
      <AnimatePresence>
        {showRowingOptions && !item.completed && !item.skipped && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <p className="text-xs text-gray-500 font-medium">How did it go?</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    onComplete();
                    setShowRowingOptions(false);
                  }}
                  className="flex-1 bg-dulux-nordic-sky text-white text-sm font-semibold py-2 px-3 rounded-xl"
                >
                  Did it ✅
                </button>
                {scheduleItem.backupOptions?.map((backup) => (
                  <button
                    key={backup.label}
                    onClick={() => {
                      onSwapBackup?.(backup.label);
                      setShowRowingOptions(false);
                    }}
                    className="flex-1 bg-dulux-mineral-mist text-dulux-stonewashed-blue text-sm font-semibold py-2 px-3 rounded-xl"
                  >
                    {backup.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    onSkip();
                    setShowRowingOptions(false);
                  }}
                  className="text-gray-500 text-sm py-2 px-3 rounded-xl bg-gray-100"
                >
                  🌧️ Skip
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
