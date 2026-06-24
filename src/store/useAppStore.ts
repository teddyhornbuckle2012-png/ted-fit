import { create } from 'zustand';

const CELEBRATION_MESSAGES = [
  "Crushing it! 💪",
  "That's the habit building!",
  "One more day in the chain!",
  "You showed up. That's everything.",
  "Consistency over perfection.",
];

function randomMessage(): string {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
}

interface AppState {
  selectedWorkoutId: string | null;
  onboardingComplete: boolean;
  anchor: string;
  reminderTime: string;
  celebrationVisible: boolean;
  todayCompletionMessage: string;
  isMiniMode: boolean;

  setSelectedWorkoutId: (id: string | null) => void;
  setOnboardingComplete: (val: boolean) => void;
  setAnchor: (anchor: string) => void;
  setReminderTime: (time: string) => void;
  showCelebration: () => void;
  dismissCelebration: () => void;
  setMiniMode: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedWorkoutId: null,
  onboardingComplete: false,
  anchor: 'I get home from school',
  reminderTime: '16:30',
  celebrationVisible: false,
  todayCompletionMessage: randomMessage(),
  isMiniMode: false,

  setSelectedWorkoutId: (id) => set({ selectedWorkoutId: id }),
  setOnboardingComplete: (val) => set({ onboardingComplete: val }),
  setAnchor: (anchor) => set({ anchor }),
  setReminderTime: (time) => set({ reminderTime: time }),
  showCelebration: () =>
    set({ celebrationVisible: true, todayCompletionMessage: randomMessage() }),
  dismissCelebration: () => set({ celebrationVisible: false }),
  setMiniMode: (val) => set({ isMiniMode: val }),
}));
