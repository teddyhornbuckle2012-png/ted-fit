import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { WorkoutDefinition } from '../types';
import clsx from 'clsx';

interface WorkoutCardProps {
  workout: WorkoutDefinition;
  className?: string;
}

const locationLabel = { home: 'Home', gym: 'Gym' };
const locationColor = { home: 'text-dulux-vast-lake bg-dulux-mineral-mist', gym: 'text-dulux-nordic-sky bg-dulux-blueberry-white' };

export function WorkoutCard({ workout, className }: WorkoutCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/workout/${workout.id}`)}
      className={clsx(
        'bg-white rounded-2xl p-4 border border-dulux-mineral-mist shadow-sm cursor-pointer',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-forge-orange">
          {workout.label}
        </span>
        <span
          className={clsx(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            locationColor[workout.location]
          )}
        >
          {locationLabel[workout.location]}
        </span>
      </div>
      <h3 className="font-bold text-forge-dark text-lg">{workout.name}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {workout.exerciseIds.length} exercises
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">Tap to start →</span>
      </div>
    </motion.div>
  );
}
