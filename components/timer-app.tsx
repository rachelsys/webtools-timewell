'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BellRing, Pause, Play, Plus, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type Preset = { emoji: string; name: string; minutes: number; note: string };

const presets: Preset[] = [
  { emoji: '🍜', name: '泡麵', minutes: 3, note: '剛剛好的彈牙' },
  { emoji: '🍵', name: '茶', minutes: 5, note: '讓茶葉慢慢舒展' },
  { emoji: '☕', name: '咖啡', minutes: 4, note: '手沖的安靜片刻' },
  { emoji: '🫧', name: '小休息', minutes: 10, note: '離開螢幕一下' },
  { emoji: '◌', name: '專注', minutes: 25, note: '完成一件重要的事' },
];

const formatTime = (seconds: number) => {
  const value = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
};

function TimerLogo() {
  return <svg viewBox="0 0 40 40" role="img" aria-label="倒數一下圖示">
    <path className="logo-dial" d="M20 8.5a11.5 11.5 0 1 1-8.13 3.37" />
    <path className="logo-hand" d="M20 13v7l5 3" />
    <path className="logo-tick" d="M10.6 7.8 7.7 10.7" />
    <circle cx="20" cy="20" r="1.7" />
  </svg>;
}

export default function TimerApp() {
  const [name, setName] = useState('泡麵');
  const [note, setNote] = useState('剛剛好的彈牙');
  const [duration, setDuration] = useState(180);
  const [remaining, setRemaining] = useState(180);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [customName, setCustomName] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [recent, setRecent] = useState<Preset[]>([]);
  const endAt = useRef<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const completed = remaining <= 0;
  const progress = duration ? Math.max(0, Math.min(1, remaining / duration)) : 0;
  const circumference = 2 * Math.PI * 138;

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem('anything-timer-recent') || '[]')); } catch { setRecent([]); }
  }, []);

  const chime = useCallback(() => {
    if (!soundOn) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = audioContext.current || new AudioContextClass();
      audioContext.current = context;
      [0, .16, .34].forEach((delay, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = [660, 880, 990][index];
        gain.gain.setValueAtTime(.0001, context.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(.16, context.currentTime + delay + .02);
        gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + delay + .34);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(context.currentTime + delay);
        oscillator.stop(context.currentTime + delay + .38);
      });
    } catch { /* Sound is optional. */ }
  }, [soundOn]);

  useEffect(() => {
    if (!running || !endAt.current) return;
    const tick = () => {
      const next = Math.max(0, (endAt.current! - Date.now()) / 1000);
      setRemaining(next);
      if (next <= 0) {
        setRunning(false);
        endAt.current = null;
        chime();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running, chime]);

  useEffect(() => {
    document.title = running ? `${formatTime(remaining)} · ${name}` : completed ? `好了！· ${name}` : '倒數一下 · anything';
  }, [remaining, running, completed, name]);

  const selectPreset = (preset: Preset) => {
    setRunning(false); endAt.current = null;
    setName(preset.name); setNote(preset.note);
    setDuration(preset.minutes * 60); setRemaining(preset.minutes * 60);
  };

  const toggle = () => {
    if (running) {
      setRunning(false); endAt.current = null;
      return;
    }
    const startFrom = completed ? duration : remaining;
    if (soundOn) {
      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContext.current = audioContext.current || new AudioContextClass();
        void audioContext.current.resume();
      } catch { /* Sound remains optional. */ }
    }
    setRemaining(startFrom);
    endAt.current = Date.now() + startFrom * 1000;
    setRunning(true);
  };

  const addThirty = () => {
    setRemaining(value => value + 30);
    setDuration(value => Math.max(value, remaining + 30));
    if (running && endAt.current) endAt.current += 30000;
  };

  const reset = () => {
    setRunning(false); endAt.current = null; setRemaining(duration);
  };

  const applyCustom = () => {
    const minutes = Math.max(1, Math.min(180, Number(customMinutes) || 1));
    const preset = { emoji: '✦', name: customName.trim() || '我的倒數', minutes, note: `${minutes} 分鐘，照自己的節奏` };
    selectPreset(preset);
    const next = [preset, ...recent.filter(item => item.name !== preset.name || item.minutes !== preset.minutes)].slice(0, 3);
    setRecent(next);
    localStorage.setItem('anything-timer-recent', JSON.stringify(next));
    setCustomName(''); setCustomMinutes('');
  };

  return <main className={`timer-page ${completed ? 'is-complete' : ''}`}>
    <header className="timer-header">
      <a className="timer-brand" href="/" aria-label="倒數一下首頁">
        <span className="timer-logo"><TimerLogo /></span>
        <span className="timer-brand-copy"><strong>倒數一下</strong><small>日常計時器</small></span>
      </a>
      <button className="sound-button" onClick={() => setSoundOn(value => !value)} aria-label={soundOn ? '關閉完成音效' : '開啟完成音效'}>{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}<span>{soundOn ? '完成時響鈴' : '靜音模式'}</span></button>
    </header>

    <section className="timer-shell">
      <div className="timer-copy">
        <div>
          <p className="timer-kicker"><span />不用盯著時間</p>
          <h1>選好，按下開始。</h1>
        </div>
        <p>泡麵、茶、咖啡或一小段專注。時間到了，我會提醒你。</p>
      </div>

      <div className="timer-workspace">
        <section className="timer-stage" aria-live="polite">
          <div className="stage-label"><span>{running ? '倒數進行中' : completed ? '時間到了' : '準備好了'}</span><strong>{name}</strong></div>
          <div className="timer-orbit">
            <svg viewBox="0 0 300 300" aria-hidden="true">
              <circle className="timer-track" cx="150" cy="150" r="138" />
              <circle className="timer-progress" cx="150" cy="150" r="138" style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - progress) }} />
            </svg>
            <div className="timer-readout">
              <span className="timer-emoji">{completed ? '✓' : presets.find(item => item.name === name)?.emoji || '✦'}</span>
              <span className="timer-name">{name}</span>
              <strong>{formatTime(remaining)}</strong>
              <span className="timer-status">{completed ? '好了，可以回來了' : running ? '正在安靜倒數' : remaining < duration ? '已暫停' : note}</span>
            </div>
          </div>
          <div className="timer-controls">
            <button className="secondary-control" onClick={reset} aria-label="重設倒數"><RotateCcw size={18} /><span>重設</span></button>
            <button className="primary-control" onClick={toggle}>{running ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}{completed ? '再來一次' : running ? '暫停' : '開始倒數'}</button>
            <button className="secondary-control" onClick={addThirty} aria-label="增加 30 秒"><Plus size={18} /><span>30 秒</span></button>
          </div>
        </section>

        <aside className="timer-side">
          <section className="preset-panel">
            <div className="section-heading"><div><span>QUICK START</span><h2>快速選一個</h2></div><small>點一下就切換</small></div>
            <div className="preset-grid">
              {presets.map(preset => <button key={preset.name} aria-pressed={name === preset.name} className={name === preset.name ? 'preset-card active' : 'preset-card'} onClick={() => selectPreset(preset)}><span>{preset.emoji}</span><div><strong>{preset.name}</strong><small>{preset.minutes} 分鐘</small></div></button>)}
            </div>
            {recent.length > 0 && <div className="recent-row"><span>最近使用</span>{recent.map(item => <button key={`${item.name}-${item.minutes}`} onClick={() => selectPreset(item)}>{item.name} · {item.minutes} 分</button>)}</div>}
          </section>

          <section className="custom-panel">
            <div className="custom-title"><span><BellRing size={18} /></span><div><h2>自己的倒數</h2><p>取個名字，下次可以一鍵再用。</p></div></div>
            <div className="custom-fields"><label>品項名稱<input value={customName} onChange={event => setCustomName(event.target.value)} placeholder="例如：敷面膜" /></label><label>分鐘<input value={customMinutes} onChange={event => setCustomMinutes(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') applyCustom(); }} type="number" min="1" max="180" placeholder="15" /></label><button onClick={applyCustom}>建立倒數 <Plus size={17} /></button></div>
          </section>
        </aside>
      </div>
    </section>
  </main>;
}
