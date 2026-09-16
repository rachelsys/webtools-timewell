import assert from 'node:assert/strict';
import test from 'node:test';
import { createTimerState, getRemainingTime, timerReducer } from '../lib/timer/timer-reducer.ts';
import type { TimerDefinition } from '../lib/timer/timer-types.ts';

const FIVE_MINUTES = 5 * 60_000;
const timer: TimerDefinition = { id: 'test', label: '測試', note: '測試用', emoji: '⏱', duration: FIVE_MINUTES };
const fresh = () => createTimerState(timer);

test('start uses endTime as the source of truth', () => {
  const state = timerReducer(fresh(), { type: 'start', now: 1_000 });
  assert.equal(state.timerStatus, 'running');
  assert.equal(state.endTime, 1_000 + FIVE_MINUTES);
  assert.equal(getRemainingTime(state, 61_000), 4 * 60_000);
});

test('pause and resume preserve the actual remaining time', () => {
  const running = timerReducer(fresh(), { type: 'start', now: 0 });
  const paused = timerReducer(running, { type: 'pause', now: 100_000 });
  assert.equal(paused.timerStatus, 'paused');
  assert.equal(paused.remainingTime, 200_000);
  const resumed = timerReducer(paused, { type: 'start', now: 150_000 });
  assert.equal(resumed.endTime, 350_000);
  assert.equal(resumed.runId, running.runId);
});

test('+1 while running adjusts both current duration and live remaining time', () => {
  const running = timerReducer(fresh(), { type: 'start', now: 0 });
  const adjusted = timerReducer(running, { type: 'adjust', delta: 60_000, now: 100_000 });
  assert.equal(adjusted.currentDuration, 6 * 60_000);
  assert.equal(adjusted.remainingTime, 260_000);
  assert.equal(adjusted.endTime, 360_000);
});

test('-1 while running adjusts both current duration and live remaining time', () => {
  const running = timerReducer(fresh(), { type: 'start', now: 0 });
  const adjusted = timerReducer(running, { type: 'adjust', delta: -60_000, now: 100_000 });
  assert.equal(adjusted.currentDuration, 4 * 60_000);
  assert.equal(adjusted.remainingTime, 140_000);
  assert.equal(adjusted.endTime, 240_000);
});

test('reset returns to currentDuration', () => {
  const adjusted = timerReducer(fresh(), { type: 'adjust', delta: 60_000, now: 0 });
  const running = timerReducer(adjusted, { type: 'start', now: 0 });
  const reset = timerReducer(running, { type: 'reset' });
  assert.equal(reset.timerStatus, 'idle');
  assert.equal(reset.remainingTime, 6 * 60_000);
});

test('restore original reverses duration adjustments', () => {
  const adjusted = timerReducer(fresh(), { type: 'adjust', delta: 60_000, now: 0 });
  const restored = timerReducer(adjusted, { type: 'restoreOriginal' });
  assert.equal(restored.currentDuration, FIVE_MINUTES);
  assert.equal(restored.remainingTime, FIVE_MINUTES);
});

test('tick completes an expired timer', () => {
  const running = timerReducer(fresh(), { type: 'start', now: 0 });
  const completed = timerReducer(running, { type: 'tick', now: FIVE_MINUTES + 1 });
  assert.equal(completed.timerStatus, 'completed');
  assert.equal(completed.remainingTime, 0);
  assert.equal(completed.endTime, null);
});

test('hydration reconciles a background timer against the current timestamp', () => {
  const running = timerReducer(fresh(), { type: 'start', now: 10_000 });
  const hydrated = timerReducer(fresh(), { type: 'hydrate', state: running, now: 70_000 });
  assert.equal(hydrated.timerStatus, 'running');
  assert.equal(hydrated.remainingTime, 4 * 60_000);
});
