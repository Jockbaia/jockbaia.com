import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import styles from './page.module.scss';
import { getTagCategory } from '../lib/tag-categories';

const DATA_DIRECTORY = path.join(process.cwd(), 'data', 'posts');
const SCUDERIA_DIRECTORY = path.join(process.cwd(), 'data', 'scuderia');

function getMostRecentScuderia() {
  const fileNames = fs.readdirSync(SCUDERIA_DIRECTORY);
  const sortedFiles = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''))
    .filter((id) => /^\d{6}/.test(id))
    .sort((a, b) => b.localeCompare(a));

  if (sortedFiles.length === 0) return null;

  const mostRecentId = sortedFiles[0];
  const fullPath = path.join(SCUDERIA_DIRECTORY, mostRecentId + '.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data } = matter(fileContents);
  const dateString = mostRecentId.slice(0, 6);
  const year = parseInt(`20${dateString.slice(0, 2)}`, 10);
  const month = parseInt(dateString.slice(2, 4), 10) - 1;
  const day = parseInt(dateString.slice(4, 6), 10);
  const date = new Date(year, month, day);

  const artistName = Array.isArray(data.artist)
    ? data.artist.join(', ')
    : data.artist;

  return {
    id: 'scuderia',
    title: `Scuderia`,
    thumb: '/i/sm/scuderia/' + mostRecentId + '.webp',
    date: `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`,
    sortableDate: date.toISOString(),
    excerpt: `This week's entry of the Scuderia is "${data.title}" by ${artistName}.`,
    isScuderia: true,
    categoryTag: null,
    categoryTagLabel: '',
  };
}

function getArticlesByTag(fileNames: string[], tag: string) {
  return fileNames
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(DATA_DIRECTORY, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      // Replace image with thumbnail
      const thumb = data.thumb.startsWith('/i/')
        ? data.thumb
            .replace('/i/', '/i/sm/')
            .replace(/\.(jpg|jpeg|png)$/i, '.webp')
        : `/i/sm/${data.thumb.replace(/^i\//, '').replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;

      const tagCategory = getTagCategory(data.tags || []);

      return {
        id,
        title: data.title,
        thumb,
        date: data.date,
        sortableDate: data.date.split('-').reverse().join('-'),
        tags: data.tags,
        excerpt: data.excerpt,
        categoryTag: tagCategory?.icon ?? null,
        categoryTagLabel: tagCategory?.label ?? '',
      };
    })
    .filter((article) =>
      article.tags.some((t) => t.toLowerCase().replace(/\s+/g, '-') === tag)
    )
    .sort(
      (a, b) =>
        new Date(b.sortableDate).getTime() - new Date(a.sortableDate).getTime()
    );
}

export default function BlogPage() {
  const fileNames = fs.readdirSync(DATA_DIRECTORY);
  const articles = getArticlesByTag(fileNames, 'blog');
  const scuderiaEntry = getMostRecentScuderia();

  const allEntries = scuderiaEntry
    ? [...articles, scuderiaEntry].sort(
        (a, b) =>
          new Date(b.sortableDate).getTime() -
          new Date(a.sortableDate).getTime()
      )
    : articles;

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.grid}>
          {allEntries.map((article) => (
            <Link
              key={article.id}
              href={article.id === 'scuderia' ? '/scuderia' : `/${article.id}`}
              className={styles.card}
            >
              <img
                src={article.thumb}
                alt={article.title}
                className={styles.thumbnail}
              />
              <div className={styles.meta}>
                <div className={styles.title}>{article.title}</div>
                <div className={styles.date}>{article.date}</div>
                {article.categoryTag && (
                  <span className={styles.tag}>{article.categoryTag}</span>
                )}
              </div>
              {'excerpt' in article && article.excerpt && (
                <div className={styles.excerpt}>{article.excerpt}</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
