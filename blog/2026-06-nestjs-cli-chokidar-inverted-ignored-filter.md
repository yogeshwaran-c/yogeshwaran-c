---
title: "Why editing a README was rebuilding my entire NestJS project: an inverted chokidar filter"
date: 2026-06-16
tags: [nestjs, chokidar, swc, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-06-nestjs-cli-chokidar-inverted-ignored-filter
pr: https://github.com/nestjs/nest-cli/pull/3346
status: draft
publishOn: 2026-06-16
---

> Working draft. Outline only. Expand to full post before June 16.

## Hook (1 paragraph)

Scenario: working on a NestJS service in watch mode (`nest start --watch --builder swc`). Every time I edited the README, or touched a `.env`, or saved a config file, the SWC compiler kicked off a full TypeScript rebuild. Files chokidar should have ignored were waking up the compiler.

The clue: the rebuild wasn't filtered by extension at all. Anything in `src/` triggered it.

## What broke

`watchFilesInSrcDir()` in `SwcCompiler` (lib/compiler/swc/swc-compiler.ts) had a chokidar `ignored` predicate that was supposed to ignore everything that wasn't a `.ts` or `.js` file. It did the opposite. Two layered bugs in one expression.

The original code, paraphrased:

```ts
ignored: (file) => extensions.includes(path.extname(file).slice(1)),
```

Two things wrong:

1. **Extension format mismatch.** `extensions` from `swcDefaultsFactory` was `['.js', '.ts']` (with dots). `path.extname(file).slice(1)` returns `'ts'` (no dot). So `.includes()` was always `false`. The predicate returned `false` for every file.

2. **Inverted predicate.** Even if the strings had matched, the boolean was wrong. chokidar's `ignored` option takes a function that returns `true` to **ignore** a file. The code as written said 'ignore files that match my source extensions' which is the exact opposite of intent.

Net effect: predicate always returns `false` (because of bug #1), so chokidar treats everything as 'do not ignore', and the watcher fires on every file in `src/`. Touch a README in the source tree, SWC starts recompiling.

The sibling method `watchFilesInOutDir()` had the correct shape already:

```ts
ignored: (file) => !extensions.some(ext => file.endsWith(ext)),
```

That one negates. That one uses `endsWith` so dot/no-dot does not matter.

## What I thought it was (wrong first, as always)

[ Fill in: my first guess was that chokidar was misbehaving on Windows because of path separators. Spent some time on that. Was wrong. The wire was right; the predicate was wrong. ]

## The fix

```diff
- ignored: (file) => extensions.includes(path.extname(file).slice(1)),
+ ignored: (file) => !extensions.some((ext) => file.endsWith(ext)),
```

[PR #3346 on nestjs/nest-cli](https://github.com/nestjs/nest-cli/pull/3346)

Two characters of difference between 'kind of broken' and 'completely inverted': the leading `!` and the switch from `.includes` to `.some(... endsWith)`. Three things happen in those two lines:

- `endsWith(ext)` works whether `ext` starts with `.` or not, killing the format-mismatch bug.
- `.some()` short-circuits on the first matching extension.
- `!` flips the predicate so 'has source extension' → 'do not ignore'.

## The takeaway

[ Fill in: chokidar's `ignored` API has a famously confusing semantic, the option name reads like an allowlist but it's a blocklist. The general lesson is to check whether your predicate's polarity matches the API's polarity, especially when the option name is a noun like `ignored`, `excluded`, `denied`, `blocked`. The same trap exists in webpack's `exclude`, jest's `testPathIgnorePatterns`, gitignore syntax, and rsync's `--exclude`. ]

Screenshot-worthy line: **"chokidar's `ignored` is a blocklist, not an allowlist. If your predicate looks like an allowlist, it's inverted."**

| API | Means | Common misread |
|---|---|---|
| chokidar `ignored` | files to skip | 'files to watch' |
| webpack `exclude` | files to skip | 'files to bundle' |
| jest `testPathIgnorePatterns` | files to skip | 'files to test' |
| rsync `--exclude` | files to skip | 'files to copy' |

## Why this PR is a good first OSS contribution

[ Fill in: 2 additions, 2 deletions, 1 file. The bug had been live in `main` because the predicate failed silently, files just got recompiled more than necessary, nothing crashed. Easy to miss in review. The hard work was reading the sibling method and noticing the shape was different. ]

---

*Written after merging [#3346](https://github.com/nestjs/nest-cli/pull/3346) into nestjs/nest-cli. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*

*See also: [BullMQ was crashing on getRanges() because Python's list.reverse() returns None](./2026-05-bullmq-python-list-reverse-returns-none) — another small fix with a universal lesson about API conventions.*
