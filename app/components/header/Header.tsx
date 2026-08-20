'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.scss';
import type { ScuderiaArticle } from '../../lib/scuderia';

function getLogoSrc(logo: string | undefined | null): string {
  return logo === 'blog'
    ? '/i/sm/header/blog.webp'
    : logo === 'pics'
      ? '/i/sm/header/pics.webp'
      : '/i/sm/header/jockbaia.webp';
}

function detectLogo(pathname: string): string | undefined {
  if (pathname === '/blog') return 'blog';
  if (pathname.startsWith('/tag/photography')) return 'pics';
  return undefined;
}

interface HeaderProps {
  latestScuderia?: ScuderiaArticle | null;
}

export default function Header({ latestScuderia }: HeaderProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(() => detectLogo(pathname));
  const [nextLogo, setNextLogo] = useState<string | undefined | null>(null);
  const prevLogo = useRef(currentLogo);
  const eventReceived = useRef(false);

  useEffect(() => {
    const logo = detectLogo(pathname);
    if (logo && logo !== currentLogo) {
      setCurrentLogo(logo);
      prevLogo.current = logo;
    }
  }, []);

  useEffect(() => {
    const logo = detectLogo(pathname);
    eventReceived.current = false;
    if (logo !== prevLogo.current) {
      if (logo) {
        startTransition(logo);
      } else {
        const timer = setTimeout(() => {
          if (!eventReceived.current) {
            startTransition(logo);
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const logo = e.detail;
      eventReceived.current = true;
      if (logo !== prevLogo.current) {
        startTransition(logo);
      }
    };
    document.body.addEventListener('pagelogo', handler as EventListener);
    return () =>
      document.body.removeEventListener('pagelogo', handler as EventListener);
  }, []);

  function startTransition(logo: string | undefined) {
    setNextLogo(logo);
    setTimeout(() => {
      setCurrentLogo(logo);
      setNextLogo(null);
    }, 300);
    prevLogo.current = logo;
  }

  return (
    <header className={styles.header}>
      <div className={styles.header__content}>
        <Link href="/">
          <div className={styles.header__logo}>
            <img
              src={getLogoSrc(currentLogo)}
              alt="Header Logo"
              width="120"
              height="70"
              className={nextLogo !== null ? styles['logo--fade'] : ''}
            />
            {nextLogo !== null && (
              <img
                src={getLogoSrc(nextLogo)}
                alt="Header Logo"
                width="120"
                height="70"
                className={styles['logo--enter']}
              />
            )}
          </div>
        </Link>

        <button
          className={`${styles.hamburger} ${sidebarOpen ? styles['hamburger--open'] : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className={`${styles.backdrop} ${sidebarOpen ? styles['backdrop--visible'] : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <nav
          className={`${styles.sidebar} ${sidebarOpen ? styles['sidebar--open'] : ''}`}
        >
          <ul className={styles.sidebar__list}>
            <li>
              <Link href="/about" onClick={() => setSidebarOpen(false)}>
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" onClick={() => setSidebarOpen(false)}>
                Blog
              </Link>
            </li>
            <li>
              <Link href="/tag/music" onClick={() => setSidebarOpen(false)}>
                Music
              </Link>
            </li>
            <li>
              <Link
                href="/tag/album-arts"
                onClick={() => setSidebarOpen(false)}
              >
                Album Arts
              </Link>
            </li>
            <li>
              <Link
                href="/tag/photography"
                onClick={() => setSidebarOpen(false)}
              >
                Pics
              </Link>
            </li>
          </ul>
          {latestScuderia && (
            <Link
              href="/scuderia"
              className={styles.nowListening}
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.nowListening__label}>
                now listening
                <svg
                  className={styles.nowListening__music}
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </span>
              <div className={styles.nowListening__card}>
                <div className={styles.nowListening__info}>
                  <span className={styles.nowListening__title}>
                    {latestScuderia.title}
                  </span>
                  <span className={styles.nowListening__artist}>
                    {latestScuderia.artist?.join(', ')}
                  </span>
                </div>
                <img
                  src={latestScuderia.thumb}
                  alt={latestScuderia.title}
                  className={styles.nowListening__thumb}
                  width="48"
                  height="48"
                />
              </div>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
