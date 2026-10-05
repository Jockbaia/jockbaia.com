import styles from './page.module.scss';

export const metadata = {
  title: 'About | Jockbaia',
  description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.title}>about</div>
      <div className={styles.content}>
        <p>Coming soon...</p>
      </div>
    </div>
  );
}
