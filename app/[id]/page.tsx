import styles from './page.module.scss';
import { Calendar } from 'lucide-react';
import {
  convertMarkdownToHtml,
  getImagePath,
} from '../../scripts/markdown-utils';
import Logo from '../components/logo/Logo';
import { getTagCategory } from '../lib/tag-categories';
import { formatDate } from '../lib/dates';
import { listPostIds, readPost } from '../lib/posts';

// +++ Metadata handling +++

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const { data } = readPost(id);
    const thumb = data.thumb ? getImagePath(data.thumb, 'md', id) : '';

    return {
      title: `${data.title} | Jockbaia`,
      description: data.excerpt || '',
      openGraph: {
        images: thumb ? [thumb] : [],
      },
      twitter: {
        images: thumb ? [thumb] : [],
      },
      other: {
        'fediverse:creator': '@jockbaia@pan.rent',
      },
    };
  } catch {
    return {
      title: 'Not found',
      description: '',
    };
  }
}

// +++ Markdown handling +++

export async function generateStaticParams() {
  return listPostIds().map((id) => ({ id }));
}

// +++ Article rendering +++

export default async function Article({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, content } = readPost(id);
  const contentHtml = await convertMarkdownToHtml(content, id);
  const tags: string[] = Array.isArray(data.tags) ? data.tags : [];
  const isPics = tags.includes('photography');
  const logo = tags.includes('blog') ? 'blog' : isPics ? 'pics' : undefined;
  const tagCategory = getTagCategory(tags, 14);

  return (
    <div>
      <Logo logo={logo} />
      <div className={styles.container}>
        <div className={styles.title}>{data.title}</div>

        <div className={styles.dateRow}>
          <div className={styles.date}>
            <Calendar size={14} />
            {formatDate(data.date)}
          </div>
          {tagCategory && (
            <div className={styles.metric} title={tagCategory.label}>
              {tagCategory.icon}
              <span>{tagCategory.label}</span>
            </div>
          )}
        </div>

        <article
          className={`${styles.content} ${isPics ? styles['content--pics'] : ''}`}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </div>
  );
}
