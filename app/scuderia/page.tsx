import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import styles from './page.module.scss';
import React from 'react';

const SCUDERIA_DIRECTORY = path.join(process.cwd(), 'data', 'scuderia');

// +++ Data handling / utilities +++

export async function generateStaticParams() {
  const fileNames = fs.readdirSync(SCUDERIA_DIRECTORY);
  return fileNames.map((fileName) => ({ id: fileName.replace(/\.md$/, '') }));
}

function getMarkdownFiles() {
  return fs
    .readdirSync(SCUDERIA_DIRECTORY)
    .filter(
      (file) =>
        fs.statSync(path.join(SCUDERIA_DIRECTORY, file)).isFile() &&
        file.endsWith('.md')
    );
}

function getArticles(fileNames: string[]) {
  return fileNames
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(SCUDERIA_DIRECTORY, fileName);
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
        album: data.album,
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
  const fileNames = fs.readdirSync(SCUDERIA_DIRECTORY);
  const articles = getArticles(getMarkdownFiles());

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {articles.map((article) => {
          const formattedDate = extractDateFromFileName(article.id);
          return (
            <React.Fragment key={article.id}>
              <div className={styles.track__wrapper} key={article.id}>
                <div className={styles.article__meta}>
                  {formattedDate && (
                    <div className={styles.track__date}>{formattedDate}</div>
                  )}
                  <div style={{ position: 'relative' }}>
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
                </div>
                <div className={styles.article__content}>
                  <div className={styles.track__title}>{article.title}</div>
                  <div className={styles.track__artist}>
                    {article.artist?.join(', ')}
                  </div>
                  {article.album && (
                    <div className={styles.track__album}>
                      from the {new Date(article.formattedDate).getFullYear()}{' '}
                      album "{article.album}"
                    </div>
                  )}
                  <div className={styles.track__genres}>
                    {article.genres?.join(', ')}
                  </div>
                  <div className={styles.track__content}>{article.content}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
