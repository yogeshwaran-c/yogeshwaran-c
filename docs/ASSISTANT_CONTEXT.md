# Ongoing assistant context

Established by the user on 2026-11-15 during migration from Claude on another laptop.

Current verified state: see PROJECT_STATUS.md, which records later releases.
Redesign v6 and CI/CD are deployed; the owner-approved run 43748291450 completed
successfully on 2026-11-16 with source 97bb008a84a7287bf9e9d422ef17f57d9d28d3d9.
Restore uses the release field in the Publish or restore portfolio workflow on
main. The pre-redesign tag is v2026.11.15; redesign baseline is v2026.11.15-2;
CI/CD release is v2026.11.16; the November post is v2026.11.16-2.

- This repository is the user's portfolio, GitHub profile README, resume, and
  technical blog. Use CLAUDE.md as the detailed project runbook.
- The user wants short requests to carry enough context to complete related
  changes without repeatedly explaining the repository.
- Blog cadence: one post each month on the **16th**, timezone Asia/Kolkata.
  This supersedes the older day-7 suggestion in BLOG_GUIDE.md.
- For blog work, read BLOG_GUIDE.md, BLOG_DISCIPLINE.md, and BLOG_PUBLISHING.md;
  inspect existing posts and drafts before selecting a topic. Verify technical
  claims and PR evidence; never invent personal experiences or merged work.
  A newly published post also changes the homepage published-articles tile.
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
- The monthly date is a working preference, not automatic blog publishing.
  Weekly repository maintenance exists separately in the quality workflow.

## Initial discovery before laptop setup (historical, 2026-11-15)

At initial inspection, origin used HTTPS, Git identity was unset, no SSH directory
was found, and GitHub CLI/Node/npm were not on PATH. Those setup tasks are now
complete; use LAPTOP_SETUP.md and PROJECT_STATUS.md for the verified final state.
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
  and explicit verification limits. The CI/CD plan has been implemented; use
  DEPLOYMENT.md for current rules rather than the historical proposal.
- CI/CD implementation lives in the minimal two-workflow setup documented in
  docs/DEPLOYMENT.md. Main release PR merge is an owner decision; production and
  restore jobs wait for the owner in the github-pages environment. Do not approve
  a deployment for the owner merely because implementation work was authorized.
- Main merge policy: the owner does not need a separate PR review for their own
  merges; other collaborators need the owner's code-owner approval. The owner
  exception applies only to the review rule, never to required CI or PR flow.

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
embedded authorization credential. The first pass restored only reviewed writing
guidance and memory. On 2026-11-17 the owner asked for the old laptop's setup, so
the plugins were reinstalled from the official marketplace and the two agent
prompts and the session transcript were restored after review. The telemetry
settings and credential, the employer plugin marketplace, automatic permission
mode and blanket shell grants were still not activated. Revoke the telemetry
credential separately; do not reproduce it in project documents.

The historical setup.js was detected by Defender as a Trojan. All five known
startup payload/launch files are now removed from active main/develop through
the CI/CD release. History/tags retain them; never restore or execute that script.
The old laptop's execution/exposure state and credential revocation are unverified.
