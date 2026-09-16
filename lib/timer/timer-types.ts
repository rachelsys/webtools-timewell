export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type TimerDefinition = {
  id: string;
  label: string;
  note: string;
  emoji: string;
  duration: number;
};

export type TimerState = {
  originalDuration: number;
  currentDuration: number;
  remainingTime: number;
  endTime: number | null;
  timerStatus: TimerStatus;
  timerId: string;
  label: string;
  note: string;
  emoji: string;
  runId: number;
};

export type TimerAction =
  | { type: 'hydrate'; state: TimerState; now: number }
  | { type: 'select'; timer: TimerDefinition }
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'adjust'; delta: number; now: number }
  | { type: 'reset' }
  | { type: 'restoreOriginal' }
  | { type: 'tick'; now: number };

