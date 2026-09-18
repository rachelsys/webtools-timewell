import assert from 'node:assert/strict';
import test from 'node:test';
import { createTimerState } from '../lib/timer/timer-reducer.ts';
import { DEFAULT_AUDIO_PREFERENCES, LEGACY_APP_STORAGE_KEY, getTrackIdForTimer, loadPersistedApp } from '../lib/timer/timer-storage.ts';
import type { TimerDefinition } from '../lib/timer/timer-types.ts';

const timer: TimerDefinition = { id: 'noodles', label: '泡麵', note: '測試', emoji: '🍜', duration: 180_000 };
const storage = new Map<string, string>();

function installStorage() {
  storage.clear();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) } } });
}

test('each timer uses its remembered track, with a category default for untouched presets', () => {
  const preferences = { ...DEFAULT_AUDIO_PREFERENCES, trackByTimerId: { noodles: 'track-08', tea: 'track-30' } };
  assert.equal(getTrackIdForTimer(preferences, 'noodles'), 'track-08');
  assert.equal(getTrackIdForTimer(preferences, 'tea'), 'track-30');
  assert.equal(getTrackIdForTimer(DEFAULT_AUDIO_PREFERENCES, 'coffee'), 'track-03');
});

test('v2 storage migrates safely when trackByTimerId is absent or contains a removed track', () => {
  installStorage();
  storage.set(LEGACY_APP_STORAGE_KEY, JSON.stringify({ version: 2, timer: createTimerState(timer), recentTimers: [], audio: { selectedTrackId: 'track-02', volume: .5, musicMuted: false, alarmEnabled: true, notificationsEnabled: false, trackByTimerId: { noodles: 'removed-track' } }, lastNotifiedRunId: 0 }));
  const loaded = loadPersistedApp(createTimerState(timer));
  assert.deepEqual(loaded.audio.trackByTimerId, {});
  assert.equal(getTrackIdForTimer(loaded.audio, 'noodles'), 'track-07');
  assert.equal(loaded.version, 3);
});
