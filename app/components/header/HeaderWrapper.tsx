'use client';

import Header from './Header';
import type { ScuderiaArticle } from '../../lib/scuderia';

interface HeaderWrapperProps {
  latestScuderia?: ScuderiaArticle | null;
}

export default function HeaderWrapper({ latestScuderia }: HeaderWrapperProps) {
  return <Header latestScuderia={latestScuderia} />;
}
