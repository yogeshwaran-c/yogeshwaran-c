---
title: "Why editing a README was rebuilding my entire NestJS project: an inverted chokidar filter"
date: 2026-06-16
tags: [nestjs, chokidar, swc, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-06-nestjs-cli-chokidar-inverted-ignored-filter
pr: https://github.com/nestjs/nest-cli/pull/3346
status: published
publishOn: 2026-06-16
---

## Hook

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

My first instinct was to blame Windows. SWC + watch mode + Node on Windows is exactly the kind of combo where path separator quirks show up, so I assumed chokidar was getting `C:\Users\...\src\README.md`, `path.extname` was choking on a backslash edge case, and every file was slipping past the filter as 'no extension.'

Forty minutes later I had logs proving the path coming into the predicate was clean — proper forward slashes, proper extension. The wire was right. So I logged what the predicate was actually returning instead. `false` for every single file. README.md, .env, .ts, doesn't matter.

That's when I stopped squinting at the line and actually read it. The bug was not in chokidar, and it was not in path handling. It was in two lines of JavaScript I had glanced past four times already.

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

The lesson that travels: when an API option is named for what it excludes — `ignored`, `excluded`, `denied`, `--exclude` — your predicate should evaluate to truthy when you want to *skip* the file. Not 'this matches my filter,' but 'this should be skipped.' The mental flip is small, easy to invert, and TypeScript will not save you because every predicate is `(file) => boolean`. Both polarities type-check.

This is a recurring footgun. chokidar's `ignored`, webpack's `exclude`, jest's `testPathIgnorePatterns`, gitignore syntax, rsync's `--exclude` — all of them are sentences about what *not* to do, and humans are bad at writing 'not' predicates. The rule I'm trying to internalize: before writing any 'should this be kept' filter, read one line of docs to confirm whether `true` means keep or skip. The option's name gives the answer half the time and lies the other half.

Screenshot-worthy line: **"chokidar's `ignored` is a blocklist, not an allowlist. If your predicate looks like an allowlist, it's inverted."**

| API | Means | Common misread |
|---|---|---|
| chokidar `ignored` | files to skip | 'files to watch' |
| webpack `exclude` | files to skip | 'files to bundle' |
| jest `testPathIgnorePatterns` | files to skip | 'files to test' |
| rsync `--exclude` | files to skip | 'files to copy' |

## Why this PR is a good first OSS contribution

The diff is 2 additions, 2 deletions, 1 file. The bug had been sitting in `main` because the failure was silent — no crash, no stack trace, just SWC doing more work than it needed to. Easy to miss in review, easy to miss in production because watch mode is already noisy in the terminal.

The actual work was not the patch. The actual work was reading `watchFilesInOutDir()` right next to `watchFilesInSrcDir()` and noticing the two methods looked almost identical except for the predicate. The sibling already had the right shape. Once I saw that shape mismatch, the fix wrote itself.

If you want to find PRs like this in a project you have never touched: open the project in watch mode, change something it should ignore, and watch what happens. Tail the dev logs while you edit a comment. The bugs that hide are the ones that do not crash.

---

*Written after merging [#3346](https://github.com/nestjs/nest-cli/pull/3346) into nestjs/nest-cli. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*

*See also: [BullMQ was crashing on getRanges() because Python's list.reverse() returns None](./2026-05-bullmq-python-list-reverse-returns-none) — another small fix with a universal lesson about API conventions.*
