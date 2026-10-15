---
title: "Deleting two parentheses changed my schema: counting function arguments with a regex in NestJS GraphQL"
date: 2026-11-16
tags: [nestjs, graphql, javascript, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-11-nestjs-graphql-parenless-arrow-arity
pr: https://github.com/nestjs/graphql/pull/3949
status: outline
publishOn: 2026-11-16
---

> **Status: outline.** Buffer draft per BLOG_DISCIPLINE rule #4. Flesh out in early November.

## Hook (to write)

Two functions, same behavior at runtime:

```typescript
(x) => x + 2
x => x + 2
```

To nestjs/graphql, the first had one argument and the second had zero. `getNumberOfArguments` serializes the function with `toString()` and regex-matches the text between the first pair of parentheses — and a parenless arrow has no parentheses to match, so the utility returned 0.

## Beats

- **What broke:** arity detection by string inspection. The regex only inspected `(...)` content; `x => x + 2` and `async x => x + 2` fell through to 0. TBD: trace exactly which decision `getNumberOfArguments` feeds and what a user sees when the count is wrong (where did the miscount surface — which error/behavior?). Don't publish without pinning this.
- **The fossil:** the repo carried a *skipped* regression test for exactly this case — the bug was known, admitted in the test suite, and parked. Unskipping it was part of the fix (same artifact-as-confession beat as August's PR-title fossil).
- **Wrong first guess (TBD — reconstruct from memory):** candidate arc — assumed the schema/decorator metadata was wrong, or that TS was compiling the arrow differently; the real thread starts when you diff the two functions' `toString()` output.
- **The fix:** +16/−2 in the utility: when no parenthesized parameter list matches, look for a bare identifier immediately followed by `=>` (optionally preceded by `async`) and return 1. Unskip the regression test, add the async variant.
- **The takeaway:** `fn.toString()` reflection means you own a JavaScript parser now — one you wrote with a regex and froze on the syntax you remembered that day. Every form you forgot (parenless arrows, async, defaults, destructuring, rest) is a latent miscount. JS gives you `fn.length` for free but it has its own rules (stops at the first default/rest param) — the real lesson is that "how many arguments does this function take" is not one question.
- **Cross-link:** August's post (artifact-as-confession: PR-title fossil there, skipped test here). October's model-gap theme also echoes: the runtime knew the arity; the library's text-model of the function didn't.
- **Screenshot-worthy line candidate:** "Deleting two parentheses changed my schema. The library was counting my arguments with a regex."

## Sign-off (template)

*Written after merging [#3949](https://github.com/nestjs/graphql/pull/3949) into nestjs/graphql. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*
