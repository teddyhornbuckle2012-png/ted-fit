import { motion } from 'framer-motion';
import clsx from 'clsx';

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const isHot = streak >= 7;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm',
        isHot
          ? 'bg-dulux-sky-view text-white'
          : 'bg-dulux-blueberry-white text-forge-orange',
        className
      )}
    >
      <motion.span
        animate={
          isHot
            ? {
                scale: [1, 1.2, 1],
                rotate: [-5, 5, -5, 5, 0],
              }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
        className="text-base"
      >
        🔥
      </motion.span>
      <span>{streak} day{streak !== 1 ? 's' : ''}</span>
    </motion.div>
  );
}
