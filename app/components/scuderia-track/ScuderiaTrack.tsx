'use client';

import React from 'react';
import styles from '../../scuderia/page.module.scss';
import { Calendar, User, Disc, Music, Tag } from 'lucide-react';
import { usePlayer } from '../player/PlayerContext';

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

interface ScuderiaTrackProps {
  article: {
    id: string;
    title: string;
    artist: string[];
    genres: string[];
    thumb: string;
    formattedDate: string;
    content: string;
    album: string | null;
    youtube: string;
  };
  displayDate: string | null;
}

export default function ScuderiaTrack({
  article,
  displayDate,
}: ScuderiaTrackProps) {
  const { current, play } = usePlayer();
  const videoId = article.youtube ? getYouTubeId(article.youtube) : null;
  const isPlaying = current?.videoId === videoId;

  const handlePlay = () => {
    if (videoId) {
      play(videoId, article.title, article.artist.join(', '));
    }
  };

  return (
    <div className={styles.track__wrapper}>
      <div className={styles.track__header}>
        <div className={styles.track__thumbWrap}>
          {article.thumb && (
            <img
              src={article.thumb}
              alt={article.title}
              className={styles.track__thumbnail}
            />
          )}
          {article.youtube && (
            <button
              onClick={handlePlay}
              className={styles.track__youtube}
              aria-label={`Play ${article.title}`}
            >
              {isPlaying ? '▶' : '▶︎'}
            </button>
          )}
        </div>
        <div className={styles.track__info}>
          <div className={styles.track__info__top}>
            <div>
              <div className={styles.track__title}>{article.title}</div>
              <div className={styles.track__artist}>
                <User size={14} />
                {article.artist?.join(', ')}
              </div>
            </div>
            {displayDate && (
              <div className={styles.track__date}>
                <Calendar size={14} />
                {displayDate}
              </div>
            )}
          </div>
          <div className={styles.track__album}>
            {article.album ? (
              <>
                <Disc size={14} />
                {article.album} ({new Date(article.formattedDate).getFullYear()}
                )
              </>
            ) : (
              <>
                <Music size={14} />
                Released as a single in{' '}
                {new Date(article.formattedDate).getFullYear()}
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.track__content}>{article.content}</div>
      <div className={styles.track__genres}>
        {article.genres?.map((genre) => (
          <span key={genre} className={styles.track__genre}>
            <Tag size={10} />
            {genre}
          </span>
        ))}
      </div>
    </div>
  );
}
