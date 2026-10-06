'use client';

import Header from './Header';
import type { ScuderiaArticle } from '../../lib/scuderia';

interface HeaderWrapperProps {
  latestScuderia?: ScuderiaArticle | null;
  navRecency?: Record<string, number>;
}

export default function HeaderWrapper({
  latestScuderia,
  navRecency,
}: HeaderWrapperProps) {
  return <Header latestScuderia={latestScuderia} navRecency={navRecency} />;
}
