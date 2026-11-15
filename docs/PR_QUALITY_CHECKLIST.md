# Portfolio quality gate

Use this checklist for every change and PR. Check only completed work. Mark
irrelevant items N/A with a reason. Record failures and verification limits in
the PR; do not claim a full audit from a Lighthouse score. Documentation-only
changes need links/content review, not browser or performance reruns.

Run `node scripts/check-site.cjs` from the repository root for the published HTML
and local-link checks. For Lighthouse use Chrome DevTools (mobile and desktop) or
the CLI pinned to the version recorded in the latest audit. Retain raw reports
under ignored dist/; don't commit full reports containing local environment data.

## Content and hiring clarity

- [ ] Identity, role, location, experience dates and public contact details agree
  across changed pages, README, resume sources and generated assets.
- [ ] Claims, project ownership and outcomes have evidence. No invented metrics,
  testimonials or private employer data. Illustrations are clearly labelled.
- [ ] OSS figures are dated snapshots verified against merged PRs with an explicit
  counting scope; follow all eight update locations in CLAUDE.md.
- [ ] Blog dates, published HTML, listing, RSS, sitemap and canonical URLs agree.
  Drafts are not presented as published work. Check spelling and stale copy.
- [ ] Work and contact/resume actions are easy to find; links are descriptive.

## Design and functionality

- [ ] Preserve shared colors, fonts and heading patterns; review the whole page.
- [ ] Check 320, 390, 768, 1024, 1280 and 1440px widths, short viewports and zoom.
  No clipped name, overlapping text, horizontal overflow or inaccessible controls.
- [ ] Hero fills the opening viewport. Navigation, anchors, mobile menu, focus
  return, disclosures, resume download and contact links work.
- [ ] Content works without JavaScript and when external resources fail.
- [ ] Motion is brief and purposeful; respect reduced motion. No blocking loader,
  forced scroll, autoplay distractions or costly perpetual animations.

## Accessibility: WCAG 2.2 AA target

- [ ] Run automated accessibility checks on changed page types; resolve findings.
- [ ] Manually check keyboard-only use, visible/unobscured focus, logical order,
  skip link, Escape, focus trapping only inside an open modal, and focus return.
- [ ] Check headings, landmarks, labels, names, alternative text, disclosure state,
  screen-reader announcements and touch targets (24px minimum or valid exception).
- [ ] Normal text contrast >=4.5:1; large text and meaningful UI >=3:1. Test actual
  backgrounds and states, not just palette swatches. Never rely on color alone.
- [ ] Verify reflow at 320 CSS px, 200% text zoom, and reduced-motion behavior.
  Record screen-reader/browser combinations tested; do not infer conformance.

## Lighthouse and performance

- [ ] For rendered changes, measure homepage and affected page types on mobile
  and desktop. Record URL, revision, Lighthouse/Chrome versions, date, device
  preset, throttling, warnings, external-resource failures and report locations.
- [ ] Use three mobile runs for a release candidate and report the median. Keep
  comparable conditions; investigate >5-point performance regressions.
- [ ] Project targets: Performance >=90 on mobile and desktop; automated
  Accessibility, Best Practices and SEO =100. A failed target needs a documented
  cause and explicit acceptance before merge, not a falsely checked box.
- [ ] Track LCP <=2.5s, CLS <=0.1 and TBT as a lab diagnostic. INP <=200ms is a
  field target at the 75th percentile; Lighthouse navigation does not certify it.
- [ ] Review bytes, requests, render-blocking resources, font loading, image
  dimensions/compression and JS work. Do not add a framework for visual polish.
- [ ] Repeat on production after deployment; localhost scores do not measure CDN,
  production caching, TLS or real-user experience. Keep failed runs for diagnosis.

## SEO and AEO

- [ ] Unique useful title/description, correct canonical, indexability, social
  previews, semantic headings and crawlable links on affected pages.
- [ ] Structured data parses and matches visible facts. Sitemap, robots, RSS,
  redirects and 404 behavior remain correct. No draft URLs in publication feeds.
- [ ] Important facts and answers exist in readable HTML; llms.txt is optional
  supporting navigation, not a ranking guarantee or substitute for SEO.
- [ ] Check Search Console/Bing coverage where owner access exists; record when
  unavailable. No promises of search ranking or AI-answer placement.

## Security, privacy and release

- [ ] No secrets, private transcripts, local review folders or corporate settings
  in the diff. Inspect new scripts, dependencies, hooks and network destinations.
- [ ] No known malicious startup files. Never restore or execute setup.js.
- [ ] Validate external-resource integrity where applicable, HTTPS and new-tab
  link behavior. Check analytics/privacy implications if tracking changes.
- [ ] Inspect staged diff; only intended files committed. Feature PR -> develop,
  separate release PR develop -> main; preserve feature branches. Local design
  iterations stay unpublished until user approval.
- [ ] User-facing release has a dated tag, release notes, successful deployment
  and production smoke check. Record remaining issues and rollback reference.

## Measurement references

- [Lighthouse scoring and variability](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [Core Web Vitals and lab/field distinction](https://web.dev/articles/vitals)
- [Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)
