import Link from 'next/link';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <p className={styles.code}>404</p>
      <p className={styles.message}>this page could not be found</p>
      <Link href="/" className={styles.link}>
        back home
      </Link>
    </div>
  );
}
