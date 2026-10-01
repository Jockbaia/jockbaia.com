'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import styles from './page.module.scss';

type Track = {
  src: string;
  title: string;
  date: string | null;
};

export default function RadioPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekRandomRef = useRef(false);

  useEffect(() => {
    fetch('/radio-tracks.json')
      .then((response) => response.json())
      .then((data: Track[]) => {
        setTracks(data);
        if (data.length > 0) {
          setCurrentIndex(Math.floor(Math.random() * data.length));
        }
        setLoaded(true);
      })
      .catch(() => {
        setTracks([]);
        setLoaded(true);
      });
  }, []);

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

  const playRandom = () => {
    if (tracks.length === 0) return;

    if (tracks.length === 1) {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        audio.currentTime = Math.random() * audio.duration;
      } else {
        seekRandomRef.current = true;
      }
      setIsPlaying(true);
      return;
    }

    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    }
    seekRandomRef.current = true;
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      playRandom();
    }
  };

  if (!loaded) {
    return (
      <div className={styles.page}>
        <div className={styles.status}>Loading radio...</div>
      </div>
    );
  }

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
        {tracks[currentIndex].date && (
          <div className={styles.date}>{tracks[currentIndex].date}</div>
        )}
        <div className={styles.title}>{tracks[currentIndex].title}</div>
        <div className={styles.controls}>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={40} /> : <Play size={40} />}
          </button>
        </div>
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
