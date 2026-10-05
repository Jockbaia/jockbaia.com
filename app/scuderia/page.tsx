import styles from './page.module.scss';
import ScuderiaTrack from '../components/scuderia-track/ScuderiaTrack';
import { getScuderiaTracks } from '../lib/scuderia';

export default function ScuderiaPage() {
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.grid}>
          {getScuderiaTracks().map((track) => (
            <ScuderiaTrack key={track.id} article={track} />
          ))}
        </div>
      </div>
    </div>
  );
}
