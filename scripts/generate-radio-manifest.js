const fs = require('fs');
const path = require('path');

const RADIO_DIR = path.join(process.cwd(), 'public', 'radio');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'radio-tracks.json');

function parseTrack(file) {
  const base = path.basename(file, path.extname(file));
  const match = base.match(/^\[(\d{6})\]\s*(.+)$/);
  if (match) {
    const rawDate = match[1];
    const formattedDate = `${rawDate.slice(0, 2)}.${rawDate.slice(2, 4)}.${rawDate.slice(4, 6)}`;
    return {
      src: `/radio/${encodeURIComponent(file)}`,
      title: match[2].replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim(),
      date: formattedDate,
    };
  }
  return {
    src: `/radio/${encodeURIComponent(file)}`,
    title: base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim(),
    date: null,
  };
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateRadioManifest() {
  if (!fs.existsSync(RADIO_DIR)) {
    fs.mkdirSync(RADIO_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(RADIO_DIR)
    .filter((file) => file.toLowerCase().endsWith('.mp3'))
    .sort();

  const tracks = shuffle(files.map(parseTrack));

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(tracks, null, 2));
  console.log(`Radio manifest generated with ${tracks.length} track(s).`);
}

generateRadioManifest();
