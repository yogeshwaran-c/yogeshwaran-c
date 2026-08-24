---
title: "Why VS Code said 'Cannot redeclare block-scoped variable' on valid HTML: every script tag is one virtual file"
date: 2026-08-16
tags: [vscode, typescript, language-server, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-08-vscode-module-script-false-redeclaration
pr: https://github.com/microsoft/vscode/pull/308027
status: published
publishOn: 2026-08-16
---

## Hook

Open a fresh HTML file in VS Code and type this:

```html
<script>let a = 10;</script>
<script type="module">let a = 10;</script>
```

The Problems panel lights up: **Cannot redeclare block-scoped variable 'a'.**

Except there's no redeclaration. Run that page in any browser and it's fine, because a `<script type="module">` gets its own module scope. The classic script's `a` lives in the global scope; the module's `a` lives in the module. Two scopes, two variables, zero conflicts. The browser has worked this way since ES modules shipped in 2017.

The issue ([#229357](https://github.com/microsoft/vscode/issues/229357)) had been open since September 2024. The error was real to the editor and imaginary to the runtime — which is the interesting kind.

## What broke

VS Code's HTML language server doesn't validate your scripts where they sit. It can't — the TypeScript language service that powers JS diagnostics only understands JavaScript files, not HTML with JavaScript sprinkled in. So `embeddedSupport.ts` builds a **virtual JavaScript document**: it takes your entire HTML file and replaces every non-JavaScript character with whitespace.

This input:

```html
<script>let a = 1;</script><script type="module">let a = 2;</script>
```

becomes this virtual document:

```
        let a = 1;                               let a = 2;
```

Same length as the original, character for character. That's the clever part: because only the non-code was blanked out, every surviving character keeps its exact offset, so when TypeScript reports an error at position 57, that position maps straight back to the HTML file. Diagnostics, hover, completions — they all ride on this one whitespace-padded mirror. No source maps needed.

And that's also the bug. One virtual document means one scope. TypeScript reads the mirror as a single script file, sees `let a` twice in the same scope, and reports TS2451 on both. For classic scripts, that's correct — they really do share the global scope, and two classic `let a` declarations really are an error. But the concatenation flattened module scripts into that same shared scope, which is exactly what the browser never does.

## What I thought the fix was (wrong first, as always)

The merged PR's title is a fossil of my first attempt: *"wrap module script content in block scope."* The idea was minimal — keep the single virtual document, but wrap each module script's content in `{ ... }` braces. `let` and `const` are block-scoped, so the braces would isolate them and the false redeclaration disappears. One document, two extra characters per module, done.

It fell apart on two ES facts:

1. **`var` hoists out of blocks.** `{ var a = 2; }` still declares `a` in the enclosing scope. A module with `var a` would keep colliding with a classic script's `a` — and in real module semantics, a module's `var` is scoped to the module, not the global. The braces fixed `let` and lied about `var`.
2. **Module syntax is illegal inside a block.** `import` and `export` declarations must be at the top level of a module. The moment a module script actually did module things — `export const`, `import.meta.url`, top-level `await` — the wrapped version stopped being valid JavaScript, and the fix would have replaced one false error with a stack of new ones.

The block-scope idea was treating the symptom: hide the collision. The real problem was the model: a module isn't a block, it's a different compilation unit. The browser doesn't wrap module scripts in braces — it compiles each one as its own module. The language server had to do the same thing.

## The fix

Three moves, all in the HTML language server ([PR #308027](https://github.com/microsoft/vscode/pull/308027), +134/−18 across four files):

**1. Track which script regions are modules.** The HTML scanner already detected `type="module"` to decide the region's language — but then threw that fact away. Now each embedded region carries an `isModule` flag, matched case-insensitively (`type=module`, `type="Module"`, `type=MODULE` are all modules to the browser, so they're all modules to the scanner):

```diff
- interface EmbeddedRegion { languageId: string | undefined; start: number; end: number; attributeValue?: boolean }
+ interface EmbeddedRegion { languageId: string | undefined; start: number; end: number; attributeValue?: boolean; isModule?: boolean }
```

**2. Build one virtual document per module script, plus one shared document for all classic scripts.** A new `getEmbeddedDocuments` (plural) returns the aggregate document of classic scripts, then a separate whitespace-padded document for each module region, each under a synthetic URI like `file.html.module-0`. Every module document gets one line appended:

```js
result += '\nexport {};';
```

That empty export is the TypeScript idiom for "this file is a module." Any `import` or `export` statement flips a file from script to module — which gives it its own scope, and makes `import.meta` and top-level `await` legal. Two characters of semantics, no runtime behavior.

**3. Validate all documents, merge the diagnostics.** `doValidation` now loops over every virtual document and concatenates the results. Because each module document is still a whitespace-padded mirror of the full HTML file, the offsets still map back with zero translation. And when a file has no module scripts at all, `getEmbeddedDocuments` returns the same single aggregate document as before — the old path, byte for byte.

Everything else — completions, hover, semantic tokens — still uses the shared aggregate document, so cross-script IntelliSense keeps working.

The behavior matrix the tests pin down:

| Where | classic `<script>` × 2 | classic + `<script type="module">` | module × 2 |
|---|---|---|---|
| Browser | collision (shared global scope) | no collision | no collision |
| VS Code before | error reported ✔ | **false error** ✘ | **false error** ✘ |
| VS Code after | error reported ✔ | clean ✔ | clean ✔ |

The first column mattering is easy to miss: two classic scripts declaring the same `let` **should** still error, and the fix keeps that. A lazier patch — say, filtering out diagnostic code 2451 in HTML files — would have thrown away the true positives with the false ones.

## The takeaway

**A language server never analyzes your code — it analyzes a projection of your code, and its diagnostics are statements about the projection.** Most of the time the projection is faithful and you never notice it exists. The bugs live where the projection's shape diverges from the runtime's: here, one concatenated file versus N independent scopes.

Screenshot-worthy line: **"An HTML file with N script tags was validated as one JavaScript file. The browser runs N scopes; the editor read one."**

The same projection pattern is everywhere once you see it: Vue and Svelte single-file components carve template/script/style into virtual documents, markdown code fences get lifted into per-block virtual files for IntelliSense, and embedded SQL-in-string tooling does the same trick. Whenever an editor gives you diagnostics inside a file-in-a-file, there's a virtual document underneath — and a set of assumptions about scope, module-ness, and boundaries that someone had to get right by hand.

And the whitespace-substitution trick is worth stealing for anything you build: **pad, don't extract.** If the projection preserves every offset, position mapping is the identity function — no source maps, no off-by-N drift, no range translation bugs. VS Code's HTML server gets bidirectional diagnostics mapping for free from a `substituteWithWhitespace` loop.

## Why this PR is a good first OSS contribution

The repro is two lines of HTML. The mechanism lives in essentially one readable file (`embeddedSupport.ts` — about 200 lines, no dependencies beyond the HTML scanner). And the bug had sat in the open issue queue for almost two years, not because it was hard, but because the obvious fixes were wrong in ways you only hit once you try them: suppress the diagnostic (kills true positives), wrap in braces (breaks `var` and module syntax), spin up a full second language service configuration (overkill). The eventual shape — model the scopes the browser actually creates — only falls out once you stop asking "how do I hide this error" and start asking "what does the runtime actually do."

The tests were the real deliverable. Diagnostic-level assertions now pin the whole behavior matrix: classic/module isolation, module/module isolation, `var` hoisting, real redeclarations still reported, `import.meta` and top-level `await` accepted, and error ranges mapping back to the right HTML lines. The next person to touch script handling inherits an executable spec of how scoping is supposed to work.

If you're hunting for a contribution like this: look for issues where the editor and the runtime disagree. The runtime is always right. The distance between them is a projection bug, and projection bugs come with a built-in repro (the runtime), a built-in spec (also the runtime), and a maintainer who already agrees the behavior is wrong.

---

*Written after merging [#308027](https://github.com/microsoft/vscode/pull/308027) into microsoft/vscode. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*

*See also: [The bug where VS Code's Debug Console was pasting 'repl:1' into my clipboard](./2026-04-vscode-debug-console-copy-paste) — my first VS Code fix, where the editor was also technically doing exactly what it was told.*
