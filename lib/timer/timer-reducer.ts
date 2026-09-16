import type { TimerAction, TimerDefinition, TimerState } from './timer-types.ts';

export const MIN_DURATION = 60_000;
export const MAX_DURATION = 180 * 60_000;

const clampDuration = (value: number) => Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.round(value)));

export function createTimerState(timer: TimerDefinition): TimerState {
  const duration = clampDuration(timer.duration);
  return {
    originalDuration: duration,
    currentDuration: duration,
    remainingTime: duration,
    endTime: null,
    timerStatus: 'idle',
    timerId: timer.id,
    label: timer.label,
    note: timer.note,
    emoji: timer.emoji,
    runId: 0,
  };
}

export function getRemainingTime(state: TimerState, now: number): number {
  if (state.timerStatus !== 'running' || state.endTime === null) return Math.max(0, state.remainingTime);
  return Math.max(0, state.endTime - now);
}

export function reconcileTimerState(state: TimerState, now: number): TimerState {
  if (state.timerStatus !== 'running' || state.endTime === null) return state;
  const remainingTime = getRemainingTime(state, now);
  if (remainingTime <= 0) {
    return { ...state, remainingTime: 0, endTime: null, timerStatus: 'completed' };
  }
  return { ...state, remainingTime };
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'hydrate':
      return reconcileTimerState(action.state, action.now);
    case 'select':
      return createTimerState(action.timer);
    case 'start': {
      if (state.timerStatus === 'running') return state;
      const remainingTime = state.timerStatus === 'completed'
        ? state.currentDuration
        : Math.max(1, state.remainingTime || state.currentDuration);
      return {
        ...state,
        remainingTime,
        endTime: action.now + remainingTime,
        timerStatus: 'running',
        runId: state.timerStatus === 'paused' ? state.runId : state.runId + 1,
      };
    }
    case 'pause': {
      if (state.timerStatus !== 'running') return state;
      const remainingTime = getRemainingTime(state, action.now);
      return remainingTime <= 0
        ? { ...state, remainingTime: 0, endTime: null, timerStatus: 'completed' }
        : { ...state, remainingTime, endTime: null, timerStatus: 'paused' };
    }
    case 'adjust': {
      const currentDuration = clampDuration(state.currentDuration + action.delta);
      const appliedDelta = currentDuration - state.currentDuration;
      if (appliedDelta === 0) return state;

      if (state.timerStatus === 'running') {
        const remainingTime = Math.max(0, getRemainingTime(state, action.now) + appliedDelta);
        return remainingTime <= 0
          ? { ...state, currentDuration, remainingTime: 0, endTime: null, timerStatus: 'completed' }
          : { ...state, currentDuration, remainingTime, endTime: action.now + remainingTime };
      }

      if (state.timerStatus === 'idle') {
        return { ...state, currentDuration, remainingTime: currentDuration };
      }

      const remainingTime = Math.max(0, state.remainingTime + appliedDelta);
      if (remainingTime <= 0) {
        return { ...state, currentDuration, remainingTime: 0, endTime: null, timerStatus: 'completed' };
      }
      return {
        ...state,
        currentDuration,
        remainingTime,
        endTime: null,
        timerStatus: 'paused',
      };
    }
    case 'reset':
      return { ...state, remainingTime: state.currentDuration, endTime: null, timerStatus: 'idle' };
    case 'restoreOriginal':
      return {
        ...state,
        currentDuration: state.originalDuration,
        remainingTime: state.originalDuration,
        endTime: null,
        timerStatus: 'idle',
      };
    case 'tick':
      return reconcileTimerState(state, action.now);
    default:
      return state;
  }
}

export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}
