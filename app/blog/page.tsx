import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import styles from './page.module.scss';
import { getTagCategory } from '../lib/tag-categories';
import { getSmImagePath } from '../../scripts/markdown-utils';

const DATA_DIRECTORY = path.join(process.cwd(), 'content', 'posts');

function getArticlesByTag(dirNames: string[], tag: string) {
  return dirNames
    .map((id) => {
      const fullPath = path.join(DATA_DIRECTORY, id, `${id}.md`);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      // Replace image with thumbnail
      const thumb = data.thumb ? getSmImagePath(data.thumb, id) : '';

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
            <Link
              key={article.id}
              href={`/${article.id}`}
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
