# CI/CD validation evidence

Feature PR: #81 (`feature/portfolio-cicd` -> develop). This is deployment tooling
and active-branch security remediation; the public portfolio appearance is unchanged.

- Local static checks: 10 published HTML pages, local href/src/anchors, JSON-LD,
  sitemap/RSS/listing consistency. Passed.
- Browser smoke: Chrome on 1440/768/390/320px; no clipping/overflow, full-height
  hero, keyboard disclosures, menu Escape/focus return, reduced motion, no-JS
  navigation/content, XML feed parsing, resume PDF and contact link. Passed.
- Local negative fixtures: known unsafe path, unpinned action, broken local link,
  bad/missing Lighthouse scores fail their respective guards. Passed.
- Change-scope fixtures: internal docs skip rendered audits; blog/dependency/
  workflow changes request them. Pre-deployment explicitly forces full audits.
- Dependency audit after adding the browser driver: zero reported vulnerabilities.
- Weekly external-link checker: 28 URLs checked, zero broken, zero needing review.
- GitHub expanded clean suite run 43745134296: passed all required steps.
- Controlled negative run 43745439221 at ec3cc1590f33ea9a65af4443e69131177d06f748:
  failed with `index.html: missing /ci-intentionally-missing-page.html`.
  GitHub showed PR #81 BLOCKED. Fixture removed before merge; never published.
- Restore packaging locally tested against v2026.11.15: 36 public files,
  digests/links verified; unsafe historical configuration excluded. Invalid ref
  rejected. Restoration is not claimed as an end-to-end production test yet.

Native repository configuration verified through GitHub API:

- Required PR + `Quality and security` check on main/develop; force push/deletion
  blocked; merge commits enabled, branch deletion after merge disabled.
- Release v* tags protected against deletion/rewriting.
- Default Actions token read-only; workflow PR review approval disabled.
- Native secret scanning and push protection enabled.
- github-pages requires yogeshwaran-c, main-only branch policy, admin bypass false.
  Self-review allowed intentionally for the single-owner deployment approval.
- Pages source set to workflow. Existing public site remains available.

Still requires owner action: merge the separate main release PR, then approve the
waiting production job. No agent approval of production is implied by approving
implementation work. Verify the waiting gate, deployed source and restore flow
after that activation. Telemetry-credential revocation on the old migration and
old-laptop incident review are outside what these repository checks can establish.
