import type { ReactNode } from 'react';
import { TimerLogo } from './timer/timer-logo';
import { ShareButton } from './share-button';

export function SiteHeader({ current, action, shareMinutes }: { current: 'quick' | 'focus' | 'records'; action?: ReactNode; shareMinutes?: number }) {
  return <header className="timer-header site-header">
    <a className="timer-brand" href="/" aria-label="倒數一下首頁">
      <span className="timer-logo"><TimerLogo /></span>
      <span className="timer-brand-copy"><strong>倒數一下</strong><small>把時間留給重要的事</small></span>
    </a>
    <nav className="site-nav" aria-label="主要導覽">
      <a href="/" aria-current={current === 'quick' ? 'page' : undefined}>快速倒數</a>
      <a href="/focus" aria-current={current === 'focus' ? 'page' : undefined}>專注模式</a>
      <a href="/records" aria-current={current === 'records' ? 'page' : undefined}>我的紀錄</a>
    </nav>
    <div className="header-action"><ShareButton completedMinutes={shareMinutes} />{action}</div>
  </header>;
}
