# Blog Publishing Guide

Step-by-step runbook for publishing a post on `yogeshwaran.com/blog/` and cross-posting to Hashnode, Dev.to, and social channels.

Companions:
- [BLOG_GUIDE.md](./BLOG_GUIDE.md) — how to write a post (system, format, distribution concept)
- [BLOG_DISCIPLINE.md](./BLOG_DISCIPLINE.md) — how to keep writing (habits, rituals)

---

## Architecture

We use a **subdirectory** (not a subdomain) to consolidate SEO authority on the main domain.

**URL pattern:**

```
https://yogeshwaran.com/                                              (portfolio)
https://yogeshwaran.com/blog/                                         (blog listing)
https://yogeshwaran.com/blog/2026-04-vscode-debug-console-copy-paste  (individual post)
```

**Repo layout:**

```
yogeshwaran_c/
├── index.html                                         # portfolio home
├── blog/
│   ├── index.html                                     # blog listing page
│   ├── <YYYY-MM>-<slug>.md                            # markdown source (reference, drafts)
│   └── <YYYY-MM>-<slug>.html                          # published HTML (what gets served)
├── resume/                                            # existing
├── BLOG_GUIDE.md
├── BLOG_DISCIPLINE.md
└── BLOG_PUBLISHING.md                                 # this file
```

**Design decisions:**

- Markdown `.md` is the drafting format — it's easy to edit, cross-posts cleanly to Hashnode/Dev.to
- Rendered `.html` is what's served to visitors — matches portfolio theme, has proper meta tags, syntax highlighting, canonical link
- Both commit to the repo side by side

---

## Canonical URL — what it is and why it matters

When you publish the same post in multiple places (your site + Hashnode + Dev.to), search engines see duplicate content and pick *one* to rank. Without guidance, they may pick Hashnode over your domain. You lose.

A `canonical` link tag tells search engines: **"this is the original — rank THIS URL, not the duplicates."**

### On your own site (the canonical)

Every post page on `yogeshwaran.com/blog/` includes in its `<head>`:

```html
<link rel="canonical" href="https://yogeshwaran.com/blog/<slug>">
```

This declares itself the source of truth.

### On cross-posts (the copies)

Every Hashnode / Dev.to version must include a canonical pointing BACK to your domain. This cedes SEO authority to you while still getting community discoverability.

Result: Your domain gets the search rankings, Hashnode/Dev.to still drive readers to you.

---

## Publishing a new post — step by step

### 0. Prerequisites

- The markdown draft exists in `blog/<YYYY-MM>-<slug>.md` with front-matter (title, date, tags, canonical, pr)
- You've reviewed it against the [BLOG_DISCIPLINE.md](./BLOG_DISCIPLINE.md) checklist
- You're on `develop` branch, up to date

### 1. Create the feature branch

```bash
git checkout develop && git pull origin develop
git checkout -b feature/blog-<post-slug>
```

### 2. Render the HTML version

Copy `blog/_template.html` (to be created — see scaffold PR) to `blog/<YYYY-MM>-<slug>.html` and fill in:

