import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exercise } from '../types';
import clsx from 'clsx';

interface ExerciseCardProps {
  exercise: Exercise;
  onLogSet?: (setNumber: number, reps: number, weightKg: number) => void;
  completedSets?: number;
}

export function ExerciseCard({ exercise, onLogSet, completedSets = 0 }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [reps, setReps] = useState(exercise.repRange.split('-')[0] ?? '10');
  const [weight, setWeight] = useState('0');
  const [animFrame, setAnimFrame] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  const toggleAnimation = () => {
    setShowAnimation((v) => !v);
    setAnimFrame(0);
  };

  const nextFrame = () => {
    setAnimFrame((f) => (f + 1) % exercise.animationKeyframes.length);
  };

  const handleLogSet = () => {
    const setNumber = completedSets + 1;
    onLogSet?.(setNumber, parseInt(reps, 10) || 0, parseFloat(weight) || 0);
  };

  const muscleChipColor = (muscle: string) => {
    const colors: Record<string, string> = {
      chest: 'bg-red-100 text-red-700',
      back: 'bg-blue-100 text-blue-700',
      shoulders: 'bg-purple-100 text-purple-700',
      biceps: 'bg-amber-100 text-amber-700',
      triceps: 'bg-orange-100 text-orange-700',
      core: 'bg-green-100 text-green-700',
      legs: 'bg-teal-100 text-teal-700',
      'rear-delts': 'bg-pink-100 text-pink-700',
      lats: 'bg-indigo-100 text-indigo-700',
      forearms: 'bg-yellow-100 text-yellow-700',
    };
    return colors[muscle] ?? 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.div
      layout
      className={clsx(
        'rounded-2xl border overflow-hidden transition-colors',
        completedSets >= exercise.defaultSets
          ? 'border-green-200 bg-green-50'
          : 'border-orange-100 bg-white'
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-forge-dark">{exercise.name}</span>
            {completedSets >= exercise.defaultSets && (
              <span className="text-green-600 text-sm">✓</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {exercise.primaryMuscles.map((m) => (
              <span
                key={m}
                className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', muscleChipColor(m))}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 ml-2">
          {/* Sets progress dots */}
          <div className="flex gap-1">
            {Array.from({ length: exercise.defaultSets }).map((_, i) => (
              <div
                key={i}
                className={clsx(
                  'w-2 h-2 rounded-full',
                  i < completedSets ? 'bg-forge-orange' : 'bg-orange-100'
                )}
              />
            ))}
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            className="text-gray-400"
          >
            ▾
          </motion.span>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-orange-50 rounded-xl p-2">
                  <div className="text-lg font-bold text-forge-orange">{exercise.defaultSets}</div>
                  <div className="text-xs text-gray-500">sets</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-2">
                  <div className="text-lg font-bold text-forge-orange">{exercise.repRange}</div>
                  <div className="text-xs text-gray-500">reps</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-2">
                  <div className="text-xs font-bold text-forge-orange">{exercise.tempo}</div>
                  <div className="text-xs text-gray-500">tempo</div>
                </div>
              </div>

              {/* Animation preview */}
              {exercise.animationKeyframes.length > 0 && (
                <div>
                  <button
                    onClick={toggleAnimation}
                    className="text-sm text-forge-orange font-semibold"
                  >
                    {showAnimation ? '▲ Hide' : '▶ View'} technique guide
                  </button>
                  <AnimatePresence>
                    {showAnimation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-2 bg-forge-dark rounded-xl p-4 cursor-pointer"
                          onClick={nextFrame}
                        >
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={animFrame}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-forge-cream text-sm text-center"
                            >
                              {exercise.animationKeyframes[animFrame]}
                            </motion.p>
                          </AnimatePresence>
                          <div className="flex justify-center gap-1 mt-3">
                            {exercise.animationKeyframes.map((_, i) => (
                              <div
                                key={i}
                                className={clsx(
                                  'w-1.5 h-1.5 rounded-full',
                                  i === animFrame ? 'bg-forge-orange' : 'bg-gray-600'
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 text-center mt-2">
                            Tap to advance
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Cues */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Technique Cues
                </h4>
                <ol className="space-y-1.5">
                  {exercise.cues.map((cue, i) => (
                    <li key={i} className="flex gap-2 text-sm text-forge-dark">
                      <span className="font-bold text-forge-orange shrink-0">{i + 1}.</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Common mistakes */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
                  ⚠ Common Mistakes
                </h4>
                <ul className="space-y-1.5">
                  {exercise.commonMistakes.map((m, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-red-400 shrink-0">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Set logger */}
              <div className="border-t border-orange-100 pt-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Log Set {completedSets + 1} of {exercise.defaultSets}
                </h4>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      min="0"
                      step="0.5"
                      className="w-full border border-orange-200 rounded-xl px-3 py-2 text-center font-bold text-forge-dark focus:outline-none focus:border-forge-orange"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Reps</label>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      min="0"
                      className="w-full border border-orange-200 rounded-xl px-3 py-2 text-center font-bold text-forge-dark focus:outline-none focus:border-forge-orange"
                    />
                  </div>
                  <button
                    onClick={handleLogSet}
                    disabled={completedSets >= exercise.defaultSets}
                    className="bg-forge-orange text-white font-bold px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Log
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
