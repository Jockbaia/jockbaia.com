import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import styles from './page.module.scss';
import React from 'react';
import { Calendar, User, Disc, Music, Tag } from 'lucide-react';

const SCUDERIA_DIRECTORY = path.join(process.cwd(), 'content', 'scuderia');

// +++ Data handling / utilities +++

export async function generateStaticParams() {
  const entries = fs.readdirSync(SCUDERIA_DIRECTORY);
  return entries
    .filter((entry) =>
      fs.statSync(path.join(SCUDERIA_DIRECTORY, entry)).isDirectory()
    )
    .map((entry) => ({ id: entry }));
}

function getArticleDirs() {
  return fs
    .readdirSync(SCUDERIA_DIRECTORY)
    .filter((entry) =>
      fs.statSync(path.join(SCUDERIA_DIRECTORY, entry)).isDirectory()
    );
}

function getArticles(dirNames: string[]) {
  return dirNames
    .map((id) => {
      const dirPath = path.join(SCUDERIA_DIRECTORY, id);
      const fullPath = path.join(dirPath, `${id}.md`);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      const thumb = `/i/sm/scuderia/${id}.webp`;

      return {
        id,
        title: data.title,
        artist: data.artist,
        genres: data.genres,
        thumb,
        date: data.released,
        sortableDate: data.released
          ? data.released.split('-').reverse().join('-')
          : '',
        formattedDate: data.released ? formatDate(data.released) : '',
        content,
        album: data.album || null,
        youtube: data.youtube,
      };
    })
    .sort((a, b) => {
      const dateA = a.id.match(/^\d{6}/) ? a.id.slice(0, 6) : '';
      const dateB = b.id.match(/^\d{6}/) ? b.id.slice(0, 6) : '';
      return dateB.localeCompare(dateA);
    });
}

function formatDate(dateString) {
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  return dateString;
}

function extractDateFromFileName(fileName) {
  const match = fileName.match(/^(\d{6})/);
  if (match) {
    const dateString = match[1];
    const year = parseInt(`20${dateString.slice(0, 2)}`, 10);
    const month = parseInt(dateString.slice(2, 4), 10) - 1;
    const day = parseInt(dateString.slice(4, 6), 10);

    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  return null;
}

// +++ Page list rendering +++

export default async function ScuderiaPage() {
  const articles = getArticles(getArticleDirs());

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.grid}>
          {articles.map((article) => {
            const formattedDate = extractDateFromFileName(article.id);
            return (
              <React.Fragment key={article.id}>
                <div className={styles.track__wrapper} key={article.id}>
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
                        <a
                          href={article.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.track__youtube}
                        >
                          ▶︎
                        </a>
                      )}
                    </div>
                    <div className={styles.track__info}>
                      <div className={styles.track__info__top}>
                        <div>
                          <div className={styles.track__title}>
                            {article.title}
                          </div>
                          <div className={styles.track__artist}>
                            <User size={14} />
                            {article.artist?.join(', ')}
                          </div>
                        </div>
                        {formattedDate && (
                          <div className={styles.track__date}>
                            <Calendar size={14} />
                            {formattedDate}
                          </div>
                        )}
                      </div>
                      <div className={styles.track__album}>
                        {article.album ? (
                          <>
                            <Disc size={14} />
                            {article.album} ({new Date(article.formattedDate).getFullYear()})
                          </>
                        ) : (
                          <>
                            <Music size={14} />
                            Released as a single in {new Date(article.formattedDate).getFullYear()}
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
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
