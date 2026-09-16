'use client';

import { useCallback, useEffect, useReducer } from 'react';
import { createTimerState, timerReducer } from '@/lib/timer/timer-reducer';
import type { TimerDefinition, TimerState } from '@/lib/timer/timer-types';

export function useTimer(defaultTimer: TimerDefinition) {
  const [state, dispatch] = useReducer(timerReducer, defaultTimer, createTimerState);

  useEffect(() => {
    if (state.timerStatus !== 'running') return;
    const tick = () => dispatch({ type: 'tick', now: Date.now() });
    tick();
    const id = window.setInterval(tick, 250);
    const reconcile = () => dispatch({ type: 'tick', now: Date.now() });
    document.addEventListener('visibilitychange', reconcile);
    window.addEventListener('focus', reconcile);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', reconcile);
      window.removeEventListener('focus', reconcile);
    };
  }, [state.timerStatus, state.endTime]);

  const hydrate = useCallback((next: TimerState) => dispatch({ type: 'hydrate', state: next, now: Date.now() }), []);
  const select = useCallback((timer: TimerDefinition) => dispatch({ type: 'select', timer }), []);
  const start = useCallback(() => dispatch({ type: 'start', now: Date.now() }), []);
  const pause = useCallback(() => dispatch({ type: 'pause', now: Date.now() }), []);
  const adjust = useCallback((delta: number) => dispatch({ type: 'adjust', delta, now: Date.now() }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const restoreOriginal = useCallback(() => dispatch({ type: 'restoreOriginal' }), []);

  return { state, hydrate, select, start, pause, adjust, reset, restoreOriginal };
}

