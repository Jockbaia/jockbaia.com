import { Camera, Disc, FileText, Music, type LucideIcon } from 'lucide-react';
import { getPosts } from './posts';
import { parseDate } from './dates';

const TAGS: Record<string, { Icon: LucideIcon; label: string }> = {
  photography: { Icon: Camera, label: 'photography' },
  blog: { Icon: FileText, label: 'blog' },
  music: { Icon: Music, label: 'music' },
  singles: { Icon: Music, label: 'music' },
  'album arts': { Icon: Disc, label: 'album arts' },
  variants: { Icon: Disc, label: 'album arts' },
};

const tagHref = (label: string) =>
  `/tag/${label.toLowerCase().replace(/\s+/g, '-')}`;

export function getTagCategory(tags: string[], size = 24) {
  const matched = tags.map((tag) => TAGS[tag]).find(Boolean);
  if (!matched) return null;
  const { Icon, label } = matched;
  return {
    icon: <Icon size={size} strokeWidth={1.2} />,
    label,
    href: tagHref(label),
  };
}

export function getLatestPostRecency(): Record<string, number> {
  const recency: Record<string, number> = {};
  for (const post of getPosts()) {
    const timestamp = parseDate(post.date)?.getTime() ?? 0;
    for (const tag of post.tags) {
      const matched = TAGS[tag.toLowerCase()];
      if (!matched) continue;
      const href = tagHref(matched.label);
      if (timestamp > (recency[href] ?? 0)) recency[href] = timestamp;
    }
  }
  return recency;
}
