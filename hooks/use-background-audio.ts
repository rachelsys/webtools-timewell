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
  const statusRef = useRef(status);
  const delayedStartRef = useRef<number | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  useEffect(() => { statusRef.current = status; }, [status]);

  const clearScheduledAudio = useCallback(() => {
    if (delayedStartRef.current !== null) window.clearTimeout(delayedStartRef.current);
    if (fadeRef.current !== null) window.clearInterval(fadeRef.current);
    delayedStartRef.current = null;
    fadeRef.current = null;
  }, []);

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
    clearScheduledAudio();
    audio.volume = volume;
    try {
      await audio.play();
      setNeedsInteraction(false);
    } catch {
      setNeedsInteraction(true);
    }
  }, [clearScheduledAudio, muted, setTrack, track, volume]);

  const playAfterCueFromGesture = useCallback((cueDuration: number) => {
    const audio = setTrack(track);
    if (!audio || muted) return;
    clearScheduledAudio();
    audio.pause();
    delayedStartRef.current = window.setTimeout(() => {
      delayedStartRef.current = null;
      if (statusRef.current !== 'running' || muted) return;
      audio.volume = 0;
      audio.play().then(() => {
        setNeedsInteraction(false);
        const startedAt = Date.now();
        fadeRef.current = window.setInterval(() => {
          const progress = Math.min(1, (Date.now() - startedAt) / 500);
          audio.volume = volume * progress;
          if (progress >= 1 && fadeRef.current !== null) {
            window.clearInterval(fadeRef.current);
            fadeRef.current = null;
          }
        }, 40);
      }).catch(() => setNeedsInteraction(true));
    }, cueDuration);
  }, [clearScheduledAudio, muted, setTrack, track, volume]);

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
      clearScheduledAudio();
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [clearScheduledAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    const audio = setTrack(track);
    if (!audio) return;
    if (status === 'running') {
      if (delayedStartRef.current === null) void attemptPlay();
    }
    else {
      clearScheduledAudio();
      audio.pause();
      if (status === 'idle' || status === 'completed') audio.currentTime = 0;
    }
  }, [attemptPlay, clearScheduledAudio, setTrack, status, track]);

  return { needsInteraction, playFromGesture: attemptPlay, playAfterCueFromGesture, switchTrackFromGesture, setMutedFromGesture };
}