- `<title>` — post title (`<post title> — Yogeshwaran C`)
- `<meta name="description">` — first 1-2 sentences of the post
- `<link rel="canonical" href="https://yogeshwaran.com/blog/<slug>">`
- Open Graph + Twitter meta tags (og:title, og:description, og:url, og:image)
- Post body — convert markdown to HTML preserving heading levels, code blocks, links
- Publication date in the header
- Sign-off paragraph (see BLOG_DISCIPLINE.md rule #10)

### 3. Update the listing page

Edit `blog/index.html` — add the new post at the top:

```html
<article class="post-card">
  <time datetime="2026-04-16">April 16, 2026</time>
  <h2><a href="./2026-04-vscode-debug-console-copy-paste">The bug where VS Code's Debug Console was pasting 'repl:1' into my clipboard</a></h2>
  <p class="excerpt">One-sentence summary of the post.</p>
  <div class="tags">vscode · css · debugging</div>
</article>
```

### 4. Commit and push

```bash
git add blog/ BLOG_PUBLISHING.md
git commit -m "Publish: <post title>

- Adds blog/<YYYY-MM>-<slug>.html
- Updates blog/index.html listing
- Canonical URL: https://yogeshwaran.com/blog/<slug>"
git push -u origin feature/blog-<post-slug>
```

### 5. Open PR → develop

```bash
gh pr create --base develop \
  --title "Publish: <post title>" \
  --body "Summary, post link, test plan"
```

### 6. Merge feature → develop

```bash
gh pr merge <N> --merge --delete-branch
```

### 7. Release develop → main

When you're ready for the post to go live:

```bash
gh pr create --base main --head develop \
  --title "Release: publish <post title>" \
  --body "..."
gh pr merge <N> --merge
```

GitHub Pages will deploy in ~1 minute. Verify the post is live at the canonical URL.

### 8. Cross-post to Hashnode

1. Go to `hashnode.com/create-story`
2. Paste the markdown content (minus the front-matter)
3. Set the cover image (match the OG image on your site)
4. Open **Article Settings → SEO → Canonical URL**
5. Enter: `https://yogeshwaran.com/blog/<slug>`
6. Publish

### 9. Cross-post to Dev.to

1. Go to `dev.to/new`
2. Paste the markdown content — Dev.to parses front-matter natively
3. In the front-matter, include:

```yaml
---
title: "<post title>"
published: true
tags: vscode, css, debugging, opensource
canonical_url: https://yogeshwaran.com/blog/<slug>
cover_image: https://yogeshwaran.com/blog/images/<slug>-cover.png
---
```

4. Publish

### 10. Social distribution (within 24h of publishing)

**Twitter/X:**
- One-sentence hook + code screenshot + link
- Example: *"Spent 2 hours thinking VS Code's copy handler was broken. Turned out to be CSS: user-select: text cascading through a REPL tree. 2-line fix. Write-up: <link>"*

**LinkedIn:**
- Paragraph-length framing — why this matters, what readers will learn
- Link to post
- Add 2-3 relevant tags (#opensource, #vscode, #webdev)

**Reddit:**
- Pick ONE relevant subreddit: `r/vscode`, `r/node`, `r/angular`, etc.
- Clear title summarizing the bug/insight — never use "Blog post:" prefix (auto-downvoted)
- Example title: *"A subtle CSS bug in VS Code's Debug Console — user-select cascading caused source annotations to land in the clipboard"*

**Hacker News** (optional, for strong technical posts only):
- Submit Saturday 8-10 AM ET for best front-page shot
- Use the post title as-is
- URL: your canonical URL (not Hashnode/Dev.to)

---

## Pre-publish checklist

Before hitting merge on the release PR:

### Content
- [ ] Post follows the signature format from BLOG_DISCIPLINE.md
- [ ] One screenshot-worthy takeaway sentence present
- [ ] Cross-links at least 1 previous post (if any exist yet)
- [ ] Sign-off paragraph at the bottom
- [ ] Link to the merged PR included inline

### Technical
- [ ] `<link rel="canonical">` set correctly in `<head>`
- [ ] `<title>` and `<meta name="description">` filled
- [ ] Open Graph tags (og:title, og:description, og:url, og:image) set
- [ ] Twitter card meta tags set
- [ ] Syntax highlighting works on all code blocks
- [ ] All internal links work
- [ ] Listed on `blog/index.html`

### SEO
- [ ] URL slug is descriptive and keyword-rich (no dates in slug if possible — readers hate stale-looking URLs)
- [ ] Title matches `<h1>` matches OG title
- [ ] Meta description under 160 chars, reads like marketing copy

### After publish
- [ ] Cross-posted to Hashnode with canonical URL
- [ ] Cross-posted to Dev.to with `canonical_url` in front-matter
- [ ] Shared on Twitter/X + LinkedIn
- [ ] Submitted to one relevant subreddit
- [ ] Next draft started in the buffer (per BLOG_DISCIPLINE.md rule #4)

---

## Troubleshooting

### "My post is showing on Hashnode when I Google the title, not my domain"

Cause: canonical URL wasn't set, OR Hashnode's copy got indexed first, OR you set canonical to Hashnode by mistake.

Fix:
1. Verify the canonical link on Hashnode points to `yogeshwaran.com/blog/<slug>`
2. Submit the canonical URL to Google Search Console: `Indexing → URL Inspection → Request Indexing`
3. Wait 1-4 weeks for Google to re-crawl

### "GitHub Pages isn't serving the new post"

GitHub Pages has a 1-5 min delay after merge. Check:
- Is the PR merged into `main` (not just `develop`)?
- Is the CNAME file still intact in the repo root?
- Check Actions tab on GitHub for the Pages deploy status

### "The HTML version doesn't match the markdown exactly"

Expected. The markdown is the drafting format; the HTML is the rendered canonical. Keep them in sync manually when you edit (easier with a static generator like Astro/Eleventy if volume increases).

### "I want to update an old post"

Per BLOG_DISCIPLINE.md rule #7 (living documents): just edit the HTML, add an `**Updated YYYY-MM**` note at the top or where the content changed, push via the same feature-branch → develop → main flow. Cross-posts can be updated or left stale (they're not canonical).

---

## Future improvements

- **Static site generator** (Astro recommended) — auto-render markdown to HTML, no manual sync
- **RSS feed** at `/blog/feed.xml` for readers who subscribe
- **Tag pages** — `/blog/tags/vscode/` etc.
- **Search** — client-side with pagefind or similar
- **Reading time** — compute from word count, display in listing
- **Newsletter** — embed a simple form, or use buttondown.email

None of these are needed for the first 10 posts. Ship first, optimize later.
