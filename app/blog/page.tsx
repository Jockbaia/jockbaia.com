import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import styles from './page.module.scss';
import { Calendar } from 'lucide-react';
import { getTagCategory } from '../lib/tag-categories';
import { getSmImagePath, getMdImagePath } from '../../scripts/markdown-utils';

const DATA_DIRECTORY = path.join(process.cwd(), 'content', 'posts');

function formatDate(dateString: string) {
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

function getArticlesByTag(dirNames: string[], tag: string) {
  return dirNames
    .map((id) => {
      const fullPath = path.join(DATA_DIRECTORY, id, `${id}.md`);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      // Replace image with thumbnail
      const thumb = data.thumb ? getSmImagePath(data.thumb, id) : '';
      const thumbWide = data.thumbWide
        ? getMdImagePath(data.thumbWide, id)
        : thumb;

      const tagCategory = getTagCategory(data.tags || [], 14);

      return {
        id,
        title: data.title,
        thumb,
        thumbWide,
        date: formatDate(data.date),
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
  const dirNames = fs
    .readdirSync(DATA_DIRECTORY)
    .filter((entry) =>
      fs.statSync(path.join(DATA_DIRECTORY, entry)).isDirectory()
    );
  const articles = getArticlesByTag(dirNames, 'blog');

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.grid}>
          {articles.map((article) => (
            <a key={article.id} href={`/${article.id}`} className={styles.card}>
              <div className={styles.card__title}>{article.title}</div>

              <div className={styles.card__dateRow}>
                <div className={styles.card__date}>
                  <Calendar size={14} />
                  {article.date}
                </div>
                {article.categoryTag && (
                  <div
                    className={styles.card__metric}
                    title={article.categoryTagLabel}
                  >
                    {article.categoryTag}
                    <span>{article.categoryTagLabel}</span>
                  </div>
                )}
              </div>

              <img
                src={article.thumbWide}
                alt={article.title}
                className={styles.card__image}
              />

              {article.excerpt && (
                <div className={styles.card__excerpt}>{article.excerpt}</div>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
