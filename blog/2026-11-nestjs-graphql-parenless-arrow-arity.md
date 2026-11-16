---
title: "x => x + 2 takes zero arguments: the regex that counts function parameters in NestJS GraphQL"
date: 2026-11-16
tags: [nestjs, graphql, javascript, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-11-nestjs-graphql-parenless-arrow-arity
pr: https://github.com/nestjs/graphql/pull/3949
status: published
publishOn: 2026-11-16
---

## Hook

Two functions, identical at runtime:

```typescript
(x) => x + 2
x => x + 2
```

Ask `@nestjs/graphql` how many parameters each one takes and you got two different answers: one, and zero. The utility that counts them — `getNumberOfArguments` — serializes the function with `toString()` and regex-matches the text between the first pair of parentheses. A parenless arrow has no parentheses around its parameter, so the match fails and the count comes back 0.

And the parenless form is not exotic. It's what Prettier writes with `arrowParens: "avoid"`, and it's what minifiers emit for *every* single-parameter arrow in a production bundle — Terser and esbuild strip those two characters on principle. The syntax most likely to reach a deployed server was exactly the syntax the counter had never heard of.

## Why a GraphQL library counts arguments with a regex at all

JavaScript already tells you a function's arity: `fn.length`. But `fn.length` lies by design. It counts parameters only up to the first one with a default initializer, and never counts rest parameters:

```javascript
((a, b) => 0).length        // 2
((a, b = 1) => 0).length    // 1 — the default hides b
((...args) => 0).length     // 0
```

nestjs/graphql needed the honest count, defaults included, for one very specific decision. Depending on your installed `@nestjs/core` version, `ContextIdFactory.getByRequest` has either an old one-parameter signature or a newer two-parameter one — and the second parameter has a default value, so `fn.length` returns 1 *for both versions*. The library couldn't tell the cores apart the native way. So it sniffed the version by reading the function's source text: serialize `getByRequest`, find the `(...)` group, count the commas.

That count steered a real fork in the road. Two arguments meant the modern path: delegate to `ContextIdFactory.getByRequest`, which honors the context-id strategy you register for durable request-scoped providers. Anything else fell into a backward-compatibility branch that minted a context id by hand, bypassing the strategy entirely. A wrong count never threw. It just silently routed every GraphQL request down the legacy branch, and request-scoped behavior quietly stopped matching what you'd configured.

## The confession in the test suite

The repo knew. Sitting in `get-number-of-arguments.util.spec.ts` was this:

```typescript
// This test is skipped because we don't support it yet.
it.skip('should count correctly for arrow functions without parenthesis', () => {
  const leanArrowFunction = x => x + 2;

  expect(getNumberOfArguments(leanArrowFunction)).toBe(1);
});
```

A skipped test is a bug report filed by the maintainers against themselves: reproduced, admitted, and parked. [August's post](./2026-08-vscode-module-script-false-redeclaration) found this kind of fossil in a PR title; this one lived in the suite itself, waiting for someone to make it pass.

One honest wrinkle: by the time I picked this up, the version-sniffing callsite had already been retired along with its compat layer. What remained was the utility, still exported from the package's utils barrel for the next caller to import, still carrying its documented blind spot. Fixing it wasn't firefighting; it was paying down debt the test suite had been openly advertising.

## What I thought the fix was (wrong first, as always)

Delete the regex. Return `fn.length`. Native, zero parsing, can't be wrong about syntax.

The utility's own JSDoc killed that in one line: *"Note this also counts parameters with default initializers (as opposed to checking `function.length`)"*. The regex isn't there because someone didn't know about `fn.length` — it's there because `fn.length` structurally cannot answer the question being asked. My simplification would have reintroduced the exact lie the utility was built to avoid, and the `getByRequest` sniff would have collapsed: both core versions, one answer.

## The fix

[PR #3949](https://github.com/nestjs/graphql/pull/3949), +16/−2. When no parenthesized parameter list matches, look for a bare identifier immediately followed by `=>`, with an optional `async` in front, and return 1:

```diff
+  // Arrow functions with a single parameter can omit the parentheses
+  // (e.g. `x => x + 2` or `async x => x + 2`). Match a bare identifier
+  // immediately followed by `=>`, allowing an optional `async` prefix.
+  const parenlessArrowRegex = /^\s*(?:async\s+)?[a-zA-Z_$][\w$]*\s*=>/;
+  if (parenlessArrowRegex.test(functionAsStringWithoutNewLines)) {
+    return 1;
+  }
+
   return 0;
 }
```

Plus the part I'd argue matters most: the skipped test lost its `.skip`, and an async variant joined it. The suite's confession became its regression guard.

## The takeaway

**`fn.toString()` reflection means you own a JavaScript parser now — one you wrote with a regex and froze on the syntax you remembered that day.** Every form you forgot is a latent miscount: parenless arrows yesterday, and tomorrow whatever the language adds next.

I'll hold myself to the same standard: my fix is one more remembered form, not a parser. Feed the utility `x => add(a, b)` and the paren-matcher still finds `(a, b)` — in the function's *body* — and counts 2. The honest menu has three options: `fn.length`, which is native but lies about defaults and rest; a regex, which lies about whatever syntax you forgot; or a real parser, which is heavy. "How many arguments does this function take" is not one question, and the first step is noticing which version of it you're actually asking.

Screenshot-worthy line: **"Deleting two parentheses made an argument disappear. The runtime knew the arity; the library's text-model of the function didn't."**

That's the same gap [October's post](./2026-10-swagger-ui-dark-mode-color-scheme) walked from the CSS side: two models of one reality, allowed to disagree silently. There it was the page and the browser; here it's the function object and its source text.

## Why this PR is a good first OSS contribution

A skipped test is a pre-scoped contribution. The maintainers already wrote your spec, your reproduction, and your acceptance test — `it.skip` is the repo telling you exactly where help is wanted and how it will be judged. Grep a codebase you use for `it.skip`, `xit`, or `test.todo`, pick one whose intent you understand, and make it pass. Review is fast because the reviewer already agreed the behavior was desirable the day they parked the test.

---

*Written after merging [#3949](https://github.com/nestjs/graphql/pull/3949) into nestjs/graphql. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*

*See also: [Why VS Code said 'Cannot redeclare block-scoped variable' on valid HTML](./2026-08-vscode-module-script-false-redeclaration) — the last time an artifact confessed to a known bug; there it was a PR title, here a skipped test.*
