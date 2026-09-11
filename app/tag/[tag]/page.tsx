import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import styles from './page.module.scss';
import { getTagCategory } from '../../lib/tag-categories';
import { getSmImagePath } from '../../../scripts/markdown-utils';

const DATA_DIRECTORY = path.join(process.cwd(), 'content', 'posts');

// +++ Tag handling +++

function getDirectoryEntries() {
  return fs
    .readdirSync(DATA_DIRECTORY)
    .filter((entry) =>
      fs.statSync(path.join(DATA_DIRECTORY, entry)).isDirectory()
    );
}

export async function generateStaticParams() {
  const entries = getDirectoryEntries();
  const tags = getAllTags(entries);
  return Array.from(tags).map((tag) => ({ tag }));
}

function getAllTags(entries: string[]): Set<string> {
  const tags = new Set<string>();
  entries.forEach((id) => {
    const fullPath = path.join(DATA_DIRECTORY, id, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    data.tags.forEach((tag) =>
      tags.add(tag.toLowerCase().replace(/\s+/g, '-'))
    );
  });
  return tags;
}

function getArticlesByTag(entries: string[], tag: string) {
  return entries
    .map((id) => {
      const fullPath = path.join(DATA_DIRECTORY, id, `${id}.md`);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
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

// +++ Page list rendering +++

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const entries = getDirectoryEntries();
  const articles = getArticlesByTag(entries, tag);

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
              {tag === 'blog' && article.excerpt && (
                <div className={styles.excerpt}>{article.excerpt}</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
