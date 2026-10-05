// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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

function getPosts() {
  return getDirectoryEntries().map((id) => {
    const file = path.join(DATA_DIRECTORY, id, `${id}.md`);
    return { id, ...matter(fs.readFileSync(file, 'utf8')).data };
  });
}

function getAllUrls() {
  const posts = getPosts();

  const postUrls = posts.map((post) => `${SITE_URL}/${post.id}`);
  const tagUrls = [
    ...new Set(
      posts
        .filter((post) => !post.hidden)
        .flatMap((post) => post.tags || [])
        .map((tag) => tag.toLowerCase().replace(/\s+/g, '-'))
    ),
  ].map((tag) => `${SITE_URL}/tag/${tag}`);
  const staticUrls = [SITE_URL, `${SITE_URL}/scuderia`];

  return [...staticUrls, ...tagUrls, ...postUrls];
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
