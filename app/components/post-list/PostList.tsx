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
            <Link key={post.id} href={`/${post.id}`} className={styles.card}>
              <img
                src={post.thumb}
                alt={post.title}
                className={styles.thumbnail}
              />
              <div className={styles.meta}>
                <div className={styles.title}>{post.title}</div>
                <div className={styles.date}>{post.date}</div>
                {categoryTag && (
                  <span className={styles.tag}>{categoryTag.icon}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
