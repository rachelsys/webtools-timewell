'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Check, CircleDashed, Volume2, VolumeX } from 'lucide-react';
import { MUSIC_LIBRARY } from '@/config/music-library';
import { getTimerExperience } from '@/config/timer-experiences';
import { useAlarm } from '@/hooks/use-alarm';
import { useBackgroundAudio } from '@/hooks/use-background-audio';
import { useStartCue } from '@/hooks/use-start-cue';
import { useTimer } from '@/hooks/use-timer';
import { FOCUS_CATEGORIES, type FocusCategory, type FocusRecord, type FocusResult, type PendingFocusCompletion } from '@/lib/focus/focus-types';
import { loadFocusSession, saveFocusRecord, saveFocusSession } from '@/lib/focus/focus-storage';
import { createTimerState } from '@/lib/timer/timer-reducer';
import { getTrackIdForTimer, loadPersistedApp, patchPersistedAudioPreferences, type AudioPreferences } from '@/lib/timer/timer-storage';
import type { TimerDefinition } from '@/lib/timer/timer-types';
import { SiteHeader } from '@/components/site-header';
import { TimerControls } from '@/components/timer/timer-controls';
import { TimerDisplay } from '@/components/timer/timer-display';

const definition = (minutes: number, purpose = ''): TimerDefinition => ({
  id: 'focus', emoji: '◌', label: purpose.trim() || '專注時間',
  note: purpose.trim() ? `只做：${purpose.trim()}` : '這段時間，只做一件事',
  duration: minutes * 60_000,
});

