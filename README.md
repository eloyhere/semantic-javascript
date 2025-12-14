# semantic-javascript

A modern, lazy, chainable JavaScript stream library with true semantic ordering, built-in statistical operations, tumbling/sliding windows, and optional parallel processing.

Inspired by Java Streams and the author's own semantic-cpp, semantic-js brings a powerful, functional-style data processing pipeline to JavaScript – all in a lightweight, dependency-free package.

## Why semantic-javascript?

Most JavaScript iteration libraries focus on simple mapping and filtering. semantic-js goes further by providing:

- **True semantic ordering** – explicit `toOrdered()` for sequence-sensitive operations (e.g., `findFirst`, `sorted`) and default unordered mode for better performance.
- **Built-in statistics** – mean, median, mode, variance, standard deviation, skewness, kurtosis, quartiles, and more – directly on streams.
- **First-class windowing** – tumbling and sliding windows with aggregation, mapping, filtering, and more.
- **Lazy evaluation** – operations are chained without immediate execution until a terminal operation is called.
- **Parallel support** – configure concurrency with `.parallel(n)` and gets promise according to Promise.all.

No dependencies. Works in browsers and Node.js.

## Installation

```bash
npm install semantic-javascript
```

```js
import { Generative, Semantic } from 'semantic-javascript';
// or
const { Generative, Semantic } = require('semantic-javascript');
```

## Quick Start

```js
const result = new Generative()
  .from([1, 2, 3, 4, 5, 6, 7, 8])
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .toList();

console.log(result); // [4, 16, 36, 64]
```

## Core API

### Stream Creation (Generative)

- `new Generative().empty()` – empty stream
- `new Generative().of(...elements)` – from varargs
- `new Generative().from(iterable)` – from array, Set, Map, generator, etc.
- `new Generative().fill(value | supplier, count)` – repeat value or supplier result
- `new Generative().range(start, end, step = 1)` – numeric range (inclusive start, exclusive end)

### Intermediate Operations (Semantic)

- `.map(mapper)`
- `.filter(predicate)`
- `.flatMap(mapper)`
- `.distinct([identifier])`
- `.limit(n)`
- `.skip(n)`
- `.sub(start, end)`
- `.takeWhile(predicate)`
- `.dropWhile(predicate)`
- `.peek(consumer)`
- `.concat(other)`
- `.parallel(concurrency)` – set concurrency level (used in future terminal parallel execution)

### Type Conversions

- `.toOrdered()` – switch to ordered mode (preserves insertion order for reliable `findFirst`, `sorted`, etc.)
- `.toUnordered()` – explicit unordered (default behaviour)
- `.toStatistics([mapper])` – enable statistical operations
- `.toWindow()` – enable window operations

### Terminal Operations (Collectable)

- `.toList()` / `.toVector()`
- `.toSet()` / `.toUnorderedSet()`
- `.toMap(keyExtractor, valueExtractor)`
- `.group(classifier)`
- `.groupBy(keyExtractor, valueExtractor)`
- `.join([delimiter, prefix, suffix])`
- `.count()`
- `.anyMatch(predicate)`
- `.allMatch(predicate)`
- `.noneMatch(predicate)`
- `.findFirst()` / `.findAny()` – returns Optional
- `.forEach(consumer)`
- `.reduce(identity, accumulator)` or `.reduce(accumulator)` (no identity → Optional)
- `.collect(collector)` or `.collect(supplier, accumulator, combiner, [interrupter], [finisher])`
- `.cout([formatter])` – console output (useful for debugging)
- `.partition(count)`
- `.partitionBy(classifier)`

### Ordered Operations (OrderedCollectable)

- `.sorted([comparator])`
- `.reverse()`
- `.shuffle([random])`

### Statistics (Statistics)

