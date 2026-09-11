import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const SCUDERIA_DIRECTORY = path.join(process.cwd(), 'content', 'scuderia');

export interface ScuderiaArticle {
  id: string;
  title: string;
  artist: string[];
  thumb: string;
  album: string | null;
}

export function getLatestScuderiaArticle(): ScuderiaArticle | null {
  const entries = fs
    .readdirSync(SCUDERIA_DIRECTORY)
    .filter((entry) =>
      fs.statSync(path.join(SCUDERIA_DIRECTORY, entry)).isDirectory()
    );

  if (entries.length === 0) return null;

  const latestEntry = entries
    .filter((entry) => /^\d{6}/.test(entry))
    .sort((a, b) => b.slice(0, 6).localeCompare(a.slice(0, 6)))[0];

  if (!latestEntry) return null;

  const id = latestEntry;
  const dirPath = path.join(SCUDERIA_DIRECTORY, id);
  const mdPath = path.join(dirPath, `${id}.md`);
  const fileContents = fs.readFileSync(mdPath, 'utf8');
  const { data } = matter(fileContents);

  return {
    id,
    title: data.title ?? '',
    artist: data.artist ?? [],
    thumb: `/i/sm/scuderia/${id}.webp`,
    album: data.album ?? null,
  };
}
