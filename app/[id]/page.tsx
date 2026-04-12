import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import styles from './page.module.scss';
import { Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { convertMarkdownToHtml } from '../../scripts/markdown-utils';
import { Metadata } from 'next';
import Header from '../header/Header';

const DATA_DIRECTORY = path.join(process.cwd(), 'data', 'posts');

// +++ Metadata handling +++

export async function generateMetadata({ params }) {
  const resolvedParams =
    typeof params.then === 'function' ? await params : params;
  const { id } = resolvedParams;
  try {
    const fullPath = getMarkdownFilePath(id);
    const { data } = getMarkdownFileData(fullPath);

    // Use M-sized .webp version of the thumbnail
    let mdImage = '';
    if (data.thumb) {
      if (data.thumb.startsWith('/i/')) {
        mdImage = data.thumb
          .replace('/i/', '/i/md/')
          .replace(/\.(jpg|jpeg|png)$/i, '.webp');
      } else {
        mdImage = `/i/md/${data.thumb.replace(/^i\//, '').replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;
      }
    }
    return {
      title: data.title + ' | Jockbaia' || '',
      description: data.excerpt || '',
      openGraph: {
        images: mdImage ? [mdImage] : [],
      },
      twitter: {
        images: mdImage ? [mdImage] : [],
      },
      other: {
        'fediverse:creator': '@jockbaia@pan.rent',
      },
    };
  } catch (e) {
    return {
      title: 'Not found',
      description: '',
    };
  }
}

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
  const hasBlogTag = Array.isArray(data.tags) && data.tags.includes('blog');
  const hasPicsTag =
    Array.isArray(data.tags) && data.tags.includes('photography');

  return (
    <div>
      <Header logo={hasBlogTag ? 'blog' : hasPicsTag ? 'pics' : undefined} />
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
    </div>
  );
}
