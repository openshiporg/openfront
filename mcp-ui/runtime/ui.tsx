import { useEffect, useState } from 'react';
import { Button } from '../vendor/action-button';
import { Shell, ShellHeader, Panel } from '../vendor/surface';

export const money = (n: number | undefined, currency = 'USD') =>
  typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('en-US', { style: 'currency', currency })
    : 'Price unavailable';

/** Status line: a dot plus text, never a pill. */
export function Note({ tone, children }: { tone: 'positive' | 'negative' | 'neutral'; children: React.ReactNode }) {
  const dot = tone === 'positive' ? 'bg-positive' : tone === 'negative' ? 'bg-negative' : 'bg-muted-foreground';
  return (
    <p role="status" className="flex items-start gap-2 px-1 pt-2 text-[0.8125rem] text-muted-foreground">
      <span aria-hidden="true" className={`mt-[0.45rem] size-1.5 shrink-0 rounded-full ${dot}`} />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

export function useBusy() {
  const [busy, setBusy] = useState(false);
  const run = async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    try { return await fn(); } finally { setBusy(false); }
  };
  return { busy, run };
}

/** Host reports its theme through iframe render data; fall back to the OS setting until it arrives. */
export function useTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    let fromHost = false;
    const apply = (dark: boolean) => root.classList.toggle('dark', dark);
    apply(media.matches);
    const onMedia = () => { if (!fromHost) apply(media.matches); };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || event.data?.type !== 'ui-lifecycle-iframe-render-data') return;
      const theme = event.data.payload?.renderData?.theme;
      if (theme === 'dark' || theme === 'light') { fromHost = true; apply(theme === 'dark'); }
    };
    media.addEventListener('change', onMedia);
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'ui-lifecycle-iframe-ready' }, '*');
    return () => { media.removeEventListener('change', onMedia); window.removeEventListener('message', onMessage); };
  }, []);
}

/** Keep the host iframe exactly as tall as the card. */
export function useAutoResize() {
  useEffect(() => {
    const report = () => {
      const height = Math.max(1, Math.ceil(document.body.getBoundingClientRect().height));
      window.parent.postMessage({ type: 'ui-size-change', payload: { height, width: Math.ceil(document.documentElement.clientWidth) } }, '*');
    };
    const observer = new ResizeObserver(report);
    observer.observe(document.body);
    requestAnimationFrame(report);
    return () => observer.disconnect();
  }, []);
}

export { Button, Shell, ShellHeader, Panel };
