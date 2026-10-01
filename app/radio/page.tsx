import fs from 'fs';
import path from 'path';
import RadioPlayer from './RadioPlayer';

export const metadata = {
  title: 'Radio | Jockbaia',
};

export default function RadioPage() {
  const manifestPath = path.join(process.cwd(), 'public', 'radio-tracks.json');
  let tracks: { src: string; title: string; date: string | null }[] = [];

  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    tracks = JSON.parse(raw);
  } catch {
    tracks = [];
  }

  return <RadioPlayer tracks={tracks} />;
}
