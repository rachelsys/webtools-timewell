import { Pause, Play, RotateCcw, StepBack } from 'lucide-react';
import type { TimerState } from '@/lib/timer/timer-types';

type Props = {
  state: TimerState;
  onToggle: () => void;
  onAdjust: (delta: number) => void;
  onReset: () => void;
  onRestoreOriginal: () => void;
};

export function TimerControls({ state, onToggle, onAdjust, onReset, onRestoreOriginal }: Props) {
  const isRunning = state.timerStatus === 'running';
  const primaryText = state.timerStatus === 'completed' ? '再來一次' : isRunning ? '暫停' : state.timerStatus === 'paused' ? '繼續' : '開始倒數';
  const hasDurationChange = state.currentDuration !== state.originalDuration;

  return <div className="timer-control-stack">
    <div className="timer-controls">
      <button className="time-adjust" onClick={() => onAdjust(-60_000)} aria-label="減少一分鐘">−1<span>分鐘</span></button>
      <button className="primary-control" onClick={onToggle}>{isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}{primaryText}</button>
      <button className="time-adjust" onClick={() => onAdjust(60_000)} aria-label="增加一分鐘">+1<span>分鐘</span></button>
    </div>
    <div className="reset-row">
      <button onClick={onReset}><RotateCcw size={15} />重置目前時間</button>
      <button onClick={onRestoreOriginal} disabled={!hasDurationChange}><StepBack size={15} />恢復初始時間</button>
    </div>
  </div>;
}

