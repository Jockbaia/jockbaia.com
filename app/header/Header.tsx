'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.scss';

function getLogoSrc(logo: string | undefined | null): string {
  return logo === 'blog'
    ? '/i/header/blog.png'
    : logo === 'pics'
      ? '/i/header/pics.png'
      : '/i/header/jockbaia.png';
}

function detectLogo(pathname: string): string | undefined {
  if (pathname === '/blog') return 'blog';
  if (pathname.startsWith('/tag/photography')) return 'pics';
  if (typeof document !== 'undefined') {
    const el = document.querySelector('[data-logo]');
    if (el) {
      const logo = el.getAttribute('data-logo');
      if (logo) return logo;
    }
  }
  return undefined;
}

export default function Header() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(() => detectLogo(pathname));
  const [nextLogo, setNextLogo] = useState<string | undefined | null>(null);
  const prevLogo = useRef(currentLogo);

  useEffect(() => {
    const logo = detectLogo(pathname);
    if (logo && logo !== currentLogo) {
      setCurrentLogo(logo);
      prevLogo.current = logo;
    }
  }, []);

  useEffect(() => {
    const logo = detectLogo(pathname);
    if (logo !== prevLogo.current) {
      setNextLogo(logo);
      setTimeout(() => {
        setCurrentLogo(logo);
        setNextLogo(null);
      }, 300);
      prevLogo.current = logo;
    }
  }, [pathname]);

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
          <button
            className={styles.sidebar__close}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
          <ul className={styles.sidebar__list}>
            <li>
              <Link href="/about" onClick={() => setSidebarOpen(false)}>
                <img src="/i/icons/about.svg" alt="" width="30" height="30" />
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" onClick={() => setSidebarOpen(false)}>
                <img src="/i/icons/blog.svg" alt="" width="30" height="30" />
                Blog
              </Link>
            </li>
            <li>
              <Link href="/tag/music" onClick={() => setSidebarOpen(false)}>
                <img src="/i/icons/music.svg" alt="" width="30" height="30" />
                Music
              </Link>
            </li>
            <li>
              <Link
                href="/tag/album-arts"
                onClick={() => setSidebarOpen(false)}
              >
                <img
                  src="/i/icons/album-arts.svg"
                  alt=""
                  width="30"
                  height="30"
                />
                Album Arts
              </Link>
            </li>
            <li>
              <Link
                href="/tag/photography"
                onClick={() => setSidebarOpen(false)}
              >
                <img src="/i/icons/pics.svg" alt="" width="30" height="30" />
                Pics
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
