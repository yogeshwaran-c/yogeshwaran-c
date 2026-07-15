---
title: "Why Swagger UI was crashing on a valid OpenAPI spec: an unguarded .getIn() chain"
date: 2026-07-16
tags: [swagger-ui, openapi, immutable-js, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-07-swagger-ui-request-body-no-content
pr: https://github.com/swagger-api/swagger-ui/pull/10837
status: published
publishOn: 2026-07-16
---

## Hook

A user opened an issue against Swagger UI: their auto-generated OpenAPI 3.0 spec was blowing up in the browser with

    TypeError: Cannot read properties of undefined (reading 'entrySeq')

The spec passed validation. It rendered fine in other tools. Their Java codegen was producing something like this on a `GET /catalog/regions` operation:

```json
"requestBody": {
  "description": "",
  "required": false
}
```

No `content` field. Weird for a GET — a GET operation shouldn't have a requestBody at all — but OpenAPI 3.0 doesn't actually require `content` on the requestBody object. It's optional. So the spec was legal, swagger-ui downloaded it, tried to render the operation, and crashed hard on that stack trace.

## What broke

`getOAS3RequiredRequestBodyContentType` in `src/core/plugins/spec/selectors.js` computes the required-content-type map for a requestBody. It reached into the Immutable.js state like this:

```js
requestBody.getIn(["content"]).entrySeq().forEach((contentType) => {
  // ...
})
```

Two-and-a-half assumptions in one line:

1. `requestBody` is a Map (fine — `resolvedSubtrees` normalizes it that way).
2. `requestBody.getIn(["content"])` returns a Map (assumed, never checked).
3. That Map has entries worth iterating over.

Assumption 2 was the load-bearing one. Immutable.js `getIn(path)` returns `undefined` when any segment of the path is missing — that's the documented contract. So the moment the spec landed a requestBody without `content`, `.getIn(["content"])` returned `undefined`, `.entrySeq()` got called on `undefined`, and JavaScript threw the exception the reporter saw in their console.

## What I thought it was (wrong first, as always)

My first theory was that something upstream was corrupting the field. Swagger UI has a chain of transforms — spec fetched, parsed, resolved, normalized, then put into Redux state — and any one of those layers could plausibly drop a `content` key it decided was 'incomplete.' So I went upstream. I logged the raw spec on fetch. I logged what came out of the OAS3 resolver. I logged the Immutable Map that eventually landed in `resolvedSubtrees`.

The requestBody was in there verbatim, exactly as the user's codegen had emitted it. Description, required, no content. Nothing was stripping anything. The 'incomplete' requestBody was the input all along, and every layer had faithfully passed it through.

Only then did I actually read the selector line by line. `.getIn(["content"]).entrySeq()`. It assumed content existed. It never asked.

Fifty minutes on the wrong question. The wire was fine. The consumer was wrong.

## The fix

```diff
- requestBody.getIn(["content"]).entrySeq().forEach((contentType) => {
+ const requestBodyContent = requestBody.getIn(["content"])
+ if (!requestBodyContent) {
+   return requiredObj
+ }
+ requestBodyContent.entrySeq().forEach((contentType) => {
```

[PR #10837 on swagger-api/swagger-ui](https://github.com/swagger-api/swagger-ui/pull/10837)

Five lines. Pull the intermediate into a variable, null-check it, return the partial result if it's missing. `requiredObj` had already collected `requestBody: requestBody.getIn(["required"])` on a prior line, so the early return isn't a silent drop — the caller still gets the required flag, just without a content-type map. That matches the semantics: no content means no content-types to require.

## The takeaway

Immutable.js `.getIn(path)` returns `undefined` when any segment of `path` doesn't exist. Every method chained after that call inherits the `undefined`. It's the same footgun as chained property access on a plain object, except optional chaining (`?.`) doesn't help you here — you're inside a fluent API where each call returns a new value, not a member access.

TypeScript won't save you either. Immutable.js types `getIn` loosely — the path is a runtime string array, and the compiler can't tell whether the key you asked for exists. So `.getIn(["content"]).entrySeq()` type-checks whether `content` exists in the input Map or not.

The rule I'm trying to internalize: **any time your code walks into a schema-optional field, the reader of that field is responsible for the missing case.** Not the schema, not the validation layer, not whoever produced the data. The reader. The spec is honest about what's optional; the code often isn't.

Screenshot-worthy line: **"`.getIn([...])` returns `undefined` for a missing path. Every method chained after it inherits the `undefined`."**

A quick contrast of how 'missing' behaves across the common access patterns:

| Access | Missing key returns | Chained method behavior |
|---|---|---|
| `obj.a.b` | throws | throws on the missing hop |
| `obj?.a?.b` | `undefined` | short-circuits the chain |
| `_.get(obj, 'a.b')` (lodash) | `undefined` | must be null-checked before next call |
| `map.getIn(['a', 'b'])` (Immutable.js) | `undefined` | must be null-checked before next call |

The bottom two rows are the same footgun with different libraries. Both hand you a raw `undefined` and put the responsibility for the missing case on you.

## Why this PR is a good first OSS contribution

The diff is five lines of source plus a handful of unit tests. The crash was reproducible from a three-line minimal spec: a GET with a requestBody containing only `description` and `required`. Once you had the minimum repro, the stack trace pointed straight at the selector, and the fix pattern (`const x = getIn(...); if (!x) return; x.method()`) already exists throughout swagger-ui's codebase — it's the house style. Match the house style and the PR reviews itself.

The reason it lived in `main` for years: nobody who wrote a valid-but-unusual spec had reported it until this issue came in. Most OpenAPI specs in the wild follow the 'obvious' shape — GET has no body, POST body has content, done. Codegens occasionally produce the corners nobody writes by hand, and this was one of those corners.

The actual work wasn't the patch. The actual work was: read the issue, resist the instinct to blame the codegen ('Java tools emit weird specs sometimes'), reproduce the crash locally with a minimum spec, and read the surrounding selectors to see how they guarded the same pattern. The guard was already the convention. It was just missing on this one line.

If you want to find PRs like this in a codebase you've never touched: reproduce the reporter's failure locally, then read the three functions above and below the crash site. The house style is right there, and the missing guard is usually right there with it.

---

*Written after merging [#10837](https://github.com/swagger-api/swagger-ui/pull/10837) into swagger-api/swagger-ui. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*

*See also: [Why editing a README was rebuilding my entire NestJS project](./2026-06-nestjs-cli-chokidar-inverted-ignored-filter) — another small fix where reading the sibling function was 90% of the work.*
