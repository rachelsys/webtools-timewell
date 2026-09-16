'use client';

import { useCallback, useEffect, useState } from 'react';

export function useTimerNotification(enabled: boolean) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setPermission('Notification' in window ? Notification.permission : 'unsupported');
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return false;
    }
    const next = await Notification.requestPermission();
    setPermission(next);
    return next === 'granted';
  }, []);

  const notify = useCallback((label: string) => {
    if (!enabled || permission !== 'granted' || !document.hidden) return false;
    try {
      new Notification('倒數完成', { body: `${label}時間到了，可以回來了。`, icon: '/favicon.svg' });
      return true;
    } catch {
      return false;
    }
  }, [enabled, permission]);

  return { permission, requestPermission, notify };
}

