import assert from 'node:assert/strict';
import test from 'node:test';
import { deleteFocusRecord, FOCUS_RECORDS_KEY, loadFocusRecords, saveFocusRecord } from '../lib/focus/focus-storage.ts';
import type { FocusRecord } from '../lib/focus/focus-types.ts';

const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) } } });
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: globalThis.window.localStorage });

const record = (id: string, completedAt: number): FocusRecord => ({ id, schemaVersion: 1, createdAt: completedAt, startedAt: completedAt - 60_000, completedAt, purpose: null, category: null, plannedDurationSec: 60, actualDurationSec: 60, result: 'completed', mode: 'focus', pomodoroSessionId: null, pomodoroRound: null, endedReason: 'timer_completed' });

test('focus records are saved newest first and can be deleted individually', () => {
  storage.clear();
  saveFocusRecord(record('older', 100));
  saveFocusRecord(record('newer', 200));
  assert.deepEqual(loadFocusRecords().map(item => item.id), ['newer', 'older']);
  assert.deepEqual(deleteFocusRecord('newer').map(item => item.id), ['older']);
});

test('malformed focus records are ignored without losing valid records', () => {
  storage.set(FOCUS_RECORDS_KEY, JSON.stringify([{ nope: true }, record('valid', 300)]));
  assert.deepEqual(loadFocusRecords().map(item => item.id), ['valid']);
});
