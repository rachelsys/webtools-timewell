import type { MusicCategory } from './music-library.ts';

export type CueProfile = 'water-drops' | 'cup-rim' | 'wood-double' | 'breath-down' | 'focus-bell' | 'soft-double';

export type TimerExperience = {
  cue: CueProfile;
  cueDuration: number;
  defaultCategory?: MusicCategory;
  accent: string;
  accentDeep: string;
  glow: string;
  motion: 'ripple' | 'pulse' | 'breathe' | 'focus' | 'soft';
  startCopy: string;
  completeCopy: string;
};

const CUSTOM_EXPERIENCE: TimerExperience = {
  cue: 'soft-double',
  cueDuration: 520,
  accent: '#ff7358',
  accentDeep: '#f35e46',
  glow: 'rgba(255, 115, 88, .34)',
  motion: 'soft',
  startCopy: '計時開始，照自己的節奏。',
  completeCopy: '時間到了，回來看看。',
};

export const TIMER_EXPERIENCES: Record<string, TimerExperience> = {
  noodles: { cue: 'water-drops', cueDuration: 620, defaultCategory: 'rain', accent: '#f2765b', accentDeep: '#d85743', glow: 'rgba(242, 118, 91, .38)', motion: 'ripple', startCopy: '水滾了，接下來交給時間。', completeCopy: '剛剛好，趁熱開動。' },
  tea: { cue: 'cup-rim', cueDuration: 680, defaultCategory: 'morning', accent: '#62a978', accentDeep: '#3f8060', glow: 'rgba(98, 169, 120, .32)', motion: 'ripple', startCopy: '讓香氣慢慢展開。', completeCopy: '時間到了，可以慢慢喝了。' },
  coffee: { cue: 'wood-double', cueDuration: 480, defaultCategory: 'cafe', accent: '#d99142', accentDeep: '#aa6528', glow: 'rgba(217, 145, 66, .34)', motion: 'pulse', startCopy: '等一杯剛好的節奏。', completeCopy: '好了，回來喝一口。' },
  break: { cue: 'breath-down', cueDuration: 760, defaultCategory: 'quiet', accent: '#7778c4', accentDeep: '#54559d', glow: 'rgba(119, 120, 196, .34)', motion: 'breathe', startCopy: '這幾分鐘，什麼都不用做。', completeCopy: '休息夠了，慢慢回來。' },
  focus: { cue: 'focus-bell', cueDuration: 520, defaultCategory: 'night', accent: '#4252a8', accentDeep: '#2d367c', glow: 'rgba(66, 82, 168, .36)', motion: 'focus', startCopy: '這段時間，只做一件事。', completeCopy: '完成一段專注，先停一下。' },
};

export function getTimerExperience(timerId: string): TimerExperience {
  return TIMER_EXPERIENCES[timerId] ?? CUSTOM_EXPERIENCE;
}
