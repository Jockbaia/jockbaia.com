import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import styles from './page.module.scss';
import Link from 'next/link';

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
  const thumb = data.thumb.startsWith('/i/')
    ? data.thumb.replace('/i/', '/i/sm/').replace(/\.(jpg|jpeg|png)$/i, '.webp')
    : `/i/sm/${data.thumb.replace(/^i\//, '').replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;

  return {
    id,
    title: data.title,
    thumb,
    date: data.date,
    sortableDate: data.date.split('-').reverse().join('-'),
  };
}

function preprocessMarkdownContent(content: string): string {
  const processedContent = content.replace(
    /!\[([^\]]*)\]\((i\/[^\)]+)\)/g,
    (match, altText, imagePath) => {
      const absolutePath = `/${imagePath}`;
      return `![${altText}](${absolutePath})`;
    }
  );

  return remark().use(html).processSync(processedContent).toString();
}

// +++ Home and Article rendering +++

export default async function Home() {
  const fileNames = getMarkdownFileNames(POSTS_DIRECTORY);

  const articles = fileNames.map((fileName) =>
    parseMarkdownFile(POSTS_DIRECTORY, fileName)
  );

  articles.sort(
    (a, b) =>
      new Date(b.sortableDate).getTime() - new Date(a.sortableDate).getTime()
  );

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

export function Article({ params }: { params: { id: string } }) {
  const dataDirectory = path.join(process.cwd(), 'data');
  const fullPath = path.join(dataDirectory, `${params.id}.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const processedHtml = preprocessMarkdownContent(content);

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.date}</p>
      <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
    </div>
  );
}
