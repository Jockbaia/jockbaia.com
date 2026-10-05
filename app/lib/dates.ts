const DD_MM_YYYY = /^\d{2}-\d{2}-\d{4}$/;
const DAY_MS = 1000 * 60 * 60 * 24;

export function parseDate(dateString?: string): Date | null {
  if (!dateString || !DD_MM_YYYY.test(dateString)) return null;
  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(dateString: string): string {
  const date = parseDate(dateString);
  return date
    ? date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : dateString;
}

// Parses a leading yymmdd from an id (e.g. "260510-album" -> 2026-05-10)
export function parseIdDate(id: string): Date | null {
  if (!/^\d{6}/.test(id)) return null;
  const [year, month, day] = [
    id.slice(0, 2),
    id.slice(2, 4),
    id.slice(4, 6),
  ].map(Number);
  return new Date(2000 + year, month - 1, day);
}

export const formatShortDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const daysBetween = (from: Date, to: Date): number =>
  Math.ceil((from.getTime() - to.getTime()) / DAY_MS);
