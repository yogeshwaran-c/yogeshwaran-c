---
title: "The dark theme the browser didn't know about: one line of color-scheme in Swagger UI"
date: 2026-10-16
tags: [css, swagger-ui, dark-mode, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-10-swagger-ui-dark-mode-color-scheme
pr: https://github.com/swagger-api/swagger-ui/pull/10844
status: published
publishOn: 2026-10-16
---

## Hook

Swagger UI ships a dark theme: toggle `html.dark-mode` and the whole page goes properly dark — background, typography, operation blocks, code samples. Then you click into an endpoint that takes a date parameter, the native date picker opens, and a blinding white panel lands in the middle of your dark page. Scroll, and the scrollbar is light too. So is every checkbox, every `<select>` dropdown, every text input's autofill chrome.

The stylesheet didn't miss those. It *can't reach* them. They're painted by the browser from its own palette, and the browser was never told this page is dark. Users had been working around it by injecting `<meta name="color-scheme" content="light dark">` into whatever host page embeds Swagger UI — patching the library from the outside.

## What broke

The browser decides how to paint the pixels it owns — scrollbars, form-control chrome, the popups for `<input type="date">` and `<input type="color">`, even the default canvas behind your page — from exactly two signals:

1. **The OS preference**, surfaced to CSS as `prefers-color-scheme`. This reflects the user's system setting, not your page.
2. **The page's own declaration**: the CSS `color-scheme` property (or its meta-tag equivalent), which tells the browser which palettes this page actually supports.

A class-toggled theme talks to neither. `html.dark-mode` restyles every pixel the stylesheet owns and is completely invisible to the UA's palette choice. With no declaration, the browser assumes the page is a traditional light page — that's the only safe default, because rendering dark form controls on a light page would break thirty years of the web. So Swagger UI's theme and the browser's theme disagreed, and every native widget rendered for a page that didn't exist:

```html
<!-- the workaround users were shipping in their HOST page -->
<meta name="color-scheme" content="light dark">
```

That meta tag fixes it — but it belongs to the embedding page, not the library. The theme's own stylesheet should carry its own declaration.

## What I thought the fix was (wrong first, as always)

The same path every custom dark theme starts down: restyle the controls one by one.

```css
/* the whack-a-mole route */
.dark-mode { scrollbar-color: #4a4a4a #1e1e1e; }
.dark-mode input, .dark-mode select { accent-color: #4990e2; }
.dark-mode ::-webkit-scrollbar { background: #1e1e1e; }
```

Each rule works, each covers one widget on some browsers, and the list never ends — `scrollbar-color` is standard but `::-webkit-scrollbar` isn't, `accent-color` tints checkboxes but not the dropdown panel of a `<select>`, and then you hit the wall: the date picker popup is an OS-level surface. No selector reaches it. You can restyle the input box; the calendar that opens from it is not your pixel, full stop.

That wall is the tell. When some of the pixels are unreachable by CSS, the answer can't be more CSS — it has to be the channel the browser actually listens to.

## The fix

One line, [PR #10844](https://github.com/swagger-api/swagger-ui/pull/10844), +1/−0 in `src/style/_dark-mode.scss`:

```diff
 html.dark-mode {
+  color-scheme: dark;
   background: $neutral-98;
```

`color-scheme: dark` on the root is the page telling the browser: this page supports dark; paint your pixels to match. The property cascades, and the UA switches its entire native palette in one move — scrollbars, form-control chrome, the `<select>` dropdown panel, the date and color picker popups, autofill styling, the default canvas color. Every widget the whack-a-mole list was chasing, plus the ones it hadn't found yet, including the popup CSS can't touch at all.

Two details worth noting. It's `dark`, not `light dark`: the declaration sits inside `html.dark-mode`, so it only exists while the dark theme is active — the claim is exact by construction. And it composes with the host-page workaround instead of fighting it: `color-scheme` resolves per element, so an embedding page that already declares its own scheme keeps it outside the Swagger UI root.

## The takeaway

**A theme class is a claim you make to your users. `color-scheme` is the claim you make to the browser.** A custom dark theme that only does the first has styled every pixel it can reach and left every pixel it can't — and users experience the gap as flashes of white in dark mode.

The layering is worth internalizing: OS setting → `prefers-color-scheme` → the page's declared `color-scheme` → the UA's widget palette. A class toggle short-circuits the first two — your JavaScript decided the theme, not the OS — so it must set the third explicitly, or the chain never reaches the browser.

Screenshot-worthy line: **"The page was dark; the browser didn't know. Every pixel the page couldn't paint was still painting for a light page."**

If you ship any class-toggled theme — `data-theme="dark"`, `.dark`, a toggle button — go check it now: the rule is that whatever flips your theme class must also flip `color-scheme`. It's the same lesson September's post taught from the other side: the page and the runtime each hold a model of the world, and bugs live wherever the two models are allowed to disagree silently.

## Why this PR is a good first OSS contribution

It's the smallest diff of this series — one line, no logic, no tests to design — and it still took the most specific knowledge per character: knowing where CSS's authority ends and the UA's begins, and which property moves that boundary. Small diffs with sharp reasoning are ideal first contributions, because review is fast and the discussion is about the idea, not the code.

It's also my third merged fix in swagger-api/swagger-ui, and that's its own lesson: the second and third contributions to a codebase cost a fraction of the first. You know the build, the review culture, the file layout. Picking a repo you'll return to compounds in a way that scattering one-off PRs doesn't.

---

*Written after merging [#10844](https://github.com/swagger-api/swagger-ui/pull/10844) into swagger-api/swagger-ui. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*

*See also: [The crash where Swagger UI assumed every request body has content](./2026-07-swagger-ui-request-body-no-content) — my first fix in this repo, where a reader crashed on a missing key; this time the bug was pixels nobody's stylesheet could own.*
