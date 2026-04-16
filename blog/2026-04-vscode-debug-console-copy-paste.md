---
title: "The bug where VS Code's Debug Console was pasting 'repl:1' into my clipboard"
date: 2026-04-16
tags: [vscode, css, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-04-vscode-debug-console-copy-paste
pr: https://github.com/microsoft/vscode/pull/308925
---

> **Note to self:** personalize the *"What I thought it was"* section before publishing — it's currently generic. Everything else is accurate to the actual PR.

---

A few weeks ago I was debugging a Node.js script in VS Code. A familiar workflow: drop a `console.log`, hit the breakpoint, copy the multi-line output out of the Debug Console, paste it into a Slack message for a teammate.

Except what landed in Slack wasn't my output.

```
hello
repl:1
 there
```

The weird `repl:1` in the middle wasn't my log. It was VS Code's own source annotation — the small grey label it renders next to each Debug Console line pointing at where the log came from. It looks like decoration. Visually, it is. But somehow, it had ended up as text in my clipboard.

That's when I started reading the VS Code source.

## What broke, precisely

VS Code's Debug Console renders each output line inside a tree view (`monaco-tl-contents`). To make the output selectable — which you need, otherwise you couldn't copy any logs — it sets:

```css
.monaco-workbench .repl .repl-tree .monaco-tl-contents {
  user-select: text;
}
```

Fine so far. That gives you the ability to drag-select output text.

But inside that same selectable container, each line also renders a `.source` element — that's the `repl:1` / `file.ts:42` annotation rendered by `SourceWidget`. It lives in the same flex row as the log value:

```
.value-and-source
├── .value          ← your actual log
└── .source         ← "repl:1"
```

Because `user-select: text` on the parent cascades, the browser happily included the `.source` text in any native selection that spanned multiple lines. On copy, the clipboard got the source annotation interleaved with the real output.

## What I thought it was (wrong first, as always)

My first instinct was that this was a bug in VS Code's **copy handler** — that it was pulling innerText from the whole row instead of just the value. I spent an hour stepping through the debug console's `onCopy` / clipboard code looking for a selector that was too broad.

Nothing. The copy handler was fine. It was using `document.getSelection()` — the standard browser API. The problem was upstream of the handler: the **selection itself** already contained the source annotations by the time copy ran.

That reframed the problem. The fix wasn't in JavaScript. It was in CSS.

## The fix

Two lines:

```diff
 .monaco-workbench .repl .repl-tree .expression .source {
     /* Use direction so the source shows elipses on the left */
     direction: rtl;
     max-width: 400px;
+    user-select: none;
+    -webkit-user-select: none;
 }
```

[PR #308925 on microsoft/vscode](https://github.com/microsoft/vscode/pull/308925)

`user-select: none` on a child overrides the `user-select: text` on the ancestor, scoped just to that element. The `.source` annotation is still **visible**, still **clickable** (click it and it navigates to the source line), but it no longer participates in the browser's text selection. Drag across 10 output lines and your clipboard now contains just the logs.

The `-webkit-user-select` prefix is belt-and-suspenders for Electron's Chromium vintage — VS Code targets multiple versions across stable/insiders and the prefixed form stays the safer default in their codebase.

## How to reproduce before/after

```js
// in a running debug session
console.log('hello');
console.log(' there');
```

Before the fix: select both lines in the Debug Console → copy → paste. You get `hello\nrepl:1\n there`.

After the fix: paste gives you exactly `hello\n there`.

## The takeaway

**If a container has `user-select: text`, every descendant is in your selection by default — even the metadata, the decorations, the "it's just a label" stuff.** If you've built a custom widget that renders secondary info inside selectable content, add `user-select: none` to the secondary parts explicitly. The browser won't figure out your intent from the visual hierarchy.

The broader lesson: when a "bug in the copy handler" is actually a "bug in what was selected," stop looking at JavaScript. Look at the CSS cascading through your tree.

## Why this PR is a good first OSS contribution

If you're looking at the VS Code repo and feeling intimidated — this fix was 2 lines. 1 file. No test changes. The hardest part was the reading (finding `.value-and-source`, understanding how `SourceWidget` renders into the REPL tree, confirming `user-select` inheritance was the real story). The writing was trivial.

There are hundreds of bugs like this in every large codebase. The ones that look like runtime bugs but turn out to be CSS cascading. The ones that look like state bugs but turn out to be event ordering. Once you learn to smell them, the patches write themselves.

---

*Written after merging [#308925](https://github.com/microsoft/vscode/pull/308925) into microsoft/vscode. Part of a series on fixes I've shipped to open-source projects — follow along at [yogeshwaran.com](https://yogeshwaran.com).*
