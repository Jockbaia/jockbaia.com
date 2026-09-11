// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');

const DATA_DIRECTORY = path.join(process.cwd(), 'content', 'posts');
const SITE_URL = 'https://jockbaia.com';

function getDirectoryEntries() {
  if (!fs.existsSync(DATA_DIRECTORY)) return [];
  return fs
    .readdirSync(DATA_DIRECTORY)
    .filter((entry) =>
      fs.statSync(path.join(DATA_DIRECTORY, entry)).isDirectory()
    );
}

function getAllUrls() {
  const entries = getDirectoryEntries();
  const postUrls = entries.map((id) => {
    return `${SITE_URL}/${id}`;
  });
  const staticUrls = [SITE_URL, `${SITE_URL}/blog`, `${SITE_URL}/scuderia`];
  return [...staticUrls, ...postUrls];
}

function generateSitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`)
    .join('\n')}\n</urlset>`;
}

function writeSitemap() {
  const urls = getAllUrls();
  const sitemap = generateSitemap(urls);
  const outDir = path.join(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
}

writeSitemap();
