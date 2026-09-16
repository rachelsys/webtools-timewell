'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { DEFAULT_TIMER } from '@/config/timer-presets';
import { MUSIC_LIBRARY } from '@/config/music-library';
import { useAlarm } from '@/hooks/use-alarm';
import { useBackgroundAudio } from '@/hooks/use-background-audio';
import { useTimer } from '@/hooks/use-timer';
import { useTimerNotification } from '@/hooks/use-timer-notification';
import { formatDuration } from '@/lib/timer/timer-reducer';
import { DEFAULT_AUDIO_PREFERENCES, loadPersistedApp, savePersistedApp, type AudioPreferences } from '@/lib/timer/timer-storage';
import type { TimerDefinition } from '@/lib/timer/timer-types';
import { CustomTimerForm } from './timer/custom-timer-form';
import { MusicPanel } from './timer/music-panel';
import { PresetPicker } from './timer/preset-picker';
import { TimerControls } from './timer/timer-controls';
import { TimerDisplay } from './timer/timer-display';
import { TimerLogo } from './timer/timer-logo';

export default function TimerApp() {
  const timer = useTimer(DEFAULT_TIMER);
  const [recentTimers, setRecentTimers] = useState<TimerDefinition[]>([]);
  const [audioPreferences, setAudioPreferences] = useState<AudioPreferences>(DEFAULT_AUDIO_PREFERENCES);
  const [lastNotifiedRunId, setLastNotifiedRunId] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const previousStatus = useRef(timer.state.timerStatus);
  const selectedTrack = MUSIC_LIBRARY.find(track => track.id === audioPreferences.selectedTrackId) || MUSIC_LIBRARY[0];
  const backgroundAudio = useBackgroundAudio({
    status: timer.state.timerStatus,
    track: selectedTrack,
    volume: audioPreferences.volume,
    muted: audioPreferences.musicMuted,
  });
  const alarm = useAlarm(audioPreferences.alarmEnabled);
  const notification = useTimerNotification(audioPreferences.notificationsEnabled);

  useEffect(() => {
    const persisted = loadPersistedApp(timer.state);
    timer.hydrate(persisted.timer);
    setRecentTimers(persisted.recentTimers);
    setAudioPreferences(persisted.audio);
    setLastNotifiedRunId(persisted.lastNotifiedRunId);
    setHydrated(true);
    // Initial hydration is intentionally performed once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistenceKey = useMemo(() => JSON.stringify({
    timer: timer.state.timerStatus === 'running' ? { ...timer.state, remainingTime: -1 } : timer.state,
    recentTimers,
    audioPreferences,
    lastNotifiedRunId,
  }), [audioPreferences, lastNotifiedRunId, recentTimers, timer.state]);

  useEffect(() => {
    if (!hydrated) return;
    savePersistedApp({ version: 2, timer: timer.state, recentTimers, audio: audioPreferences, lastNotifiedRunId });
    // persistenceKey excludes live countdown ticks while running.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, persistenceKey]);

  useEffect(() => {
    if (!hydrated) return;
    const saveOnExit = () => savePersistedApp({ version: 2, timer: timer.state, recentTimers, audio: audioPreferences, lastNotifiedRunId });
    window.addEventListener('pagehide', saveOnExit);
    return () => window.removeEventListener('pagehide', saveOnExit);
  }, [audioPreferences, hydrated, lastNotifiedRunId, recentTimers, timer.state]);

  useEffect(() => {
    const justCompleted = previousStatus.current !== 'completed' && timer.state.timerStatus === 'completed';
    previousStatus.current = timer.state.timerStatus;
    if (!justCompleted || timer.state.runId <= 0) return;
    alarm.play();
    if (timer.state.runId > lastNotifiedRunId) {
      notification.notify(timer.state.label);
      setLastNotifiedRunId(timer.state.runId);
    }
  }, [alarm, lastNotifiedRunId, notification, timer.state.label, timer.state.runId, timer.state.timerStatus]);

  useEffect(() => {
    document.title = timer.state.timerStatus === 'running'
      ? `${formatDuration(timer.state.remainingTime)} · ${timer.state.label}`
      : timer.state.timerStatus === 'completed'
        ? `好了！· ${timer.state.label}`
        : '倒數一下 · anything';
  }, [timer.state.label, timer.state.remainingTime, timer.state.timerStatus]);

  const toggleTimer = () => {
    if (timer.state.timerStatus === 'running') {
      timer.pause();
      return;
    }
    alarm.unlock();
    timer.start();
    void backgroundAudio.playFromGesture();
  };

  const selectTimer = (next: TimerDefinition) => timer.select(next);

  const createTimer = (next: TimerDefinition) => {
    timer.select(next);
    setRecentTimers(current => [next, ...current.filter(item => item.label !== next.label || item.duration !== next.duration)].slice(0, 5));
  };

  const updateAudio = (patch: Partial<AudioPreferences>) => setAudioPreferences(current => ({ ...current, ...patch }));

  const changeTrack = (trackId: string) => {
    const next = MUSIC_LIBRARY.find(track => track.id === trackId);
    if (!next) return;
    updateAudio({ selectedTrackId: trackId });
    void backgroundAudio.switchTrackFromGesture(next);
  };

  const changeMusicMuted = (musicMuted: boolean) => {
    updateAudio({ musicMuted });
    void backgroundAudio.setMutedFromGesture(musicMuted);
  };

  const requestNotifications = async () => {
    const granted = await notification.requestPermission();
    if (granted) updateAudio({ notificationsEnabled: true });
  };

  return <main className={`timer-page ${timer.state.timerStatus === 'completed' ? 'is-complete' : ''}`}>
    <header className="timer-header">
      <a className="timer-brand" href="/" aria-label="倒數一下首頁">
        <span className="timer-logo"><TimerLogo /></span>
        <span className="timer-brand-copy"><strong>倒數一下</strong><small>日常計時器</small></span>
      </a>
      <button className="sound-button" onClick={() => changeMusicMuted(!audioPreferences.musicMuted)} aria-label={audioPreferences.musicMuted ? '開啟背景音樂' : '關閉背景音樂'}>{audioPreferences.musicMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}<span>{audioPreferences.musicMuted ? '音樂靜音' : '背景音樂'}</span></button>
    </header>

    <section className="timer-shell">
      <div className="timer-copy">
        <div><p className="timer-kicker"><span />不用盯著時間</p><h1>選好，按下開始。</h1></div>
        <p>泡麵、茶、咖啡或一小段專注。時間到了，我會提醒你。</p>
      </div>

      <div className="timer-workspace">
        <section className="timer-stage" aria-live="polite">
          <TimerDisplay state={timer.state} />
          <TimerControls state={timer.state} onToggle={toggleTimer} onAdjust={timer.adjust} onReset={timer.reset} onRestoreOriginal={timer.restoreOriginal} />
        </section>

        <aside className="timer-side">
          <PresetPicker selectedId={timer.state.timerId} recentTimers={recentTimers} onSelect={selectTimer} />
          <CustomTimerForm onCreate={createTimer} />
          <MusicPanel
            preferences={audioPreferences}
            permission={notification.permission}
            needsInteraction={backgroundAudio.needsInteraction}
            onTrackChange={changeTrack}
            onVolumeChange={volume => updateAudio({ volume })}
            onMusicMutedChange={changeMusicMuted}
            onAlarmEnabledChange={alarmEnabled => updateAudio({ alarmEnabled })}
            onNotificationsChange={notificationsEnabled => updateAudio({ notificationsEnabled })}
            onRequestNotifications={() => void requestNotifications()}
            onResumeAudio={() => void backgroundAudio.playFromGesture()}
          />
        </aside>
      </div>
    </section>
  </main>;
}
