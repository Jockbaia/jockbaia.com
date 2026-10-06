const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');

const scuderiaDir = path.join(__dirname, '..', 'content', 'scuderia');

function usage() {
  console.log(`
Create the next Scuderia post from a YouTube link.

Usage:
  npm run new:scuderia -- <youtube-url> [options]

Options:
  --released <date>   Release date (DD-MM-YYYY, YYYY-MM-DD or YYYY)
  --album <name>      Album name (omit flag = single)
  --genres <a,b>      Genres, comma separated
  --id <yymmdd>       Override the post id (default: next Sunday after last post)
  --no-prompt         Don't ask anything, just scaffold
`);
}

function parseArgs(argv) {
  const args = { flags: {}, id: null, url: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (key === 'no-prompt') {
        args.flags.noPrompt = true;
      } else if (key === 'help' || key === 'h') {
        args.help = true;
      } else {
        args.flags[key] = argv[++i];
      }
    } else if (!args.url) {
      args.url = arg;
    } else if (!args.id) {
      args.id = arg;
    }
  }
  return args;
}

function extractVideoId(input) {
  const match = String(input).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^&]*&)*v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/
  );
  if (match) return match[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
  return null;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function toId(date) {
  const yy = String(date.getFullYear()).slice(-2);
  return `${yy}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function latestPostId() {
  if (!fs.existsSync(scuderiaDir)) return null;
  return (
    fs
      .readdirSync(scuderiaDir)
      .filter((name) => /^\d{6}$/.test(name))
      .filter((name) => fs.statSync(path.join(scuderiaDir, name)).isDirectory())
      .sort()
      .pop() || null
  );
}

// The next post goes in the first Sunday strictly after the latest one.
function nextPostId() {
  const latest = latestPostId();
  const date = latest
    ? new Date(
        2000 + Number(latest.slice(0, 2)),
        Number(latest.slice(2, 4)) - 1,
        Number(latest.slice(4, 6))
      )
    : new Date();
  date.setDate(date.getDate() + 1);
  while (date.getDay() !== 0) date.setDate(date.getDate() + 1);
  return toId(date);
}

async function fetchOembed(videoId) {
  const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const endpoint =
    'https://www.youtube.com/oembed?format=json&url=' +
    encodeURIComponent(pageUrl);
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`YouTube oEmbed responded ${res.status}`);
  return res.json();
}

function cleanTitle(title) {
  return title
    .replace(
      /\s*[\(\[][^)\]]*\b(?:official|video|audio|lyric|visualizer|4k|hd)\b[^)\]]*[\)\]]/gi,
      ''
    )
    .replace(/\s*[-–—]\s*$/, '')
    .trim();
}

function deriveMeta(oembed) {
  const author = (oembed.author_name || '').trim();
  const isTopic = /-\s*Topic$/i.test(author);
  const channel = author.replace(/\s*-\s*Topic$/i, '').trim();
  const title = cleanTitle(oembed.title || '');

  // "Artist - Track (Official Video)" style titles: split on the dash.
  // Auto-generated "- Topic" channels carry the artist already, so skip.
  if (!isTopic) {
    const parts = title.split(/\s+[-–—]\s+/);
    if (parts.length >= 2 && parts[0].trim() && parts.slice(1).join('')) {
      return {
        title: parts.slice(1).join(' - ').trim(),
        artist: parts[0].trim(),
      };
    }
  }

  return { title, artist: channel };
}

async function downloadCover(videoId, destPath) {
  const candidates = ['maxresdefault', 'hq720', 'sddefault', 'hqdefault'];
  for (const name of candidates) {
    const url = `https://i.ytimg.com/vi/${videoId}/${name}.jpg`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 5000) continue;
      fs.writeFileSync(destPath, buffer);
      return { name, bytes: buffer.length };
    } catch {
      // try the next size
    }
  }
  return null;
}

function normalizeReleased(value) {
  const released = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(released)) {
    const [year, month, day] = released.split('-');
    return `${day}-${month}-${year}`;
  }
  return released;
}

function yaml(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildMarkdown({ title, artist, album, released, genres, youtube }) {
  const lines = ['---', `title: ${yaml(title)}`, `artist: [${yaml(artist)}]`];
  if (album) lines.push(`album: ${yaml(album)}`);
  if (released) lines.push(`released: ${yaml(released)}`);
  if (genres.length) {
    lines.push('genres: [', `\t${genres.map(yaml).join(', ')}`, ']');
  }
  lines.push(`youtube: ${yaml(youtube)}`, '---', '');
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.url) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  const videoId = extractVideoId(args.url);
  if (!videoId) {
    console.error(`Could not read a YouTube video id from "${args.url}"`);
    process.exit(1);
  }

  const id = args.id || args.flags.id || nextPostId();
  if (!/^\d{6}$/.test(id)) {
    console.error(`--id must be yymmdd, got "${id}"`);
    process.exit(1);
  }

  const dir = path.join(scuderiaDir, id);
  if (fs.existsSync(dir)) {
    console.error(`Content folder already exists: content/scuderia/${id}`);
    process.exit(1);
  }

  console.log(
    `Fetching metadata for https://www.youtube.com/watch?v=${videoId}`
  );
  let oembed;
  try {
    oembed = await fetchOembed(videoId);
  } catch (err) {
    console.error(`oEmbed failed: ${err.message}`);
    console.error('Check the link, or rerun later (folder not created).');
    process.exit(1);
  }

  const meta = deriveMeta(oembed);

  let released = args.flags.released || '';
  let album = args.flags.album;
  let genres = (args.flags.genres || '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);

  const promptForDetails =
    !args.flags.noPrompt && !args.flags.released && process.stdin.isTTY;
  if (promptForDetails) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    released = await rl.question(
      'released (DD-MM-YYYY, YYYY-MM-DD or YYYY) [enter to skip]: '
    );
    if (album === undefined) {
      album = await rl.question('album [enter = single]: ');
    }
    if (!args.flags.genres) {
      const answer = await rl.question(
        'genres (comma separated) [enter to skip]: '
      );
      genres = answer
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
    }
    rl.close();
    album = album && album.trim() ? album.trim() : undefined;
  }

  released = normalizeReleased(released);

  fs.mkdirSync(dir, { recursive: true });

  const youtube = `https://www.youtube.com/watch?v=${videoId}`;
  const markdown = buildMarkdown({
    title: meta.title || videoId,
    artist: meta.artist || oembed.author_name || 'Unknown',
    album,
    released,
    genres,
    youtube,
  });
  fs.writeFileSync(path.join(dir, `${id}.md`), markdown);

  const cover = await downloadCover(videoId, path.join(dir, `${id}.jpg`));

  console.log(`\nCreated content/scuderia/${id}/`);
  console.log(`  title:  ${meta.title}`);
  console.log(`  artist: ${meta.artist}`);
  console.log(`  md:     ${id}.md`);
  if (cover) {
    console.log(
      `  cover:  ${id}.jpg (${cover.name}, ${(cover.bytes / 1024).toFixed(0)} kB)`
    );
  } else {
    console.log(`  cover:  MISSING - drop an image in the folder as ${id}.jpg`);
  }
  if (!released) {
    console.log('\n! released date not set - the card needs it for the year.');
  }
  console.log('\nNext: write the paragraph in the .md, then `npm run dev`.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