const makeId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `focus-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function FocusApp() {
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState<FocusCategory | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(25);
  const timer = useTimer(definition(25));
  const [audio, setAudio] = useState<AudioPreferences>(() => loadPersistedApp(createTimerState(definition(25))).audio);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [activeStartedAt, setActiveStartedAt] = useState<number | null>(null);
  const [accumulatedActiveMs, setAccumulatedActiveMs] = useState(0);
  const [pending, setPending] = useState<PendingFocusCompletion | null>(null);
  const [promptStep, setPromptStep] = useState<'choice' | 'result'>('choice');
  const [savedMessage, setSavedMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const previousStatus = useRef(timer.state.timerStatus);
  const lastEndTime = useRef<number | null>(null);
  const experience = getTimerExperience('focus');
  const selectedTrack = MUSIC_LIBRARY.find(item => item.id === getTrackIdForTimer(audio, 'focus')) || MUSIC_LIBRARY[0];
  const background = useBackgroundAudio({ status: timer.state.timerStatus, track: selectedTrack, volume: audio.volume, muted: audio.musicMuted });
  const alarm = useAlarm(audio.alarmEnabled);
  const startCue = useStartCue({ muted: audio.musicMuted, volume: audio.volume });
  const editable = timer.state.timerStatus === 'idle';

  useEffect(() => {
    const stored = loadFocusSession();
    if (stored) {
      lastEndTime.current = stored.timer.endTime;
      setPurpose(stored.purpose || '');
      setCategory(stored.category);
      setDurationMinutes(stored.durationMinutes || 25);
      setStartedAt(stored.startedAt);
      setActiveStartedAt(stored.activeStartedAt);
      setAccumulatedActiveMs(stored.accumulatedActiveMs || 0);
      setPending(stored.pendingCompletion);
      timer.hydrate(stored.timer);
    }
    setAudio(loadPersistedApp(createTimerState(definition(25))).audio);
    setHydrated(true);
    // Hydrate once from this device.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editable) return;
    timer.select(definition(durationMinutes, purpose));
    // Draft changes define the next run only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMinutes, purpose]);

  if (timer.state.timerStatus === 'running' && timer.state.endTime !== null) lastEndTime.current = timer.state.endTime;

  useEffect(() => {
    const justCompleted = previousStatus.current !== 'completed' && timer.state.timerStatus === 'completed';
    previousStatus.current = timer.state.timerStatus;
    if (!justCompleted || pending || !startedAt) return;
    const completedAt = Math.min(Date.now(), lastEndTime.current || Date.now());
    const activeMs = accumulatedActiveMs + (activeStartedAt ? Math.max(0, completedAt - activeStartedAt) : 0);
    setPending({
      schemaVersion: 1, startedAt, completedAt,
      purpose: purpose.trim() || null, category,
      plannedDurationSec: Math.round(timer.state.currentDuration / 1000),
      actualDurationSec: Math.max(1, Math.round(activeMs / 1000)),
      mode: 'focus', pomodoroSessionId: null, pomodoroRound: null, endedReason: 'timer_completed',
    });
    setActiveStartedAt(null);
    alarm.play();
  }, [accumulatedActiveMs, activeStartedAt, alarm, category, pending, purpose, startedAt, timer.state.currentDuration, timer.state.timerStatus]);

  const persistenceKey = useMemo(() => JSON.stringify({
    purpose, category, durationMinutes,
    timer: timer.state.timerStatus === 'running' ? { ...timer.state, remainingTime: -1 } : timer.state,
    startedAt, activeStartedAt, accumulatedActiveMs, pending,
  }), [purpose, category, durationMinutes, timer.state, startedAt, activeStartedAt, accumulatedActiveMs, pending]);

  useEffect(() => {
    if (!hydrated) return;
    saveFocusSession({ version: 1, purpose, category, durationMinutes, timer: timer.state, startedAt, activeStartedAt, accumulatedActiveMs, pendingCompletion: pending });
    // Do not write each visual countdown tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, persistenceKey]);

  useEffect(() => {
    const save = () => saveFocusSession({ version: 1, purpose, category, durationMinutes, timer: timer.state, startedAt, activeStartedAt, accumulatedActiveMs, pendingCompletion: pending });
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
  }, [purpose, category, durationMinutes, timer.state, startedAt, activeStartedAt, accumulatedActiveMs, pending]);

  const toggle = () => {
    const now = Date.now();
    if (timer.state.timerStatus === 'running') {
      timer.pause();
      if (activeStartedAt) setAccumulatedActiveMs(value => value + Math.max(0, now - activeStartedAt));
      setActiveStartedAt(null);
      return;
    }
    alarm.unlock();
    if (timer.state.timerStatus === 'paused') {
      setActiveStartedAt(now);
      timer.start();
      void background.playFromGesture();
      return;
    }
    setStartedAt(now);
    setAccumulatedActiveMs(0);
    setActiveStartedAt(now);
    startCue.unlock();
    startCue.play(experience.cue);
    background.playAfterCueFromGesture(experience.cueDuration);
    timer.start();
  };

  const resetSession = () => {
    timer.reset();
    setStartedAt(null); setActiveStartedAt(null); setAccumulatedActiveMs(0); setPending(null); setPromptStep('choice');
  };

  const discard = () => { resetSession(); setSavedMessage('這次沒有留下紀錄'); };
  const saveResult = (result: FocusResult) => {
    if (!pending) return;
    const record: FocusRecord = { ...pending, id: makeId(), createdAt: Date.now(), result };
    saveFocusRecord(record);
    resetSession();
    setSavedMessage('已存到「我的紀錄」');
  };

  const toggleMute = () => {
    const next = !audio.musicMuted;
    setAudio(current => ({ ...current, musicMuted: next }));
    patchPersistedAudioPreferences({ musicMuted: next }, createTimerState(definition(25)));
    void background.setMutedFromGesture(next);
  };

  return <main className={`timer-page focus-page ${timer.state.timerStatus === 'completed' ? 'is-complete' : ''}`}>
    <SiteHeader current="focus" shareMinutes={pending ? pending.actualDurationSec / 60 : undefined} action={<button className="sound-button" onClick={toggleMute}>{audio.musicMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}<span>{audio.musicMuted ? '音樂靜音' : '背景音樂'}</span></button>} />
    <section className="timer-shell">
      <div className="timer-copy focus-intro"><div><p className="timer-kicker"><span />FOCUS MODE</p><h1>這段時間，只做一件事。</h1></div><p>先說想完成什麼，也可以什麼都不填。開始後，讓時間替你守住注意力。</p></div>
      <div className="timer-workspace focus-workspace">
        <section className="timer-stage experience-focus" style={{ '--experience-accent': experience.accent, '--experience-accent-deep': experience.accentDeep, '--experience-glow': experience.glow } as CSSProperties}>
          <TimerDisplay state={timer.state} experience={experience} />
          <TimerControls state={timer.state} onToggle={toggle} onAdjust={timer.adjust} onReset={resetSession} onRestoreOriginal={() => { timer.restoreOriginal(); setDurationMinutes(Math.round(timer.state.originalDuration / 60_000)); }} />
        </section>
        <aside className="focus-setup">
          <div className="focus-card">
            <div className="section-heading"><div><span>這一段要做什麼</span><h2>設定專注</h2></div><small>{editable ? '可自由調整' : '進行中已鎖定'}</small></div>
            <label className="focus-field">目的（選填）<input value={purpose} disabled={!editable} onChange={event => setPurpose(event.target.value.slice(0, 60))} placeholder="例如：整理明天的簡報" /></label>
            <div className="focus-field"><span>分類（選填）</span><div className="focus-category-list"><button className={!category ? 'active' : ''} disabled={!editable} onClick={() => setCategory(null)}>不分類</button>{FOCUS_CATEGORIES.map(item => <button key={item} className={category === item ? 'active' : ''} disabled={!editable} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
            <div className="focus-field"><span>時間</span><div className="duration-picks">{[15, 25, 45, 60].map(minutes => <button key={minutes} className={durationMinutes === minutes ? 'active' : ''} disabled={!editable} onClick={() => setDurationMinutes(minutes)}>{minutes}<small>分鐘</small></button>)}</div></div>
            <p className="focus-privacy"><CircleDashed size={16} />紀錄只保存在這台裝置，不需要登入。</p>
          </div>
          {savedMessage && <div className="focus-toast"><Check size={17} />{savedMessage}<a href="/records">查看</a></div>}
        </aside>
      </div>
    </section>
    {pending && <div className="focus-modal-backdrop" role="presentation">
      <section className="focus-modal" role="dialog" aria-modal="true" aria-labelledby="focus-complete-title">
        <span className="focus-complete-icon">✓</span>
        <p className="timer-kicker"><span />完成一段專注</p>
        <h2 id="focus-complete-title">{promptStep === 'choice' ? '要留下這次紀錄嗎？' : '這次進行得如何？'}</h2>
        <p>{purpose.trim() || '未設定目的'} · {Math.round(pending.actualDurationSec / 60)} 分鐘</p>
        {promptStep === 'choice' ? <div className="focus-modal-actions"><button className="secondary" onClick={discard}>不用紀錄</button><button className="primary" onClick={() => setPromptStep('result')}>紀錄這次專注</button></div> : <div className="result-options"><button onClick={() => saveResult('completed')}>✓<strong>完成了</strong></button><button onClick={() => saveResult('partially_completed')}>◐<strong>完成一部分</strong></button><button onClick={() => saveResult('not_completed')}>○<strong>還沒完成</strong></button></div>}
      </section>
    </div>}
  </main>;
}
