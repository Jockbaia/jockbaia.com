import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import styles from './page.module.scss';
import Link from 'next/link';
import { getTagCategory } from './lib/tag-categories';
import { getSmImagePath } from '../scripts/markdown-utils';

const POSTS_DIRECTORY = path.join(process.cwd(), 'data', 'posts');

// +++ Markdown handling +++

function getMarkdownFileNames(postsDirectory: string): string[] {
  return fs
    .readdirSync(postsDirectory)
    .filter(
      (file) =>
        fs.statSync(path.join(postsDirectory, file)).isFile() &&
        file.endsWith('.md')
    );
}

export async function generateStaticParams() {
  const fileNames = getMarkdownFileNames(POSTS_DIRECTORY);

  return fileNames.map((fileName) => ({
    id: fileName.replace(/\.md$/, ''),
  }));
}

function parseMarkdownFile(dataDirectory: string, fileName: string) {
  const id = fileName.replace(/\.md$/, '');
  const fullPath = path.join(dataDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data } = matter(fileContents);

  // Replace image with thumbnail
  const thumb = data.thumb ? getSmImagePath(data.thumb) : '';

  const tagCategory = getTagCategory(data.tags || []);

  return {
    id,
    title: data.title,
    thumb,
    date: data.date,
    sortableDate: data.date.split('-').reverse().join('-'),
    tags: data.tags || [],
    hidden: data.hidden || false,
    excerpt: data.excerpt,
    categoryTag: tagCategory?.icon ?? null,
    categoryTagLabel: tagCategory?.label ?? '',
  };
}

// +++ Home and Article rendering +++

export default async function Home() {
  const fileNames = getMarkdownFileNames(POSTS_DIRECTORY);

  const articles = fileNames
    .map((fileName) => parseMarkdownFile(POSTS_DIRECTORY, fileName))
    // If a post is marked as hidden, it won't be shown on the homepage
    .filter((article) => !article.hidden);

  articles.sort(
    (a, b) =>
      new Date(b.sortableDate).getTime() - new Date(a.sortableDate).getTime()
  );

  return (
    <div>
      <div className={styles.container}>
        <a
          rel="me"
          href="https://pan.rent/@jockbaia"
          tabIndex={-1}
          aria-hidden="true"
        ></a>
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
