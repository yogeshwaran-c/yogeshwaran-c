---
title: "The dark theme the browser didn't know about: one line of color-scheme in Swagger UI"
date: 2026-10-16
tags: [css, swagger-ui, dark-mode, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-10-swagger-ui-dark-mode-color-scheme
pr: https://github.com/swagger-api/swagger-ui/pull/10844
status: outline
publishOn: 2026-10-16
---

> **Status: outline.** Buffer draft per BLOG_DISCIPLINE rule #4. Flesh out in early October.

## Hook (to write)

Swagger UI ships a dark theme (`html.dark-mode`) that restyles everything it owns — and nothing it doesn't. Scrollbars, text inputs, checkboxes, `<select>` dropdowns, date and color pickers all kept rendering light, because those are painted by the browser from UA defaults, not by the page's stylesheet. The page was dark; the browser was never told.

## Beats

- **What broke:** a class-toggled dark theme bypasses the only channels the UA listens to. `prefers-color-scheme` reflects the OS setting, not your class; without `color-scheme: dark` (CSS) or `<meta name="color-scheme">`, the browser assumes a light page and paints native widgets accordingly. Users were working around it by injecting the meta tag into their host HTML.
- **Wrong first guess (TBD — reconstruct):** restyle the controls one by one? `scrollbar-color`, `accent-color`, `::-webkit-scrollbar`, custom select skins — the whack-a-mole path every custom dark theme starts down before learning the UA owns some pixels outright (the date picker popup is unreachable from CSS, full stop).
- **The fix:** one line — `color-scheme: dark;` on `html.dark-mode` (+1/−0, `src/style/_dark-mode.scss`). The property cascades; the UA switches its entire native palette: form controls, scrollbars, picker popups, even the canvas default background.
- **The takeaway:** a theme class is a claim you make to your users; `color-scheme` is the claim you make to the browser. Custom-property dark themes restyle what CSS can reach — `color-scheme` is the API for the pixels it can't. Also the layering: OS setting → `prefers-color-scheme` → page's declared `color-scheme` → UA widget palette, and a class toggle short-circuits the first two, so it must set the third explicitly.
- **Cross-link:** July's swagger-ui crash post (same repo, third swagger-ui appearance — series note about becoming a repeat contributor to a codebase you now know). September's 'model what the runtime does' thread also echoes: the page and the browser each hold a model, and bugs live in the gap.
- **Screenshot-worthy line candidate:** "The page was dark; the browser didn't know. Every pixel the page couldn't paint was still painting for a light page."

## Sign-off (template)

*Written after merging [#10844](https://github.com/swagger-api/swagger-ui/pull/10844) into swagger-api/swagger-ui. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*
