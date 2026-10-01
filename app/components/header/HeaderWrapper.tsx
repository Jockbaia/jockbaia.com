'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import type { ScuderiaArticle } from '../../lib/scuderia';

interface HeaderWrapperProps {
  latestScuderia?: ScuderiaArticle | null;
}

export default function HeaderWrapper({ latestScuderia }: HeaderWrapperProps) {
  const pathname = usePathname();
  if (pathname === '/radio') return null;
  return <Header latestScuderia={latestScuderia} />;
}
