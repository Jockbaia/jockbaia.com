'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import styles from './page.module.scss';

type Track = {
  src: string;
  title: string;
  date: string | null;
};

interface RadioPlayerProps {
  tracks: Track[];
}

export default function RadioPlayer({ tracks }: RadioPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekRandomRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      if (seekRandomRef.current) {
        return;
      }
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentIndex]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || !seekRandomRef.current) return;

    audio.currentTime = Math.random() * audio.duration;
    seekRandomRef.current = false;
    audio.play().catch(() => setIsPlaying(false));
  };

  const handleEnded = () => {
    seekRandomRef.current = false;
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const pickRandomTrack = () => {
    if (tracks.length === 1) return 0;
    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    }
    return nextIndex;
  };

  const start = () => {
    const nextIndex = pickRandomTrack();
    seekRandomRef.current = true;
    setHasStarted(true);
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  if (tracks.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.status}>No tracks in the radio folder yet.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.player}>
        <img src="/radio/radio.png" alt="Radio" className={styles.cover} />
        {!hasStarted ? (
          <button
            type="button"
            onClick={start}
            aria-label="Play"
            className={styles.startButton}
          >
            <Play size={32} />
          </button>
        ) : (
          <div className={styles.infoRow}>
            <div className={styles.texts}>
              <div className={styles.title}>{tracks[currentIndex].title}</div>
              {tracks[currentIndex].date && (
                <div className={styles.date}>{tracks[currentIndex].date}</div>
              )}
            </div>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className={styles.playButton}
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
          </div>
        )}
        <audio
          ref={audioRef}
          src={tracks[currentIndex].src}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="auto"
        />
      </div>
    </div>
  );
}
