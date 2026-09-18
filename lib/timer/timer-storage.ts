import { DEFAULT_TRACK_ID, MUSIC_LIBRARY } from '../../config/music-library.ts';
import { getTimerExperience } from '../../config/timer-experiences.ts';
import type { TimerDefinition, TimerState, TimerStatus } from './timer-types';

export const APP_STORAGE_KEY = 'anything-useful:app:v3';
export const LEGACY_APP_STORAGE_KEY = 'anything-useful:v2';
const LEGACY_RECENT_KEY = 'anything-timer-recent';

export type AudioPreferences = {
  selectedTrackId: string;
  trackByTimerId: Record<string, string>;
  volume: number;
  musicMuted: boolean;
  alarmEnabled: boolean;
  notificationsEnabled: boolean;
};

export type PersistedAppState = {
  version: 3;
  timer: TimerState;
  recentTimers: TimerDefinition[];
  audio: AudioPreferences;
  lastNotifiedRunId: number;
};

export const DEFAULT_AUDIO_PREFERENCES: AudioPreferences = {
  selectedTrackId: DEFAULT_TRACK_ID,
  trackByTimerId: {},
  volume: 0.45,
  musicMuted: false,
  alarmEnabled: true,
  notificationsEnabled: false,
};

const isTrackId = (value: unknown): value is string => typeof value === 'string' && MUSIC_LIBRARY.some(track => track.id === value);

export function getTrackIdForTimer(preferences: AudioPreferences, timerId: string): string {
  const remembered = preferences.trackByTimerId[timerId];
  if (isTrackId(remembered)) return remembered;
  const experience = getTimerExperience(timerId);
  const defaultTrack = experience.defaultCategory && MUSIC_LIBRARY.find(track => track.category === experience.defaultCategory);
  if (defaultTrack) return defaultTrack.id;
  return isTrackId(preferences.selectedTrackId) ? preferences.selectedTrackId : DEFAULT_TRACK_ID;
}

function normalizeTrackMap(value: unknown): Record<string, string> {
  if (!isObject(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([timerId, trackId]) => timerId.length > 0 && isTrackId(trackId)));
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const numberOr = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;

function normalizeTimer(value: unknown, fallback: TimerState): TimerState {
  if (!isObject(value)) return fallback;
  const status = value.timerStatus;
  const timerStatus: TimerStatus = status === 'idle' || status === 'running' || status === 'paused' || status === 'completed' ? status : fallback.timerStatus;
  return {
    originalDuration: Math.max(60_000, numberOr(value.originalDuration, fallback.originalDuration)),
    currentDuration: Math.max(60_000, numberOr(value.currentDuration, fallback.currentDuration)),
    remainingTime: Math.max(0, numberOr(value.remainingTime, fallback.remainingTime)),
    endTime: typeof value.endTime === 'number' && Number.isFinite(value.endTime) ? value.endTime : null,
    timerStatus,
    timerId: typeof value.timerId === 'string' ? value.timerId : fallback.timerId,
    label: typeof value.label === 'string' ? value.label : fallback.label,
    note: typeof value.note === 'string' ? value.note : fallback.note,
    emoji: typeof value.emoji === 'string' ? value.emoji : fallback.emoji,
    runId: Math.max(0, numberOr(value.runId, fallback.runId)),
  };
}

function normalizeRecent(value: unknown): TimerDefinition[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!isObject(item)) return [];
    const label = typeof item.label === 'string' ? item.label : typeof item.name === 'string' ? item.name : '';
    const milliseconds = typeof item.duration === 'number'
      ? item.duration
      : typeof item.minutes === 'number'
        ? item.minutes * 60_000
        : 0;
    if (!label || !Number.isFinite(milliseconds) || milliseconds < 60_000) return [];
    return [{
      id: typeof item.id === 'string' ? item.id : `legacy-${index}-${label}`,
      label,
      duration: Math.min(180 * 60_000, milliseconds),
      note: typeof item.note === 'string' ? item.note : `${Math.round(milliseconds / 60_000)} 分鐘，照自己的節奏`,
      emoji: typeof item.emoji === 'string' ? item.emoji : '✦',
    }];
  }).slice(0, 5);
}

export function loadPersistedApp(fallbackTimer: TimerState): PersistedAppState {
  const fallback: PersistedAppState = {
    version: 3,
    timer: fallbackTimer,
    recentTimers: [],
    audio: DEFAULT_AUDIO_PREFERENCES,
    lastNotifiedRunId: 0,
  };
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY) || localStorage.getItem(LEGACY_APP_STORAGE_KEY);
    const parsed: unknown = JSON.parse(raw || 'null');
    if (isObject(parsed) && (parsed.version === 2 || parsed.version === 3)) {
      const audio = isObject(parsed.audio) ? parsed.audio : {};
      const selectedTrackId = isTrackId(audio.selectedTrackId)
        ? audio.selectedTrackId
        : DEFAULT_TRACK_ID;
      return {
        version: 3,
        timer: normalizeTimer(parsed.timer, fallbackTimer),
        recentTimers: normalizeRecent(parsed.recentTimers),
        audio: {
          selectedTrackId,
          trackByTimerId: normalizeTrackMap(audio.trackByTimerId),
          volume: Math.min(1, Math.max(0, numberOr(audio.volume, DEFAULT_AUDIO_PREFERENCES.volume))),
          musicMuted: typeof audio.musicMuted === 'boolean' ? audio.musicMuted : false,
          alarmEnabled: typeof audio.alarmEnabled === 'boolean' ? audio.alarmEnabled : true,
          notificationsEnabled: typeof audio.notificationsEnabled === 'boolean' ? audio.notificationsEnabled : false,
        },
        lastNotifiedRunId: Math.max(0, numberOr(parsed.lastNotifiedRunId, 0)),
      };
    }
  } catch { /* Fall through to the legacy migration. */ }

  try {
    return { ...fallback, recentTimers: normalizeRecent(JSON.parse(localStorage.getItem(LEGACY_RECENT_KEY) || '[]')) };
  } catch {
    return fallback;
  }
}

export function savePersistedApp(value: PersistedAppState) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(value)); } catch { /* Storage is optional. */ }
}

export function patchPersistedAudioPreferences(patch: Partial<AudioPreferences>, fallbackTimer: TimerState) {
  const current = loadPersistedApp(fallbackTimer);
  const next = { ...current, audio: { ...current.audio, ...patch } };
  savePersistedApp(next);
  return next.audio;
}
