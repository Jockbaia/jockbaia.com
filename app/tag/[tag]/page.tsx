import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import styles from './page.module.scss';

const DATA_DIRECTORY = path.join(process.cwd(), 'data');

// +++ Tag handling +++

export async function generateStaticParams() {
  const fileNames = fs.readdirSync(DATA_DIRECTORY);
  const tags = getAllTags(fileNames);
  return Array.from(tags).map((tag) => ({ tag }));
}

function getAllTags(fileNames: string[]): Set<string> {
  const tags = new Set<string>();
  fileNames.forEach((fileName) => {
    const fullPath = path.join(DATA_DIRECTORY, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    data.tags.forEach((tag) =>
      tags.add(tag.toLowerCase().replace(/\s+/g, '-'))
    );
  });
  return tags;
}

function getArticlesByTag(fileNames: string[], tag: string) {
  return fileNames
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(DATA_DIRECTORY, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      const thumb = data.thumb.startsWith('/i/')
        ? data.thumb
            .replace('/i/', '/t/')
            .replace(/\.(jpg|jpeg|png)$/i, '.webp')
        : `/t/${data.thumb.replace(/^i\//, '').replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;

      return {
        id,
        title: data.title,
        thumb,
        date: data.date,
        sortableDate: data.date.split('-').reverse().join('-'),
        tags: data.tags,
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
  const fileNames = fs.readdirSync(DATA_DIRECTORY);
  const articles = getArticlesByTag(fileNames, tag);

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
              src={article.thumb}
              alt={article.title}
              className={styles.thumbnail}
            />
            <div className={styles.title}>{article.title}</div>
            <div className={styles.date}>{article.date}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
