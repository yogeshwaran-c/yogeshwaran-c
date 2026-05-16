---
title: "BullMQ was crashing on getRanges() because Python's list.reverse() returns None"
date: 2026-05-16
tags: [bullmq, python, debugging, open-source]
canonical: https://yogeshwaran.com/blog/2026-05-bullmq-python-list-reverse-returns-none
pr: https://github.com/taskforcesh/bullmq/pull/4022
status: published
---

A few weeks ago I was reading through the Python port of BullMQ — a Redis-backed job queue I've now sent 26 merged PRs to. I was tracing a `getRanges` call to understand how the workers paginate results, and I hit something that didn't make sense.

A line that should have been one of the most boring lines in the file:

```python
results += result.reverse()
```

That doesn't work. And once you see *why* it doesn't work, you'll never write it again.

## What broke

`getRanges()` is a helper that fetches a slice of jobs from a Redis list. When the request asks for ascending order on an `lrange` command, the result has to be reversed before being concatenated.

The old code was:

```python
if asc and commands[i] == "lrange":
    results += result.reverse()
else:
    results += result
```

Looks fine on the first read. It even *passes* on most code paths because the `if` branch is rarely hit in practice. But every time `asc=True` AND the command is `lrange`, you get:

```
TypeError: unsupported operand type(s) for +=: 'list' and 'NoneType'
```

A piece of production-running code that was a `TypeError` waiting to be tickled.

## What I thought it was (wrong first, as always)

My first instinct was to assume it was a Redis wire-format issue — that `result` was sometimes coming back as `None` when the underlying `lrange` returned an empty list. I added a print statement, ran the failing test, and saw `result` was `[Job1, Job2, Job3]` — not None. So `result` itself was fine.

That ruled out the Redis side. The problem had to be local to this line.

## The real cause

Python's list mutator methods follow a convention: **they mutate in place and return None.**

```python
>>> [1, 2, 3].reverse()
>>> # nothing prints — return value is None
>>> x = [1, 2, 3]
>>> y = x.reverse()
>>> print(y)
None
>>> print(x)
[3, 2, 1]
```

`list.reverse()`, `list.sort()`, `list.append()`, `list.extend()` — none of them return the list. They return `None`. The mutation happens to `self`.

So `results += result.reverse()` is really `results += None`, which Python rejects with the TypeError above.

## The fix

Two characters of difference, fundamentally different semantics:

```diff
 if asc and commands[i] == "lrange":
-    results += result.reverse()
+    results += result[::-1]
 else:
     results += result
```

[PR #4022 on taskforcesh/bullmq](https://github.com/taskforcesh/bullmq/pull/4022)

`result[::-1]` is **slice reversal**. It doesn't mutate `result` — it returns a brand-new reversed list. That list can be concatenated with `+=`, and the original `result` stays untouched (which we don't care about here, but it's safer in general).

If you wanted to actually use `reverse()`, you'd write:

```python
result.reverse()
results += result
```

Two statements. Mutation explicit. Return value not relied on.

## The takeaway

**Python distinguishes mutating methods from returning ones, and the convention is consistent: mutating methods return `None`.** If you reach for `.reverse()`, `.sort()`, `.append()`, `.extend()`, or `.shuffle()` in an expression, the expression is `None`, not the result you wanted.

When you want a reversed/sorted *value*, use the non-mutating form:

| Want a value | Use |
|---|---|
| Reversed list | `lst[::-1]` or `list(reversed(lst))` |
| Sorted list | `sorted(lst)` |
| Appended list | `lst + [item]` or `[*lst, item]` |
| Extended list | `lst + other` or `[*lst, *other]` |

The broader lesson — every language has these "looks-fine-until-it-doesn't" lines. JavaScript's `Array.prototype.reverse()` mutates. Java's `Collections.reverse()` mutates. Ruby's `Array#reverse!` is a different method from `Array#reverse`. Once you learn the pattern, you read the code differently.

## Why this PR is a good first OSS contribution

This was a 1-line fix in a file most people never look at. No tests changed (the existing test suite would have caught it once that branch was triggered, but the conditions to trigger it were narrow enough that it had survived in `main`). The hardest part was *finding* the bug while reading unrelated code — not fixing it.

There are dozens of bugs like this in every codebase you use daily. The patches are easy. The reading is the work.

---

*Written after merging [#4022](https://github.com/taskforcesh/bullmq/pull/4022) into taskforcesh/bullmq. Part of an ongoing series on fixes I've shipped to open-source projects — follow at [yogeshwaran.com](https://yogeshwaran.com).*

*See also: [The bug where VS Code's Debug Console was pasting 'repl:1' into my clipboard](./2026-04-vscode-debug-console-copy-paste) — another tiny fix with a wide-applicable lesson.*
