# Ongoing assistant context

Established by the user on 2026-11-15 during migration from Claude on another laptop.

- This repository is the user's portfolio, GitHub profile README, resume, and
  technical blog. Use CLAUDE.md as the detailed project runbook.
- The user wants short requests to carry enough context to complete related
  changes without repeatedly explaining the repository.
- Blog cadence: one post each month on the **16th**, timezone Asia/Kolkata.
  This supersedes the older day-7 suggestion in BLOG_GUIDE.md.
- For blog work, read BLOG_GUIDE.md, BLOG_DISCIPLINE.md, and BLOG_PUBLISHING.md;
  inspect existing posts and drafts before selecting a topic. Verify technical
  claims and PR evidence; never invent personal experiences or merged work.
- For OSS count updates, obtain fresh merged-PR evidence for yogeshwaran-c,
  reconcile aggregate and repository counts, and update every location listed in
  CLAUDE.md, including generated images, resume PDF, and cache-busting links.
  Existing counts are snapshots, not current evidence.
- Portfolio redesigns should preserve established identity and content unless
  requested otherwise. Inspect the current design before proposing changes.
- Personal-detail changes must propagate through the portfolio, README, resume
  sources and generated assets where relevant. Use confirmed facts only.
- Time-sensitive wording such as years of experience must be checked against
  the confirmed July 2022 start date rather than copied indefinitely.
- A monthly date is a working preference, not a background scheduler. No recurring
  automation has been configured as part of this migration.

## New laptop status (2026-11-15)

Git and Windows OpenSSH are available. Origin uses HTTPS. Git identity was unset;
no SSH directory was found. GitHub CLI, Node.js and npm were not on PATH.
Reviewed memory from the old laptop's claude-migration repository has now been
imported into Claude's project memory for this laptop's path. Codex uses this
document and AGENTS.md for the relevant confirmed preferences.

## Imported preferences

- Portfolio redesign preference: use AI to improve visual design and execution,
  not to add AI product features. Keep the site lightweight, with tasteful motion.
  The opening hero should fill the landing viewport with the full name visible.
  Preview and iterate locally; publish only after the user approves the direction.
- For redesign v6, preserve the pre-redesign production release v2026.11.15
  (4d7ec2334b5f40255de9c596eda429138292bb5f). The user may request the previous
  public site after several days. Follow docs/REDESIGN_ROLLBACK.md through PRs,
  preserve branches, and never restore malicious tooling from the baseline.
- Every change/PR must apply docs/PR_QUALITY_CHECKLIST.md. Record measured
  Lighthouse scores for rendered changes, manual accessibility/content checks,
  and explicit verification limits. Prepare the CI/CD plan after redesign review:
  checks for develop PRs and an owner approval gate for main releases/deployment.

- Preserve the established color palette, shared typography, section headings,
  spacing patterns, and component styling during scoped redesigns. Avoid local
  overrides that make one section inconsistent without an explicit design reason.
- Treat WCAG 2.2 AA as the accessibility target: check text and UI contrast,
  keyboard operation, visible focus, semantic structure, accessible names,
  responsive reflow, touch targets, and reduced-motion behavior as applicable.
  Verify relevant criteria before claiming conformance; automated checks alone
  do not establish full accessibility.
- Preserve and improve SEO and AEO (answer-engine optimization) through clear,
  factual visible content, logical headings, semantic HTML, crawlable links,
  canonical URLs, accurate metadata and structured data where appropriate.
  Keep structured data consistent with visible content. Never invent claims,
  add hidden keyword stuffing, or promise search/AI-answer placement.
- For each change, check relevant functionality, responsive behavior,
  performance impact, accessibility, and metadata/content consistency. Report
  verification limits rather than claiming untested best-practice compliance.

- Keep chat replies casual and concise. Avoid backticks around names in prose,
  em dashes, and unnecessary double quotes; use single quotes where needed.
  Fenced code samples can retain normal code formatting.
- Always use feature -> develop -> main through separate PRs. Preserve remote
  feature branches after merge. Verify the branch before committing.
- In Windows PowerShell 5.1, use message/body files for Git commits and GitHub PR
  descriptions to avoid native argument quoting problems. Check command success
  before pushing; a failed commit must not be followed by an assumed-success push.
- Historical memory describes older counts, design versions, and file paths.
  Current CLAUDE.md and actual repository contents take precedence.

## Migration security

The migration's global settings contain corporate telemetry configuration and an
embedded authorization credential. These settings, old permission grants, plugin
registrations, custom executable agents and session transcripts were not activated.
Only reviewed writing guidance and memory were restored. Revoke the telemetry
credential separately; do not reproduce it in project documents.

The portfolio's historical setup.js is detected by Defender as a Trojan. Its
Claude/VS Code startup files were removed by Defender; remaining Gemini/Cursor
launch instructions were disabled locally. Never restore or execute that script.
