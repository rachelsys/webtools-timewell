'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock3, Trash2 } from 'lucide-react';
import { FOCUS_CATEGORIES, type FocusCategory, type FocusRecord, type FocusResult } from '@/lib/focus/focus-types';
import { deleteFocusRecord, focusResultLabels, loadFocusRecords } from '@/lib/focus/focus-storage';
import { SiteHeader } from '@/components/site-header';

type Range = 'all' | 'today' | '7' | '30';

const formatDate = (timestamp: number) => new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(timestamp);
const formatMinutes = (seconds: number) => seconds < 60 ? `${seconds} 秒` : `${Math.round(seconds / 60)} 分鐘`;

export default function RecordsApp() {
  const [records, setRecords] = useState<FocusRecord[]>([]);
  const [range, setRange] = useState<Range>('all');
  const [category, setCategory] = useState<FocusCategory | 'all'>('all');
  const [result, setResult] = useState<FocusResult | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<FocusRecord | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const timeout = window.setTimeout(() => setRecords(loadFocusRecords()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const filtered = useMemo(() => {
    const startOfToday = new Date(now).setHours(0, 0, 0, 0);
    return records.filter(record => {
      const after = range === 'all' ? 0 : range === 'today' ? startOfToday : now - Number(range) * 86400000;
      return record.completedAt >= after && (category === 'all' || record.category === category) && (result === 'all' || record.result === result);
    });
  }, [records, range, category, result, now]);

  return <main className="timer-page records-page">
    <SiteHeader current="records" />
    <section className="records-shell">
      <header className="records-title"><div><p className="timer-kicker"><span />MY RECORDS</p><h1>我的專注紀錄</h1><p>不是績效表，只是回頭看見：時間真的有被好好用過。</p></div><Link href="/focus">開始一段專注</Link></header>
      <section className="records-panel">
        <div className="record-filters">
          <label>日期<select value={range} onChange={event => setRange(event.target.value as Range)}><option value="all">全部時間</option><option value="today">今天</option><option value="7">最近 7 天</option><option value="30">最近 30 天</option></select></label>
          <label>分類<select value={category} onChange={event => setCategory(event.target.value as FocusCategory | 'all')}><option value="all">全部分類</option>{FOCUS_CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label>
          <label>結果<select value={result} onChange={event => setResult(event.target.value as FocusResult | 'all')}><option value="all">全部結果</option><option value="completed">完成了</option><option value="partially_completed">完成一部分</option><option value="not_completed">還沒完成</option></select></label>
          <span>{filtered.length} 筆</span>
        </div>
        {filtered.length ? <div className="record-list">{filtered.map(record => <article className="record-item" key={record.id}>
          <div className={`record-result result-${record.result}`}>{record.result === 'completed' ? '✓' : record.result === 'partially_completed' ? '◐' : '○'}</div>
          <div className="record-main"><div><h2>{record.purpose || '未設定目的'}</h2>{record.category && <span className="record-category">{record.category}</span>}</div><p><span><CalendarDays size={14} />{formatDate(record.completedAt)}</span><span><Clock3 size={14} />實際專注 {formatMinutes(record.actualDurationSec)}</span><strong>{focusResultLabels[record.result]}</strong></p></div>
          <button className="record-delete" onClick={() => setDeleteTarget(record)} aria-label={`刪除 ${record.purpose || '未設定目的'} 的紀錄`}><Trash2 size={17} /></button>
        </article>)}</div> : <div className="records-empty"><span>◌</span><h2>{records.length ? '沒有符合條件的紀錄' : '還沒有專注紀錄'}</h2><p>{records.length ? '換一組篩選條件看看。' : '完成一段專注後，你可以選擇把它留在這裡。'}</p><Link href="/focus">開始專注</Link></div>}
      </section>
    </section>
    {deleteTarget && <div className="focus-modal-backdrop"><section className="focus-modal compact" role="alertdialog" aria-modal="true"><h2>刪除這筆紀錄？</h2><p>「{deleteTarget.purpose || '未設定目的'}」刪除後無法復原。</p><div className="focus-modal-actions"><button className="secondary" onClick={() => setDeleteTarget(null)}>保留</button><button className="danger" onClick={() => { setRecords(deleteFocusRecord(deleteTarget.id)); setDeleteTarget(null); }}>刪除</button></div></section></div>}
  </main>;
}
