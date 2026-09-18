import type { FocusCategory, FocusRecord, FocusResult, FocusSessionSnapshot } from './focus-types';

export const FOCUS_RECORDS_KEY = 'anything-useful:focus-records:v1';
export const FOCUS_SESSION_KEY = 'anything-useful:focus-settings:v1';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isResult = (value: unknown): value is FocusResult => value === 'completed' || value === 'partially_completed' || value === 'not_completed';

function isRecord(value: unknown): value is FocusRecord {
  return isObject(value)
    && value.schemaVersion === 1
    && value.mode === 'focus'
    && value.endedReason === 'timer_completed'
    && typeof value.id === 'string'
    && typeof value.createdAt === 'number'
    && typeof value.completedAt === 'number'
    && typeof value.actualDurationSec === 'number'
    && isResult(value.result);
}

export function loadFocusRecords(): FocusRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(FOCUS_RECORDS_KEY) || '[]');
    return Array.isArray(value) ? value.filter(isRecord).sort((a, b) => b.completedAt - a.completedAt) : [];
  } catch { return []; }
}

export function saveFocusRecord(record: FocusRecord) {
  const records = [record, ...loadFocusRecords()].slice(0, 500);
  try { localStorage.setItem(FOCUS_RECORDS_KEY, JSON.stringify(records)); } catch { /* Device storage is optional. */ }
  return records;
}

export function deleteFocusRecord(id: string) {
  const records = loadFocusRecords().filter(record => record.id !== id);
  try { localStorage.setItem(FOCUS_RECORDS_KEY, JSON.stringify(records)); } catch { /* Device storage is optional. */ }
  return records;
}

export function loadFocusSession(): FocusSessionSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(FOCUS_SESSION_KEY) || 'null');
    return isObject(value) && value.version === 1 ? value as FocusSessionSnapshot : null;
  } catch { return null; }
}

export function saveFocusSession(value: FocusSessionSnapshot) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(FOCUS_SESSION_KEY, JSON.stringify(value)); } catch { /* Device storage is optional. */ }
}

export const focusResultLabels: Record<FocusResult, string> = {
  completed: '完成了',
  partially_completed: '完成一部分',
  not_completed: '還沒完成',
};

export function categoryMatches(value: unknown): value is FocusCategory {
  return typeof value === 'string' && ['工作', '學習', '閱讀', '整理', '創作', '其他'].includes(value);
}
