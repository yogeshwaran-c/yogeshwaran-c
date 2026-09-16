---
title: "One schema, every mimetype: the shared-reference bug in NestJS Swagger's content wrapper"
date: 2026-09-16
tags: [nestjs, openapi, javascript, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-09-nestjs-swagger-shared-mimetype-references
pr: https://github.com/nestjs/swagger/pull/3945
status: published
publishOn: 2026-09-16
---

## Hook

NestJS Swagger has a tiny helper called `MimetypeContentWrapper`. Its whole job is to take a schema and fan it out across the media types you declared, producing the `content` object that ends up in your OpenAPI document:

```typescript
const { content } = new MimetypeContentWrapper().wrap(
  ['application/json', 'application/xml'],
  { schema: { type: 'string' } }
);

content['application/json'] === content['application/xml']; // true
```

That last line is the bug. Not `deepEqual` — triple-equals. Declare a response for two media types and both entries in `content` are *literally the same object*. Which means:

```typescript
content['application/json'].schema.type = 'number';
content['application/xml'].schema.type; // 'number' — it changed too
```

Touch the JSON variant, the XML variant changes. Touch either, and — it gets better — your original input object changes, because the helper also mutates its argument in place. One schema, every mimetype, and every later write is a broadcast.

## What broke

The whole helper is about six lines ([`lib/services/mimetype-content-wrapper.ts`](https://github.com/nestjs/swagger/pull/3945/files)):

```typescript
export class MimetypeContentWrapper {
  wrap(mimetype: string[], obj: Record<string, any>) {
    const content = mimetype.reduce(
      (acc, item) => ({ ...acc, [item]: removeUndefinedKeys(obj) }),
      {}
    );
    return { content };
  }
}
```

The `reduce` looks like it's building N entries — and it is. N *keys*. But `removeUndefinedKeys(obj)` cleans `obj` **in place and returns it**, so every key gets the same reference. The spread on `acc` copies the accumulator's shape, not the values sitting behind it. The result is an object that prints exactly like the one you meant to build, and shares everything.

Two distinct failures fall out of one line:

1. **Aliased entries.** Anything downstream that customizes one media type's schema — a plugin, a document post-processor, your own `SwaggerModule.createDocument` post-hook — silently edits all of them. The classic symptom: you tweak the JSON schema and the XML entry in the served `/api-json` document changes with it.
2. **Source mutation.** `removeUndefinedKeys` strips keys from the *caller's* object. Decorator metadata in NestJS is long-lived — it's attached to the class and read on every document build. A factory that hands the same metadata object to two routes, or builds the document twice, is feeding an input that the previous run already chewed on.

## What I thought the fix was (wrong first, as always)

The symptom I chased was the broadcast: a document post-processor adjusted `content['application/json'].schema`, and the XML entry came out adjusted too. My first model of the bug was *"the builder is constructing the XML entry from the wrong source"* — some ordering problem downstream, where the last edit wins because entries get rebuilt from shared inputs. So I read the document builder looking for where the XML entry was constructed, expecting to find it copying from the JSON entry.

There was nothing to find, because nothing was being constructed. I logged both entries and they looked identical — *well, of course they do, they're built from the same schema.* That thought is exactly where the wrong model hides: "two copies that look alike" and "one object under two keys" print the same. The check that ends the hunt is two characters and I ran it embarrassingly late:

```javascript
content['application/json'] === content['application/xml']; // true. Oh.
```

Identity, not equality. Once you see `true` there, the mystery collapses: there is no ordering bug, no wrong-source copy, no downstream writer. There's one object, and everyone who thinks they own a copy owns the original.

## The fix

Clone per media type, so each key gets its own object — and the caller's input is never the thing being cleaned ([PR #3945](https://github.com/nestjs/swagger/pull/3945), +6/−1 plus a new spec file):

```diff
-      (acc, item) => ({ ...acc, [item]: removeUndefinedKeys(obj) }),
+      (acc, item) => ({ ...acc, [item]: removeUndefinedKeys(cloneDeep(obj)) }),
```

`cloneDeep` was already house style in the codebase, so the fix is genuinely one expression. The interesting part is the spec file, because the original code had two invariants that were never written down anywhere:

- **Entries are independent.** `content['application/json']` and `content['application/xml']` must not be the same reference, and mutating one must not change the other.
- **The input is not modified.** After `wrap()`, the caller's object still deep-equals what they passed in — `removeUndefinedKeys` now chews on a clone, not the source.

Both assertions fail against the old implementation and pass against the new one. That's the real deliverable: the next person to "optimize away that clone" gets stopped by a failing test that states the rule, instead of shipping the aliasing bug back in.

## The takeaway

**If a factory returns the same object under N keys, every later mutation is a broadcast.**

The `reduce`-with-spread fan-out is an aliasing machine, and it's everywhere in JavaScript:

```javascript
Object.fromEntries(types.map(t => [t, defaults]))   // N keys, 1 object
new Array(3).fill({ count: 0 })                     // 3 slots, 1 object
```

JavaScript shares by default — assignment, spread, `fill`, `map` all move references, never values. That's the right default for performance and usually what you want. It goes wrong at exactly one kind of boundary: when a function *returns* structures it built from shared pieces, because the caller reasonably assumes they received their own data. At that boundary you either clone, freeze, or document — and silently sharing is the one option that looks like all the others until someone writes to it.

The debugging lesson compresses even smaller: when two things change together, check `===` before you build any theory involving two things. Spooky action at a distance is almost never spooky — it's usually one object wearing two names.

## Why this PR is a good first OSS contribution

The repro is five lines with no HTTP server, no decorators, no NestJS app — instantiate the class, call `wrap`, compare with `===`. The fix is one expression in a six-line file. And yet it's a real bug that corrupted real OpenAPI documents for anyone doing multi-mimetype responses with any post-processing at all.

What makes it worth writing about is the shape: the hard part wasn't the diff, it was naming the invariants the original author never stated. A one-line fix plus a spec that pins "entries are independent" and "inputs are not mutated" is a bigger contribution than a fifty-line fix without them. If you're hunting for a first contribution, look for tiny utility classes in big frameworks — they're small enough to fully understand in an afternoon, old enough to have unstated assumptions, and central enough that fixing one line fixes everyone's documents.

---

*Written after merging [#3945](https://github.com/nestjs/swagger/pull/3945) into nestjs/swagger. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*

*See also: [The crash where Swagger UI assumed every request body has content](./2026-07-swagger-ui-request-body-no-content) — same OpenAPI territory, opposite failure: there a missing key crashed a reader; here a shared reference corrupted writers.*
