---
title: "One schema, every mimetype: the shared-reference bug in NestJS Swagger's content wrapper"
date: 2026-09-16
tags: [nestjs, openapi, javascript, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-09-nestjs-swagger-shared-mimetype-references
pr: https://github.com/nestjs/swagger/pull/3945
status: outline
publishOn: 2026-09-16
---

> **Status: outline.** Buffer draft per BLOG_DISCIPLINE rule #4. Flesh out in early September.

## Hook (to write)

`MimetypeContentWrapper#wrap` builds the OpenAPI `content` object by mapping each media type to the same object reference. Declare a response with `@ApiProduces('application/json', 'application/xml')` and both entries in `content` are literally the same object:

```ts
const { content } = new MimetypeContentWrapper().wrap(
  ['application/json', 'application/xml'],
  { schema: { type: 'string' } }
);

content['application/json'] === content['application/xml']; // true (bug)
content['application/json'].schema.type = 'mutated';
content['application/xml'].schema.type; // 'mutated' (leaked)
```

Two consequences: aliased entries (mutate one media type's schema, all change), and source mutation (`removeUndefinedKeys` strips keys from the caller's original object in place).

## Beats

- **What broke:** one object instance fanned out across N mimetypes; `removeUndefinedKeys` mutates in place, so it also chews the caller's source object.
- **Wrong first guess:** TBD — reconstruct from the debugging session (spooky action at a distance: editing the JSON schema decorator seemed to change the XML variant; where did I look first?).
- **The fix:** `cloneDeep` per media type (lodash, already the house style in nestjs/swagger). +6/−1 in `lib/services/mimetype-content-wrapper.ts` plus a new spec file.
- **The takeaway:** `Object.fromEntries(types.map(t => [t, obj]))`-style fan-out is an aliasing machine. If a factory returns the same reference under N keys, every later mutation is a broadcast. Contrast: share-by-default (JS references) vs copy-on-write (Immutable.js — nice callback to the July post).
- **Tests as spec:** distinct-references assertion and caller-not-mutated assertion both fail before the fix — the two invariants the original code never stated.
- **Cross-link:** July's swagger-ui post (same OpenAPI territory, opposite failure: there a missing key crashed a reader; here a shared reference corrupted writers). Also the August VS Code post for the 'model what the runtime does' theme if it fits.
- **Screenshot-worthy line candidate:** "If a factory returns the same object under N keys, every later mutation is a broadcast."

## Sign-off (template)

*Written after merging [#3945](https://github.com/nestjs/swagger/pull/3945) into nestjs/swagger. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*
