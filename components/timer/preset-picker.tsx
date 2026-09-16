import { TIMER_PRESETS } from '@/config/timer-presets';
import type { TimerDefinition } from '@/lib/timer/timer-types';

type Props = {
  selectedId: string;
  recentTimers: TimerDefinition[];
  onSelect: (timer: TimerDefinition) => void;
};

export function PresetPicker({ selectedId, recentTimers, onSelect }: Props) {
  return <section className="preset-panel">
    <div className="section-heading"><div><span>QUICK START</span><h2>快速選一個</h2></div><small>點一下就切換</small></div>
    <div className="preset-grid">
      {TIMER_PRESETS.map(preset => <button key={preset.id} aria-pressed={selectedId === preset.id} className={selectedId === preset.id ? 'preset-card active' : 'preset-card'} onClick={() => onSelect(preset)}><span>{preset.emoji}</span><div><strong>{preset.label}</strong><small>{preset.duration / 60_000} 分鐘</small></div></button>)}
    </div>
    {recentTimers.length > 0 && <div className="recent-row"><span>最近使用</span>{recentTimers.map(item => <button key={item.id} onClick={() => onSelect(item)}>{item.label} · {Math.round(item.duration / 60_000)} 分</button>)}</div>}
  </section>;
}

