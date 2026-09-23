import assert from 'node:assert/strict';
import test from 'node:test';
import { categoryMatches, deleteFocusRecord, FOCUS_RECORDS_KEY, FOCUS_SESSION_KEY, loadFocusRecords, loadFocusSession, saveFocusRecord, saveFocusSession } from '../lib/focus/focus-storage.ts';
import { createTimerState } from '../lib/timer/timer-reducer.ts';
import type { FocusRecord, FocusSessionSnapshot } from '../lib/focus/focus-types.ts';

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

test('focus session round-trips through storage and malformed JSON falls back safely', () => {
  storage.clear();
  const session: FocusSessionSnapshot = {
    version: 1,
    purpose: '完成提案',
    category: '工作',
    durationMinutes: 25,
    timer: createTimerState({ id: 'focus', label: '專注', note: '測試', emoji: '◌', duration: 25 * 60_000 }),
    startedAt: 1_000,
    activeStartedAt: null,
    accumulatedActiveMs: 60_000,
    pendingCompletion: null,
  };
  saveFocusSession(session);
  assert.deepEqual(loadFocusSession(), session);

  storage.set(FOCUS_SESSION_KEY, '{broken');
  assert.equal(loadFocusSession(), null);
});

test('focus records retain only the newest 500 entries', () => {
  storage.clear();
  for (let index = 0; index <= 500; index += 1) saveFocusRecord(record(`record-${index}`, index));
  const records = loadFocusRecords();
  assert.equal(records.length, 500);
  assert.equal(records[0]?.id, 'record-500');
  assert.equal(records.at(-1)?.id, 'record-1');
});

test('focus category validation accepts only supported categories', () => {
  assert.equal(categoryMatches('工作'), true);
  assert.equal(categoryMatches('運動'), false);
  assert.equal(categoryMatches(null), false);
});
