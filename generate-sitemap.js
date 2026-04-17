#!/usr/bin/env node
/**
 * Regenerates sitemap.xml by scanning for all public HTML pages.
 *
 * Usage:
 *   node generate-sitemap.js
 *
 * Run this before committing whenever you add/remove a page or blog post.
 * It's included in the publishing flow (docs/BLOG_PUBLISHING.md step 4).
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://yogeshwaran.com';
const ROOT = __dirname;

// Files/patterns to skip
const SKIP = new Set([
  'blog/_template.html',
  'og-template.html',
  'linkedin-banner-template.html',
  '404.html',
]);

function getLastModified(filePath) {
  const stat = fs.statSync(filePath);
  return stat.mtime.toISOString().split('T')[0]; // YYYY-MM-DD
}

function findHtmlFiles(dir, base = '') {
  const entries = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${item.name}` : item.name;
    const full = path.join(dir, item.name);

    // Skip hidden dirs, node_modules, docs, resume, .git
    if (item.isDirectory()) {
      if (['node_modules', '.git', '.claude', 'docs', 'resume'].includes(item.name)) continue;
      entries.push(...findHtmlFiles(full, rel));
      continue;
    }

    if (!item.name.endsWith('.html')) continue;
    if (SKIP.has(rel)) continue;

    entries.push({ rel, full });
  }
  return entries;
}

// Build URL list
const pages = findHtmlFiles(ROOT);
const urls = pages.map(({ rel, full }) => {
  // index.html -> directory URL; other .html -> extensionless URL
  let loc;
  if (rel === 'index.html') {
    loc = `${DOMAIN}/`;
  } else if (rel.endsWith('/index.html')) {
    loc = `${DOMAIN}/${rel.replace(/\/index\.html$/, '/')}`;
  } else {
    loc = `${DOMAIN}/${rel.replace(/\.html$/, '')}`;
  }

  const lastmod = getLastModified(full);

  // Priority: home=1.0, blog listing=0.8, posts=0.7, others=0.5
  let priority = '0.5';
  let changefreq = 'monthly';
  if (rel === 'index.html') { priority = '1.0'; changefreq = 'monthly'; }
  else if (rel === 'blog/index.html') { priority = '0.8'; changefreq = 'weekly'; }
  else if (rel.startsWith('blog/')) { priority = '0.7'; changefreq = 'monthly'; }

  return { loc, lastmod, changefreq, priority };
});

// Sort: home first, then blog listing, then posts, then others
urls.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));

// Generate XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml generated — ${urls.length} URLs:`);
urls.forEach(u => console.log(`  ${u.priority}  ${u.loc}`));
