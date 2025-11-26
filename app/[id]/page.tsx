import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import styles from './page.module.scss';
import { Calendar, Tag } from 'lucide-react';
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
  const processedContent = content
    // Handle images with descriptions
    .replace(
      /!\[([^\]]*)\]\((\/i\/[^\)]+)\)\s*\n\*([^\*]+)\*/g,
      (match, altText, imagePath, description) => {
        const mdImagePath = imagePath
          .replace('/i/', '/i/md/')
          .replace(/\.(jpg|jpeg|png)$/i, '.webp');
        return `<figure>
                  <a href="${imagePath}" target="_blank" rel="noopener noreferrer">
                    <img src="${mdImagePath}" alt="${altText}" />
                  </a>
                  <figcaption><em>${description.trim()}</em></figcaption>
                </figure>`;
      }
    )
    // Handle all other images
    .replace(/!\[([^\]]*)\]\((\/i\/[^\)]+)\)/g, (match, altText, imagePath) => {
      const mdImagePath = imagePath
        .replace('/i/', '/i/md/')
        .replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return `<a href="${imagePath}" target="_blank" rel="noopener noreferrer">
                <img src="${mdImagePath}" alt="${altText}" />
              </a>`;
    });

  return processedContent;
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
