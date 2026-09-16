import { formatDuration } from '@/lib/timer/timer-reducer';
import type { TimerState } from '@/lib/timer/timer-types';

export function TimerDisplay({ state }: { state: TimerState }) {
  const circumference = 2 * Math.PI * 138;
  const progress = state.currentDuration
    ? Math.max(0, Math.min(1, state.remainingTime / state.currentDuration))
    : 0;
  const stateLabel = state.timerStatus === 'running'
    ? '倒數進行中'
    : state.timerStatus === 'paused'
      ? '倒數已暫停'
      : state.timerStatus === 'completed'
        ? '時間到了'
        : '準備好了';
  const detail = state.timerStatus === 'completed'
    ? '好了，可以回來了'
    : state.timerStatus === 'running'
      ? '正在安靜倒數'
      : state.timerStatus === 'paused'
        ? '等你回來繼續'
        : state.note;

  return <>
    <div className="stage-label"><span>{stateLabel}</span><strong>{state.label}</strong></div>
    <div className="timer-orbit">
      <svg viewBox="0 0 300 300" aria-hidden="true">
        <circle className="timer-track" cx="150" cy="150" r="138" />
        <circle className="timer-progress" cx="150" cy="150" r="138" style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - progress) }} />
      </svg>
      <div className="timer-readout">
        <span className="timer-emoji">{state.timerStatus === 'completed' ? '✓' : state.emoji}</span>
        <span className="timer-name">{state.label}</span>
        <strong>{formatDuration(state.remainingTime)}</strong>
        <span className="timer-status">{detail}</span>
      </div>
    </div>
  </>;
}

