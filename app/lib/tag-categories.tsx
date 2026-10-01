import { Camera, FileText, Music, Disc } from 'lucide-react';
import React from 'react';

export interface TagCategory {
  icon: React.ReactNode;
  label: string;
}

export const tagCategoryMap: Record<string, TagCategory> = {
  photography: {
    icon: <Camera size={24} strokeWidth={1.2} />,
    label: 'photography',
  },
  blog: { icon: <FileText size={24} strokeWidth={1.2} />, label: 'blog' },
  music: { icon: <Music size={24} strokeWidth={1.2} />, label: 'music' },
  singles: { icon: <Music size={24} strokeWidth={1.2} />, label: 'music' },
  'album arts': {
    icon: <Disc size={24} strokeWidth={1.2} />,
    label: 'album arts',
  },
  variants: { icon: <Disc size={24} strokeWidth={1.2} />, label: 'album arts' },
};

export function getTagCategory(
  tags: string[],
  size: number = 24
): { icon: React.ReactNode; label: string } | null {
  const matchedTag = tags.find((t) => tagCategoryMap[t]);
  if (!matchedTag) return null;
  const config = tagCategoryMap[matchedTag];
  return {
    icon: React.cloneElement(config.icon as React.ReactElement, { size }),
    label: config.label,
  };
}
