# Redesign v6: release and rollback

Before-redesign production baseline verified 2026-11-15:

- Release tag: `v2026.11.15`
- Main commit: `4d7ec2334b5f40255de9c596eda429138292bb5f`
- GitHub Pages latest build: built at that same commit.
- This is the live site with compact testimonial rows, before the full redesign.

Keep the tag and `feature/portfolio-redesign-v6` permanently. Do not force-push
main or develop, reset published history, or delete feature branches.

## Release

Feature PR targets develop. Release is a separate develop -> main PR. The user
must approve the release before it is merged or deployed. The CI/CD approval gate
is not yet configured; do not imply GitHub currently enforces it. Record the
feature merge SHA and eventual release merge SHA here when available.

Redesign deployed as v2026.11.15-2: feature merge
ec2564d11b29c4327fb77d8ea2cb3e1e6c97f11f, release merge
bf32788ddc299e987d861d0f1ab2eb2cf084125e. The minimal CI/CD restore procedure is
documented in DEPLOYMENT.md; verify environment settings before calling it active.

## Restore the old appearance after release

1. Create `feature/revert-portfolio-redesign-v6` from current develop.
2. Use `git revert -m 1 <redesign-feature-merge-sha>` to reverse the isolated v6
   changes on that feature branch. This creates a new commit and preserves history.
3. Resolve conflicts deliberately if later work depends on the redesign. Compare
   public pages and generated assets with the baseline tag. If later content
   should be retained, review that separately rather than silently discarding it.
4. Preview locally, apply the quality checklist and create a PR to develop.
5. Merge through the usual flow, then create the develop -> main rollback release
   PR for the user's approval. Verify production and publish a new dated tag.

Do not restore the entire baseline tree. The baseline contains the malicious
startup files discovered during laptop setup. Keep security remediations,
credentials, tooling and repository protections intact during a visual rollback.
The rollback target is the previous public portfolio, not unsafe local hooks.

If v6 has not been deployed, production is already at the baseline: leave main
alone and continue or revert local/feature changes without releasing them.

The proposed deployment pipeline must also support an approved restoration of a
retained public-site build. See docs/CICD_PLAN.md section 4 for artifact identity,
retention, approval, security exclusions and source reconciliation. That workflow
is planned, not installed; the existing verified tag is currently the rollback
reference rather than a tested one-click deployment capability.
