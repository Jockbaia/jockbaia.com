import Link from 'next/link';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.header__content}>
        <Link href={`/`}>
          <div className={styles.header__logo}>
            <img
              src="/i/header.png"
              className="floating"
              alt="Header Logo"
              width="80"
              height="80"
            />
            <span className={styles.header__cursor}>_</span>
          </div>
        </Link>
        <nav>
          <ul className={styles.menu__list}>
            <Link href={`/about`}>
              <li className={styles.menu__item}>
                <img
                  src="/i/icons/about.svg"
                  alt="About Icon"
                  width="30"
                  height="30"
                />
                About
              </li>
            </Link>
            <Link href={`/tag/blog`}>
              <li className={styles.menu__item}>
                <img
                  src="/i/icons/blog.svg"
                  alt="Blog Icon"
                  width="30"
                  height="30"
                />
                Blog
              </li>
            </Link>
            <Link href={`/tag/music`}>
              <li className={styles.menu__item}>
                <img
                  src="/i/icons/music.svg"
                  alt="Music Icon"
                  width="30"
                  height="30"
                />
                Music
              </li>
            </Link>
            <Link href={`/tag/album-arts`}>
              <li className={styles.menu__item}>
                <img
                  src="/i/icons/album-arts.svg"
                  alt="Album Arts Icon"
                  width="30"
                  height="30"
                />
                Album Arts
              </li>
            </Link>
            <Link href={`/tag/photography`}>
              <li className={styles.menu__item}>
                <img
                  src="/i/icons/pics.svg"
                  alt="Pics Icon"
                  width="30"
                  height="30"
                />
                Pics
              </li>
            </Link>
          </ul>
        </nav>
      </div>
    </header>
  );
}
