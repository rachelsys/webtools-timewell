'use client';

import { useMemo, useState } from 'react';
import { Bell, ChevronDown, Music2, Volume2, VolumeX } from 'lucide-react';
import { MUSIC_CATEGORIES, MUSIC_LIBRARY, type MusicCategory } from '@/config/music-library';
import type { AudioPreferences } from '@/lib/timer/timer-storage';

type Props = {
  preferences: AudioPreferences;
  permission: NotificationPermission | 'unsupported';
  needsInteraction: boolean;
  onTrackChange: (trackId: string) => void;
  onVolumeChange: (volume: number) => void;
  onMusicMutedChange: (muted: boolean) => void;
  onAlarmEnabledChange: (enabled: boolean) => void;
  onNotificationsChange: (enabled: boolean) => void;
  onRequestNotifications: () => void;
  onResumeAudio: () => void;
};

export function MusicPanel({ preferences, permission, needsInteraction, onTrackChange, onVolumeChange, onMusicMutedChange, onAlarmEnabledChange, onNotificationsChange, onRequestNotifications, onResumeAudio }: Props) {
  const [open, setOpen] = useState(false);
  const selected = MUSIC_LIBRARY.find(track => track.id === preferences.selectedTrackId) || MUSIC_LIBRARY[0];
  const [category, setCategory] = useState<MusicCategory>(selected.category);
  const tracks = useMemo(() => MUSIC_LIBRARY.filter(track => track.category === category), [category]);

  const changeCategory = (nextCategory: MusicCategory) => {
    setCategory(nextCategory);
    const firstTrack = MUSIC_LIBRARY.find(track => track.category === nextCategory);
    if (firstTrack && firstTrack.id !== preferences.selectedTrackId) onTrackChange(firstTrack.id);
  };

  return <section className={open ? 'music-panel is-open' : 'music-panel'}>
    <button className="music-summary" onClick={() => setOpen(value => !value)} aria-expanded={open}>
      <span className="music-icon"><Music2 size={18} /></span>
      <span><small>背景音樂</small><strong>{selected.title}</strong></span>
      <ChevronDown className="music-chevron" size={18} />
    </button>
    {open && <div className="music-body">
      <div className="category-tabs" aria-label="音樂分類">
        {(Object.keys(MUSIC_CATEGORIES) as MusicCategory[]).map(key => <button key={key} aria-pressed={category === key} onClick={() => changeCategory(key)}>{MUSIC_CATEGORIES[key]}</button>)}
      </div>
      <label className="track-select">選擇曲目<select value={preferences.selectedTrackId} onChange={event => onTrackChange(event.target.value)}>{tracks.map(track => <option key={track.id} value={track.id}>{track.title} · {track.variant}</option>)}</select></label>
      <div className="volume-control"><Volume2 size={17} /><input aria-label="背景音樂音量" type="range" min="0" max="1" step="0.05" value={preferences.volume} onChange={event => onVolumeChange(Number(event.target.value))} /><span>{Math.round(preferences.volume * 100)}%</span></div>
      <div className="audio-options">
        <button aria-pressed={preferences.musicMuted} onClick={() => onMusicMutedChange(!preferences.musicMuted)}>{preferences.musicMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}{preferences.musicMuted ? '音樂已靜音' : '背景音樂開啟'}</button>
        <button aria-pressed={preferences.alarmEnabled} onClick={() => onAlarmEnabledChange(!preferences.alarmEnabled)}><Bell size={16} />{preferences.alarmEnabled ? '完成鈴聲開啟' : '完成鈴聲關閉'}</button>
      </div>
      {permission === 'default' && <button className="notification-button" onClick={onRequestNotifications}>開啟桌面提醒</button>}
      {permission === 'granted' && <button className="notification-button" aria-pressed={preferences.notificationsEnabled} onClick={() => onNotificationsChange(!preferences.notificationsEnabled)}>{preferences.notificationsEnabled ? '桌面提醒已開啟' : '桌面提醒已關閉'}</button>}
      {permission === 'denied' && <p className="audio-note">瀏覽器已封鎖桌面提醒，可從網址列設定中重新開啟。</p>}
      {permission === 'unsupported' && <p className="audio-note">此瀏覽器不支援桌面提醒。</p>}
      {needsInteraction && <button className="resume-audio" onClick={onResumeAudio}>點一下恢復背景音</button>}
      <p className="audio-note">音樂會循環播放，並跟著倒數暫停、繼續與停止。</p>
    </div>}
  </section>;
}
