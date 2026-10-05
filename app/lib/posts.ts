import path from 'path';
import { getSmImagePath } from './markdown';
import { parseDate } from './dates';
import { listDirectories, readMarkdown } from './fs';

const POSTS_DIRECTORY = path.join(process.cwd(), 'content', 'posts');

export interface Post {
  id: string;
  title: string;
  thumb: string;
  date: string;
  tags: string[];
}

const normalizeTag = (tag: string) => tag.toLowerCase().replace(/\s+/g, '-');

export const listPostIds = () => listDirectories(POSTS_DIRECTORY);

export const readPost = (id: string) => readMarkdown(POSTS_DIRECTORY, id);

export function getPosts(tag?: string): Post[] {
  return listPostIds()
    .map((id) => {
      const { data } = readPost(id);
      return {
        id,
        title: data.title,
        thumb: data.thumb ? getSmImagePath(data.thumb, id) : '',
        date: data.date,
        timestamp: parseDate(data.date)?.getTime() ?? 0,
        tags: data.tags || [],
        hidden: data.hidden || false,
      };
    })
    .filter((post) => !post.hidden)
    .filter(
      (post) =>
        !tag || post.tags.some((t) => normalizeTag(t) === normalizeTag(tag))
    )
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getAllTags(): string[] {
  return [
    ...new Set(
      listPostIds().flatMap((id) =>
        (readPost(id).data.tags || []).map(normalizeTag)
      )
    ),
  ];
}
