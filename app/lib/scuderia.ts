import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const SCUDERIA_DIRECTORY = path.join(process.cwd(), 'data', 'scuderia');

export interface ScuderiaArticle {
  id: string;
  title: string;
  artist: string[];
  thumb: string;
  album: string | null;
}

export function getLatestScuderiaArticle(): ScuderiaArticle | null {
  const files = fs
    .readdirSync(SCUDERIA_DIRECTORY)
    .filter(
      (file) =>
        fs.statSync(path.join(SCUDERIA_DIRECTORY, file)).isFile() &&
        file.endsWith('.md')
    );

  if (files.length === 0) return null;

  const latestFile = files
    .filter((file) => /^\d{6}/.test(file))
    .sort((a, b) => b.slice(0, 6).localeCompare(a.slice(0, 6)))[0];

  if (!latestFile) return null;

  const id = latestFile.replace(/\.md$/, '');
  const fullPath = path.join(SCUDERIA_DIRECTORY, latestFile);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data } = matter(fileContents);

  return {
    id,
    title: data.title ?? '',
    artist: data.artist ?? [],
    thumb: `/i/sm/scuderia/${id}.webp`,
    album: data.album ?? null,
  };
}
