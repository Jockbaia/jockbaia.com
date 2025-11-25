import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import styles from './page.module.scss';
import { Calendar, Tag } from 'lucide-react';
import { remark } from 'remark';
import html from 'remark-html';
import Link from 'next/link';

const DATA_DIRECTORY = path.join(process.cwd(), 'data');

// +++ Markdown handling +++

export async function generateStaticParams() {
  const fileNames = getMarkdownFileNames();
  return fileNames.map((fileName) => ({
    id: fileName.replace(/\.md$/, ''),
  }));
}

function getMarkdownFileNames() {
  return fs.readdirSync(DATA_DIRECTORY);
}

function getMarkdownFilePath(id: string) {
  return path.join(DATA_DIRECTORY, `${id}.md`);
}

function getMarkdownFileData(fullPath: string) {
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return matter(fileContents);
}

async function convertMarkdownToHtml(content: string) {
  const processedContent = await remark().use(html).process(content);
  return processedContent.toString();
}

// +++ Article rendering +++

export default async function Article({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fullPath = getMarkdownFilePath(id);
  const { data, content } = getMarkdownFileData(fullPath);
  const contentHtml = await convertMarkdownToHtml(content);

  return (
    <div className={styles.container}>
      {/* Title */}
      <div className={styles.title}>{data.title}</div>

      {/* Metadata */}
      <div className={styles.meta}>
        <Calendar size={15} />
        {data.date}
        <Tag size={15} />
        {data.tags.map((tag: string, index: number) => (
          <span key={index}>
            <Link className={styles.tag} href={`/tag/${tag}`}>
              {tag}
            </Link>
            {index < data.tags.length - 1 && ', '}
          </span>
        ))}
      </div>

      {/* Content */}
      <article
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
