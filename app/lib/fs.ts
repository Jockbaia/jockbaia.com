import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export function listDirectories(directory: string): string[] {
  return fs
    .readdirSync(directory)
    .filter((entry) => fs.statSync(path.join(directory, entry)).isDirectory());
}

export function readMarkdown(directory: string, id: string) {
  const fullPath = path.join(directory, id, `${id}.md`);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return matter(fs.readFileSync(fullPath, 'utf8'));
}
