'use client';

import { useState } from 'react';
import { BellRing, Plus } from 'lucide-react';
import type { TimerDefinition } from '@/lib/timer/timer-types';

export function CustomTimerForm({ onCreate }: { onCreate: (timer: TimerDefinition) => void }) {
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');

  const submit = () => {
    const durationMinutes = Math.max(1, Math.min(180, Number(minutes) || 1));
    const label = name.trim() || '我的倒數';
    onCreate({
      id: `custom-${Date.now()}`,
      label,
      duration: durationMinutes * 60_000,
      note: `${durationMinutes} 分鐘，照自己的節奏`,
      emoji: '✦',
    });
    setName('');
    setMinutes('');
  };

  return <section className="custom-panel">
    <div className="custom-title"><span><BellRing size={18} /></span><div><h2>自己的倒數</h2><p>取個名字，下次可以一鍵再用。</p></div></div>
    <div className="custom-fields">
      <label>品項名稱<input value={name} onChange={event => setName(event.target.value)} placeholder="例如：敷面膜" /></label>
      <label>分鐘<input value={minutes} onChange={event => setMinutes(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') submit(); }} type="number" min="1" max="180" placeholder="15" /></label>
      <button onClick={submit}>建立倒數 <Plus size={17} /></button>
    </div>
  </section>;
}

