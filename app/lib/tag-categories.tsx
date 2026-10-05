import { Camera, Disc, FileText, Music, type LucideIcon } from 'lucide-react';

const TAGS: Record<string, { Icon: LucideIcon; label: string }> = {
  photography: { Icon: Camera, label: 'photography' },
  blog: { Icon: FileText, label: 'blog' },
  music: { Icon: Music, label: 'music' },
  singles: { Icon: Music, label: 'music' },
  'album arts': { Icon: Disc, label: 'album arts' },
  variants: { Icon: Disc, label: 'album arts' },
};

export function getTagCategory(tags: string[], size = 24) {
  const matched = tags.map((tag) => TAGS[tag]).find(Boolean);
  if (!matched) return null;
  const { Icon, label } = matched;
  return {
    icon: <Icon size={size} strokeWidth={1.2} />,
    label,
    href: `/tag/${label.toLowerCase().replace(/\s+/g, '-')}`,
  };
}
