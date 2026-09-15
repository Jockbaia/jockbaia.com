'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePlayer } from './PlayerContext';
import styles from './StickyPlayer.module.scss';

export default function StickyPlayer() {
  const { current, close } = usePlayer();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && !pathname.startsWith('/scuderia')) {
      close();
    }
  }, [pathname, close]);

  if (!current) return null;

  return (
    <div className={styles.player}>
      <button
        onClick={close}
        className={styles.player__close}
        aria-label="Close player"
      >
        ✕
      </button>
      <div className={styles.player__frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${current.videoId}?autoplay=1`}
          title={current.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