- `.count()`
- `.sum()`
- `.mean()`
- `.median()`
- `.mode()`
- `.minimum([comparator])`
- `.maximum([comparator])`
- `.variance()`
- `.standardDeviation()`
- `.range()`
- `.quartiles()`
- `.interquartileRange()`
- `.skewness()`
- `.kurtosis()`
- `.frequency()`

### Windowing (WindowCollectable)

- `.getSlidingWindows(size, step)`
- `.getTumblingWindows(size)`
- `.slide(size, step)`
- `.tumble(size)`
- `.mapWindows(size, step, mapper)`
- `.mapTumblingWindows(size, mapper)`
- `.slideAggregate(size, step, aggregator)`
- `.tumbleAggregate(size, aggregator)`
- `.filterWindows(size, step, predicate)`
- `.windowCount(size, step)`
- `.firstWindow(size, step)`, `.lastWindow(size, step)`
- `.anyWindow / allWindows / noneWindow(size, step, predicate)`
- `.skipWindows / limitWindows / subWindows`
- `.partitionWindows / groupWindows`

### Optional

Java-style Optional with:
- `Optional.of(value)`
- `Optional.ofNullable(value)`
- `Optional.empty()`
- `.isPresent()`, `.get()`, `.orElse()`, `.orElseGet()`, `.orElseThrow()`, `.map()`, `.flatMap()`, `.filter()`, `.ifPresent()`

### Collector

Custom collectors similar to Java:
- `Collector.of(supplier, accumulator, combiner, [interrupter], [finisher])`

## Examples

### Basic Stream

```js
new Generative()
  .from(['apple', 'banana', 'cherry', 'date'])
  .filter(s => s.startsWith('a'))
  .map(s => s.toUpperCase())
  .toUnordered()
  .toList();
// → ['APPLE']
```

### Statistics

```js
const stats = new Generative()
  .range(1, 11)
  .toStatistics();

console.log(stats.mean());        // 5.5
console.log(stats.median());      // 5.5
console.log(stats.standardDeviation()); // ≈3.0277
console.log(stats.skewness());    // 0
```

### Windowing

```js
const windows = new Generative()
  .from([1, 2, 3, 4, 5, 6, 7, 8])
  .toWindow()
  .getSlidingWindows(3, 2);
// → [[1,2,3], [3,4,5], [5,6,7]]
```

### Custom Collector

```js
const map = new Generative()
  .from(['a', 'bb', 'ccc'])
  .collect(
    () => new Map(),
    (acc, str) => acc.set(str[0], (acc.get(str[0]) || 0) + 1),
    (a, b) => {
      for (const [k, v] of b) a.set(k, (a.get(k) || 0) + v);
      return a;
    }
  );
// → Map { 'a' => 1, 'b' => 1, 'c' => 1 }
```

## Comparison with Competitors

| Feature                          | lodash / fp | RxJS       | underscore | ixjs       | semantic-js                          |
|----------------------------------|-------------|------------|------------|------------|--------------------------------------|
| Lazy evaluation                  | Partial     | Yes        | No         | Yes        | Yes                                  |
| Chainable API                    | Yes         | Yes        | Yes        | Yes        | Yes                                  |
| True semantic ordering           | No          | No         | No         | No         | Yes (explicit ordered/unordered)     |
| Built-in statistics              | No          | No         | No         | No         | Yes (full suite)                     |
| Tumbling/sliding windows         | No          | Partial    | No         | Partial    | Yes (first-class, rich API)          |
| Parallel processing              | No          | Yes        | No         | No         | Yes (configurable)                   |
| Dependency-free                  | Yes         | No         | Yes        | No         | Yes                                  |
| Optional & Collector utilities   | No          | No         | No         | No         | Yes                                  |

semantic-js stands out by combining powerful statistical and windowing capabilities with strict semantic ordering – all in a lightweight package.

## Licence

MIT Licence

---

Enjoy functional stream processing in JavaScript – the semantic way! 🚀

Star the repo if you find it useful, and feel free to open issues or contribute.
