import path from 'path';
import { listDirectories, readMarkdown } from './fs';
import { daysBetween, formatShortDate, parseDate, parseIdDate } from './dates';

const SCUDERIA_DIRECTORY = path.join(process.cwd(), 'content', 'scuderia');

export interface ScuderiaArticle {
  id: string;
  title: string;
  artist: string[];
  thumb: string;
  album: string | null;
}

export interface ScuderiaTrackData extends ScuderiaArticle {
  content: string;
  youtube: string;
  releaseYear: string;
  displayDate: string | null;
  dateDiff: number | null;
}

const thumb = (id: string) => `/i/sm/scuderia/${id}.webp`;

export function getScuderiaTracks(): ScuderiaTrackData[] {
  return listDirectories(SCUDERIA_DIRECTORY)
    .map((id) => {
      const { data, content } = readMarkdown(SCUDERIA_DIRECTORY, id);
      const inserted = parseIdDate(id);
      const released = parseDate(data.released);

      return {
        id,
        title: data.title,
        artist: data.artist,
        album: data.album || null,
        thumb: thumb(id),
        content,
        youtube: data.youtube,
        releaseYear: (data.released || '').slice(-4),
        displayDate: inserted ? formatShortDate(inserted) : null,
        dateDiff: inserted && released ? daysBetween(inserted, released) : null,
      };
    })
    .sort((a, b) => b.id.slice(0, 6).localeCompare(a.id.slice(0, 6)));
}

export function getLatestScuderiaArticle(): ScuderiaArticle | null {
  const latest = listDirectories(SCUDERIA_DIRECTORY)
    .filter((entry) => /^\d{6}/.test(entry))
    .sort((a, b) => b.slice(0, 6).localeCompare(a.slice(0, 6)))[0];

  if (!latest) return null;

  const { data } = readMarkdown(SCUDERIA_DIRECTORY, latest);
  return {
    id: latest,
    title: data.title ?? '',
    artist: data.artist ?? [],
    album: data.album ?? null,
    thumb: thumb(latest),
  };
}
