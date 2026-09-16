'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useAlarm(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  const unlock = useCallback(() => {
    if (!enabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      contextRef.current = contextRef.current || new AudioContextClass();
      void contextRef.current.resume();
    } catch { /* Alarm remains optional. */ }
  }, [enabled]);

  const play = useCallback(() => {
    if (!enabled) return;
    try {
      unlock();
      const context = contextRef.current;
      if (!context) return;
      [0, .16, .34].forEach((delay, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = [660, 880, 990][index];
        gain.gain.setValueAtTime(.0001, context.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(.16, context.currentTime + delay + .02);
        gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + delay + .34);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(context.currentTime + delay);
        oscillator.stop(context.currentTime + delay + .38);
      });
    } catch { /* Alarm remains optional. */ }
  }, [enabled, unlock]);

  useEffect(() => () => {
    const context = contextRef.current;
    if (context) void context.close();
    contextRef.current = null;
  }, []);

  return { unlock, play };
}

