import React from 'react';
import Link from 'next/link';
import { Camera } from 'lucide-react';
import styles from './PhotographyGrid.module.scss';

interface PhotographyArticle {
  id: string;
  title: string;
  firstImage: string;
  date: string;
}

interface PhotographyGridProps {
  articles: PhotographyArticle[];
}

export default function PhotographyGrid({ articles }: PhotographyGridProps) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/${article.id}`}
            className={styles.card}
          >
            <img
              src={article.firstImage}
              alt={article.title}
              className={styles.image}
              loading="lazy"
            />
            <div className={styles.overlay}>
              <div className={styles.meta}>
                <div className={styles.date}>
                  <Camera size={14} strokeWidth={1.2} />
                  {article.date.split(' ').pop()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
