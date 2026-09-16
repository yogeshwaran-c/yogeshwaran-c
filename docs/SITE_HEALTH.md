# SITE_HEALTH.md — Website Checklist & Audit Log

A living checklist of what this site needs, what it has, and what's still open.
Re-audit whenever a big change ships, or roughly once a quarter. Update the
status boxes and append a row to the audit log at the bottom — don't rewrite
history.

**How to re-audit:** work through each section; the *Verify* lines give the
quick command or manual check. Anything that regresses gets unchecked and moved
to Open Items with a priority.

---

## 1. Content & Purpose

- [x] Clear one-line identity on the homepage (full stack; Python/TS/Angular/NestJS)
- [x] Claims backed by verifiable proof (230+ merged PRs, every repo linked)
- [x] Monthly blog that demonstrates skill instead of asserting it
- [x] Contact paths (email, GitHub, LinkedIn) visible without hunting
- [x] Resume downloadable, cache-busted (`?v=N` — see CLAUDE.md)

*Verify:* read the homepage cold, as a recruiter would. Counts fresh? (8-location
sweep in CLAUDE.md.) Latest post recent?

## 2. Discoverability — SEO & AEO

- [x] Unique `<title>` + meta description + canonical on every page
- [x] Open Graph + Twitter cards on every page; `article:*` meta on posts
- [x] `sitemap.xml` auto-generated (`node generate-sitemap.js`), declared in `robots.txt`
- [x] RSS feed (`/blog/feed.xml`) with every post
- [x] JSON-LD graph: `Person` + `WebSite` (home), `Blog` (listing), `BlogPosting` + `BreadcrumbList` (posts), all linked via `@id`
- [x] `llms.txt` pointing AI crawlers at markdown post sources
- [x] `.nojekyll` — Pages serves the repo verbatim (required for `.md` URLs)
- [ ] **Google Search Console verified, sitemap submitted** *(owner: Yogesh — manual)*
- [ ] **Bing Webmaster Tools verified, sitemap submitted** *(owner: Yogesh — manual)*

*Verify:* `grep -c 'application/ld+json'` on each page ≥1; paste a post URL into
validator.schema.org; check Search Console for coverage errors.

## 3. Performance

- [x] Static HTML, no framework, no build step
- [x] Zero images on the homepage (design is pure CSS); heaviest page ~78 KB HTML
- [x] Font loading: preconnect + `display=swap`
- [x] CDN scripts: only Prism (posts) and GSAP (home), SRI-pinned
- [ ] Baseline Lighthouse scores recorded (run once, note numbers here)

*Verify:* Lighthouse in Chrome DevTools on `/` and one post; expect 90+ across
the board. Investigate anything that drops.

## 4. Accessibility

- [x] Landmarks (`nav`, `main`, `contentinfo`), aria-labels, focus styles
- [x] `prefers-reduced-motion` respected on homepage animations
- [x] Semantic headings (one `h1` per page, `h2` sections)
- [ ] Formal pass: axe/Lighthouse a11y audit — confirm cyan-on-dark contrast ratios and keyboard nav through the GSAP-pinned sections

*Verify:* Lighthouse accessibility category; tab through the homepage end to end.

## 5. Security

- [x] HTTPS (GitHub Pages + custom domain)
- [x] Subresource Integrity on all cdnjs scripts/styles (see BLOG_PUBLISHING.md for adding new ones)
- [x] No forms, no user input, minimal attack surface
- [x] Analytics is cookieless (Plausible) — no consent banner needed
- Platform ceiling: Pages can't set custom response headers (CSP etc.) — accepted, not actionable

*Verify:* new post pages must keep `integrity` + `crossorigin` on every cdnjs tag
(pre-publish checklist covers this).

## 6. Legal

- [x] Copyright notice in every footer: `© 2025–<year> Yogeshwaran Chandrakasan · All rights reserved.` (year range auto-updates; 2025 = first publication)
- [x] Privacy: no cookies, no tracking requiring disclosure
- [ ] Optional: explicit licensing note for blog code snippets (e.g. snippets MIT, content all rights reserved) — only if reuse requests ever come in

## 7. Operations & Maintainability

- [x] Git-flow with release gating (feature → develop → PR → main); every change reviewable
- [x] Runbooks: BLOG_GUIDE, BLOG_DISCIPLINE, BLOG_PUBLISHING, CLAUDE.md conventions
- [x] Post template with placeholders (meta, JSON-LD, SRI)
- [x] Draft buffer per BLOG_DISCIPLINE rule #4 (check it's non-empty!)
- [x] Deployed bytes = repo bytes (`.nojekyll`), so local verification is faithful
- [x] 404 page
- [ ] Uptime monitoring (UptimeRobot or similar, free tier) — optional, nice-to-have

## 8. Distribution (the site can't do this itself)

- [ ] Cross-post backlog clear: every published post syndicated to Hashnode + Dev.to with canonical URL *(as of 2026-09-15: July, August pending; September after publish)*
- [ ] Social distribution within 24h of each publish (X/LinkedIn/one subreddit — BLOG_PUBLISHING.md §11)
- [ ] Per-post OG images (titled cards via the existing Playwright screenshot pipeline) — improves share CTR, ~1h of template work, do when convenient

---

## Deliberately NOT doing

Simplicity is a feature. Revisit only if the trigger fires:

| Skipped | Trigger to revisit |
|---|---|
| Framework / static site generator | Manual md→HTML sync actually causes a shipped bug |
| Newsletter, comments | Steady inbound traffic in analytics |
| Tag pages, site search | ~15+ posts |
| Light theme | Never, probably — dark-only is the design |
| CSP meta tags | Site ever accepts user input |

---

## Audit log

| Date | By | Summary |
|---|---|---|
| 2026-09-15 | Yogesh + Claude | Initial audit. Shipped same day: JSON-LD graph, llms.txt, .nojekyll, copyright notices (#63, #66). Open: Search Console/Bing (manual), Lighthouse baseline, a11y pass, cross-post backlog, per-post OG images. |
