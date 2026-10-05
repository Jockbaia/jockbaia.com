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

const NAV_ITEMS: [href: string, label: string, Icon: LucideIcon][] = [
  ['/about', 'About', User],
  ['/tag/blog', 'Blog', FileText],
  ['/tag/music', 'Music', Music],
  ['/tag/album-arts', 'Album Arts', Disc],
  ['/tag/photography', 'Pics', Camera],
];

export default function Header() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(() => detectLogo(pathname));
  const [nextLogo, setNextLogo] = useState<string | undefined | null>(null);
  const prevLogo = useRef(currentLogo);
  const eventReceived = useRef(false);
  const closeSidebar = () => setSidebarOpen(false);

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
          </div>
        </nav>
      </div>
    </header>
  );
}
