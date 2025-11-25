import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import styles from './page.module.scss';
import Link from 'next/link';

// +++ Markdown handling +++

export async function generateStaticParams() {
  const dataDirectory = path.join(process.cwd(), 'data');
  const fileNames = getMarkdownFileNames(dataDirectory);

  return fileNames.map((fileName) => ({
    id: fileName.replace(/\.md$/, ''),
  }));
}

function getMarkdownFileNames(dataDirectory: string): string[] {
  return fs.readdirSync(dataDirectory);
}

function parseMarkdownFile(dataDirectory: string, fileName: string) {
  const id = fileName.replace(/\.md$/, '');
  const fullPath = path.join(dataDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data } = matter(fileContents);
  const [day, month, year] = data.date.split('-');
  const formattedDate = `${year}-${month}-${day}`;

  const compressedThumb = data.thumb
    .replace('/i/', '/t/')
    .replace(/\.(jpg|jpeg|png)$/i, '.webp');

  return {
    id,
    title: data.title,
    thumb: compressedThumb,
    date: data.date,
    sortableDate: formattedDate,
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
  const dataDirectory = path.join(process.cwd(), 'data');
  const fileNames = getMarkdownFileNames(dataDirectory);

  const articles = fileNames.map((fileName) =>
    parseMarkdownFile(dataDirectory, fileName)
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
