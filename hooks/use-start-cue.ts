'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { CueProfile } from '@/config/timer-experiences';

type Options = { muted: boolean; volume: number };

type Note = { at: number; frequency: number; duration: number; type?: OscillatorType; endFrequency?: number };

const CUES: Record<CueProfile, Note[]> = {
  'water-drops': [{ at: 0, frequency: 740, duration: .13, type: 'sine', endFrequency: 560 }, { at: .2, frequency: 880, duration: .13, type: 'sine', endFrequency: 650 }, { at: .4, frequency: 1030, duration: .16, type: 'sine', endFrequency: 710 }],
  'cup-rim': [{ at: .02, frequency: 1760, duration: .2, type: 'sine' }, { at: .39, frequency: 2090, duration: .19, type: 'sine' }],
  'wood-double': [{ at: 0, frequency: 215, duration: .12, type: 'triangle', endFrequency: 175 }, { at: .24, frequency: 250, duration: .14, type: 'triangle', endFrequency: 195 }],
  'breath-down': [{ at: 0, frequency: 240, duration: .68, type: 'sine', endFrequency: 126 }],
  'focus-bell': [{ at: .04, frequency: 750, duration: .38, type: 'sine' }],
  'soft-double': [{ at: 0, frequency: 520, duration: .15, type: 'sine' }, { at: .26, frequency: 660, duration: .19, type: 'sine' }],
};

export function useStartCue({ muted, volume }: Options) {
  const contextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);

  const getContext = useCallback(() => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    contextRef.current = contextRef.current || new AudioContextClass();
    return contextRef.current;
  }, []);

  const unlock = useCallback(() => {
    try { void getContext()?.resume(); } catch { /* The timer never depends on audio. */ }
  }, [getContext]);

  const play = useCallback((profile: CueProfile) => {
    if (muted) return;
    try {
      const context = getContext();
      if (!context) return;
      void context.resume();
      const gainLevel = Math.max(.015, Math.min(.26, volume * .34));
      nodesRef.current.forEach(node => { try { node.stop(); } catch { /* Already stopped. */ } });
      nodesRef.current = CUES[profile].map(note => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + note.at;
        oscillator.type = note.type ?? 'sine';
        oscillator.frequency.setValueAtTime(note.frequency, start);
        if (note.endFrequency) oscillator.frequency.exponentialRampToValueAtTime(note.endFrequency, start + note.duration);
        gain.gain.setValueAtTime(.0001, start);
        gain.gain.exponentialRampToValueAtTime(gainLevel, start + Math.min(.035, note.duration / 3));
        gain.gain.exponentialRampToValueAtTime(.0001, start + note.duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + note.duration + .03);
        return oscillator;
      });
    } catch { /* The timer continues if Web Audio is unavailable. */ }
  }, [getContext, muted, volume]);

  useEffect(() => () => {
    nodesRef.current.forEach(node => { try { node.stop(); } catch { /* Already stopped. */ } });
    nodesRef.current = [];
    if (contextRef.current) void contextRef.current.close();
    contextRef.current = null;
  }, []);

  return { unlock, play };
}
