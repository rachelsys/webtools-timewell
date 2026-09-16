import type { TimerDefinition } from '@/lib/timer/timer-types';

export const TIMER_PRESETS: TimerDefinition[] = [
  { id: 'noodles', emoji: '🍜', label: '泡麵', duration: 3 * 60_000, note: '剛剛好的彈牙' },
  { id: 'tea', emoji: '🍵', label: '茶', duration: 5 * 60_000, note: '讓茶葉慢慢舒展' },
  { id: 'coffee', emoji: '☕', label: '咖啡', duration: 4 * 60_000, note: '手沖的安靜片刻' },
  { id: 'break', emoji: '🫧', label: '小休息', duration: 10 * 60_000, note: '離開螢幕一下' },
  { id: 'focus', emoji: '◌', label: '專注', duration: 25 * 60_000, note: '完成一件重要的事' },
];

export const DEFAULT_TIMER = TIMER_PRESETS[0];

