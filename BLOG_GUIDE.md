# Technical Blogging Guide

A concrete system to start writing one technical blog post per month — tailored to a strong OSS profile (78+ merged PRs across Microsoft/VS Code, NestJS, Angular Material, BullMQ, Supabase, etc.) and shipping AI/LLM systems at work.

> You already have the content. 78 merged PRs are 78 blog posts waiting to be written.

---

## 1. Where to publish

**Own domain + cross-post.** Set up `yogeshwaran.com/blog` as the canonical source. Cross-post to Hashnode and Dev.to with `rel="canonical"` pointing back to your domain — SEO value accrues to you, community discoverability still works. Skip Medium (it throttles technical content).

Cheapest paths:
- A subdirectory of the existing site (MDX + current stack)
- Hashnode with custom domain mapping (`blog.yogeshwaran.com`)

---

## 2. What to write — you already have the content

Your PRs are the posts. 10 titles you could write right now:

1. *Fixing an inverted chokidar watcher filter in NestJS CLI*
2. *Why VS Code's minimap was eating comment delimiters (and my fix)*
3. *How BullMQ's flow deduplication lost the original job ID*
4. *Debugging Angular Material component races — a pattern across 13 PRs*
5. *What I learned shipping 27 PRs to nestjs/nest-cli*
6. *Building a document intelligence pipeline: NestJS + FastAPI + DSPy*
7. *Semantic search with Azure AI Search + `text-embedding-ada-002` — what the docs don't say*
8. *Pydantic structured output for LLM filter extraction (with conflict resolution)*
9. *Multi-tenant isolation in NestJS + TypeORM — hard lessons*
10. *SSE streaming for conversational AI — heartbeats, typing, reconnects*

---

## 3. The writing system (keep it cheap to run)

**Weekly, 10 minutes:** Open a `notes.md` file. When you fix something interesting at work or in OSS, jot 3 lines — context, problem, fix. Don't write the post yet. Just the seed.

**Monthly, one weekend afternoon:** Pick the best seed, expand to 800–1500 words. Publish by day 7 of the month so it becomes a habit, not a deadline.

---

## 4. Post format that works

Every post follows this structure:

- **Hook** (1 paragraph) — the specific scenario, with version numbers
- **What broke** — the symptom, with actual error output or code
- **The investigation** — how you found the root cause (this is the most interesting part — don't skip it)
- **The fix** — the diff, ideally with a link to the merged PR
- **The takeaway** — one sentence someone can screenshot

Keep it concrete. Avoid "best practices" / "10 tips" listicles — they read as AI slop now.

---

## 5. Distribution (do this for every post)

1. **Twitter/X** — one-sentence hook + link + a code screenshot
2. **LinkedIn** — repost with a paragraph framing why it matters
3. **Hacker News** — submit between 8–10 AM ET Sat/Sun for best traction
4. **Reddit** — the relevant subreddit (r/node, r/angular, r/typescript)
5. **Relevant Discord** — drop in #showcase or #blog channels

---

## 6. The first post — start this weekend

Write the **VS Code minimap post**. It's short, concrete, has code, and positions you as a Microsoft contributor on day one.

Working title: *"A subtle off-by-one in VS Code's minimap — how I found and fixed it"*

---

## Checklist before publishing

- [ ] Specific scenario with version numbers in the hook
- [ ] Actual code/error output, not generic prose
- [ ] Link to the merged PR
- [ ] One screenshot-worthy takeaway sentence
- [ ] Canonical URL set if cross-posting
- [ ] Distribution done within 24h of publishing
