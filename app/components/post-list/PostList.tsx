import Link from 'next/link';
import { getPosts } from '../../lib/posts';
import { getTagCategory } from '../../lib/tag-categories';
import styles from './PostList.module.scss';

export default function PostList({ tag }: { tag?: string }) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {getPosts(tag).map((post) => {
          const categoryTag = getTagCategory(post.tags);
          return (
            <div key={post.id} className={styles.card}>
              <Link
                href={`/${post.id}`}
                className={styles.stretch}
                aria-label={post.title}
              />
              <img
                src={post.thumb}
                alt={post.title}
                className={styles.thumbnail}
              />
              <div className={styles.meta}>
                <div className={styles.title}>{post.title}</div>
                <div className={styles.date}>{post.date}</div>
                {categoryTag && (
                  <Link
                    href={categoryTag.href}
                    className={styles.tag}
                    aria-label={categoryTag.label}
                  >
                    {categoryTag.icon}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
