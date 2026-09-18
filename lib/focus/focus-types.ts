import type { TimerState } from '@/lib/timer/timer-types';

export const FOCUS_CATEGORIES = ['工作', '學習', '閱讀', '整理', '創作', '其他'] as const;
export type FocusCategory = typeof FOCUS_CATEGORIES[number];
export type FocusResult = 'completed' | 'partially_completed' | 'not_completed';

export type FocusRecord = {
  id: string;
  schemaVersion: 1;
  createdAt: number;
  startedAt: number;
  completedAt: number;
  purpose: string | null;
  category: FocusCategory | null;
  plannedDurationSec: number;
  actualDurationSec: number;
  result: FocusResult;
  mode: 'focus';
  pomodoroSessionId: null;
  pomodoroRound: null;
  endedReason: 'timer_completed';
};

export type PendingFocusCompletion = Omit<FocusRecord, 'id' | 'createdAt' | 'result'>;

export type FocusSessionSnapshot = {
  version: 1;
  purpose: string;
  category: FocusCategory | null;
  durationMinutes: number;
  timer: TimerState;
  startedAt: number | null;
  activeStartedAt: number | null;
  accumulatedActiveMs: number;
  pendingCompletion: PendingFocusCompletion | null;
};
