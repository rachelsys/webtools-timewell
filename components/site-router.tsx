'use client';

import { useEffect, useState } from 'react';
import FocusApp from './focus/focus-app';
import RecordsApp from './records/records-app';
import TimerApp from './timer-app';

export default function SiteRouter() {
  const [pathname, setPathname] = useState('/');

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname.replace(/\/$/, '') || '/');
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  if (pathname === '/focus') return <FocusApp />;
  if (pathname === '/records') return <RecordsApp />;
  return <TimerApp />;
}
