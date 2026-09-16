'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MusicTrack } from '@/config/music-library';
import type { TimerStatus } from '@/lib/timer/timer-types';

type Options = {
  status: TimerStatus;
  track: MusicTrack;
  volume: number;
  muted: boolean;
};

export function useBackgroundAudio({ status, track, volume, muted }: Options) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const setTrack = useCallback((next: MusicTrack) => {
    const audio = audioRef.current;
    if (!audio || audio.dataset.trackId === next.id) return audio;
    audio.pause();
    audio.src = next.src;
    audio.dataset.trackId = next.id;
    audio.currentTime = 0;
    audio.load();
    return audio;
  }, []);

  const attemptPlay = useCallback(async () => {
    const audio = setTrack(track);
    if (!audio || muted) return;
    try {
      await audio.play();
      setNeedsInteraction(false);
    } catch {
      setNeedsInteraction(true);
    }
  }, [muted, setTrack, track]);

  const switchTrackFromGesture = useCallback(async (next: MusicTrack) => {
    const audio = setTrack(next);
    if (!audio || status !== 'running' || muted) return;
    try {
      await audio.play();
      setNeedsInteraction(false);
    } catch {
      setNeedsInteraction(true);
    }
  }, [muted, setTrack, status]);

  const setMutedFromGesture = useCallback(async (nextMuted: boolean) => {
    const audio = setTrack(track);
    if (!audio) return;
    audio.muted = nextMuted;
    if (nextMuted || status !== 'running') return;
    try {
      await audio.play();
      setNeedsInteraction(false);
    } catch {
      setNeedsInteraction(true);
    }
  }, [setTrack, status, track]);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'metadata';
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    const audio = setTrack(track);
    if (!audio) return;
    if (status === 'running') void attemptPlay();
    else {
      audio.pause();
      if (status === 'idle' || status === 'completed') audio.currentTime = 0;
    }
  }, [attemptPlay, setTrack, status, track]);

  return { needsInteraction, playFromGesture: attemptPlay, switchTrackFromGesture, setMutedFromGesture };
}
