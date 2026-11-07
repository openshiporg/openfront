import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import type { CardPayload } from '../types';
import { useAutoResize, useTheme } from './ui';
import { DiscoverCard } from './DiscoverCard';
import { ProductCard } from './ProductCard';

function App({ payload }: { payload: CardPayload }) {
  useTheme();
  useAutoResize();
  return (
    <MotionConfig reducedMotion="user">
      <main className="p-0.5 pb-2">
        {payload.kind === 'discover' && <DiscoverCard data={payload.data} />}
        {payload.kind === 'product' && <ProductCard data={payload.data} />}
      </main>
    </MotionConfig>
  );
}

const raw = document.getElementById('mcp-data')?.textContent;
if (raw) createRoot(document.getElementById('root')!).render(<App payload={JSON.parse(raw)} />);
