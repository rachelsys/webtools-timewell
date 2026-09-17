import assert from 'node:assert/strict';
import test from 'node:test';
import { TIMER_EXPERIENCES, getTimerExperience } from '../config/timer-experiences.ts';

test('preset timer experiences use distinct cues and their requested music categories', () => {
  const entries = Object.entries(TIMER_EXPERIENCES);
  assert.equal(entries.length, 5);
  assert.equal(new Set(entries.map(([, experience]) => experience.cue)).size, 5);
  assert.deepEqual(Object.fromEntries(entries.map(([id, experience]) => [id, experience.defaultCategory])), {
    noodles: 'rain', tea: 'morning', coffee: 'cafe', break: 'quiet', focus: 'night',
  });
});

test('custom timers fall back to the neutral soft-double cue', () => {
  const custom = getTimerExperience('custom-123');
  assert.equal(custom.cue, 'soft-double');
  assert.equal(custom.defaultCategory, undefined);
});
