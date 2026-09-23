'use client';

import { Check, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { buildTimewellShareText, TIMEWELL_SHARE_TITLE } from '@/lib/share';

export function ShareButton({ completedMinutes }: { completedMinutes?: number }) {
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const copyFallback = async (text: string) => {
    const shareUrl = new URL('/', window.location.href).href;
    const content = `${text}\n${shareUrl}`;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  };

  const share = async () => {
    const text = buildTimewellShareText(completedMinutes);
    const url = new URL('/', window.location.href).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: TIMEWELL_SHARE_TITLE, text, url });
        setFeedback('已開啟分享');
        return;
      }
      await copyFallback(text);
      setFeedback('連結已複製');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      try {
        await copyFallback(text);
        setFeedback('連結已複製');
      } catch {
        setFeedback('暫時無法分享');
      }
    }
  };

  return <span className="share-wrap">
    <button className="sound-button share-button" onClick={() => void share()} aria-label={completedMinutes ? `分享這 ${Math.round(completedMinutes)} 分鐘` : '分享留時 Timewell'}>
      {feedback ? <Check size={17} /> : <Share2 size={17} />}
      <span>{completedMinutes ? '分享這段時間' : '分享留時'}</span>
    </button>
    <span className="share-feedback" role="status" aria-live="polite">{feedback}</span>
  </span>;
}
