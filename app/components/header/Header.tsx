'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  Camera,
  Disc,
  FileText,
  Music,
  User,
  type LucideIcon,
} from 'lucide-react';
import styles from './Header.module.scss';
import type { ScuderiaArticle } from '../../lib/scuderia';

function getLogoSrc(logo: string | undefined | null): string {
  return logo === 'blog'
    ? '/assets/sm/header/blog.webp'
    : logo === 'pics'
      ? '/assets/sm/header/pics.webp'
      : '/assets/sm/header/jockbaia.webp';
}

function detectLogo(pathname: string): string | undefined {
  if (pathname === '/tag/blog') return 'blog';
  if (pathname.startsWith('/tag/photography')) return 'pics';
  return undefined;
}

interface HeaderProps {
  latestScuderia?: ScuderiaArticle | null;
}

const NAV_ITEMS: [href: string, label: string, Icon: LucideIcon][] = [
  ['/about', 'About', User],
  ['/tag/blog', 'Blog', FileText],
  ['/tag/music', 'Music', Music],
  ['/tag/album-arts', 'Album Arts', Disc],
  ['/tag/photography', 'Pics', Camera],
];

export default function Header({ latestScuderia }: HeaderProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(() => detectLogo(pathname));
  const [nextLogo, setNextLogo] = useState<string | undefined | null>(null);
  const prevLogo = useRef<string | undefined>(currentLogo);
  const lastEvent = useRef<{ path: string; logo: string } | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const evAtEffect = lastEvent.current;
    if (evAtEffect && evAtEffect.path === pathname) {
      applyLogo(evAtEffect.logo);
      return;
    }
    const detected = detectLogo(pathname);
    if (detected) {
      applyLogo(detected);
      return;
    }
    const timer = setTimeout(() => {
      const evNow = lastEvent.current;
      if (evNow && (evNow.path === pathname || evNow !== evAtEffect)) {
        applyLogo(evNow.logo);
      } else {
        applyLogo(undefined);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const logo = e.detail;
      lastEvent.current = { path: window.location.pathname, logo };
      applyLogo(logo);
    };
    document.body.addEventListener('pagelogo', handler as EventListener);
    return () =>
      document.body.removeEventListener('pagelogo', handler as EventListener);
  }, []);

  function applyLogo(logo: string | undefined) {
    if (logo === prevLogo.current) return;
    prevLogo.current = logo;
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    setNextLogo(logo);
    transitionTimer.current = setTimeout(() => {
      setCurrentLogo(logo);
      setNextLogo(null);
      transitionTimer.current = null;
    }, 300);
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
          onClick={closeSidebar}
        />

        <nav
          className={`${styles.sidebar} ${sidebarOpen ? styles['sidebar--open'] : ''}`}
        >
          <div className={styles.sidebar__panel}>
            <ul className={styles.sidebar__list}>
              {NAV_ITEMS.map(([href, label, Icon]) => (
                <li key={href}>
                  <Link href={href} onClick={closeSidebar}>
                    <Icon size={18} strokeWidth={1.2} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {latestScuderia && (
              <Link
                href="/scuderia"
                className={styles.sidebar__scuderia}
                onClick={closeSidebar}
              >
                <img src={latestScuderia.thumb} alt="" width={40} height={40} />
                <span className={styles.sidebar__scuderiaInfo}>
                  <span className={styles.sidebar__scuderiaTitle}>
                    {latestScuderia.title}
                  </span>
                  <span className={styles.sidebar__scuderiaArtist}>
                    {latestScuderia.artist?.join(', ')}
                  </span>
                </span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
