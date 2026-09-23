import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTimewellShareText } from '../lib/share.ts';

test('default share copy explains the product without exposing user data', () => {
  assert.equal(buildTimewellShareText(), '我最近在用「留時 Timewell」——不用登入，選一個時間就能開始。');
});

test('completion share copy includes only rounded duration', () => {
  const text = buildTimewellShareText(24.6);
  assert.match(text, /25 分鐘/);
  assert.doesNotMatch(text, /purpose|label|目的/);
});
