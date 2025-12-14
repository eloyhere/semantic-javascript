# semantic-javascript

**A modern, lazy, chainable JavaScript stream library with true semantic ordering, built-in statistics, and windowing operations.**

Inspired by Java Streams and the author's semantic-cpp library, semantic-js brings powerful functional stream processing to JavaScript – all while remaining lightweight, dependency-free, and fully lazy.

## Features

- **Lazy evaluation** – Operations are chained without immediate execution.
- **True semantic ordering** – Explicit conversion to ordered/unordered modes for predictable behaviour.
- **Built-in statistics** – Mean, median, mode, variance, skewness, kurtosis, and more.
- **Windowing support** – Tumbling and sliding windows with aggregation and mapping.
- **Collector API** – Custom reductions with support for short-circuiting.
- **Optional type** – Java-style null-safe value wrapper.
- **Parallel processing** – Configure concurrency (parallelism coming soon in terminal operations).
- **No dependencies** – Pure JavaScript, works in browsers and Node.js.

## Installation

```bash
npm install semantic-js
```

or include directly via CDN (once published).

## Quick Start

```js
import { Generative, Semantic } from 'semantic-js';

const result = Generative.of()
  .from([1, 2, 3, 4, 5, 6])
  .iterate(stream => stream
    .filter(x => x % 2 === 0)
    .map(x => x * x)
    .toList()
  );

console.log(result); // [4, 16, 36]

// Statistics example
const stats = Semantic.from([1, 3, 5, 7, 9, 11])
  .toStatistics()
  .mean(); // 6

// Window example
const windows = Semantic.from([1, 2, 3, 4, 5, 6, 7, 8])
  .toWindow()
  .getTumblingWindows(3); // [[1,2,3], [4,5,6], [7,8]]
```

## Core Concepts

### Generative – Stream creation
- `empty()`
- `fill(element | supplier, count)`
- `from(iterable)`
- `of(...elements)`
- `range(start, end, step = 1)`
- `iterate(generator)`

### Semantic – Intermediate operations
- `concat(other)`
- `distinct([identifier])`
- `filter(predicate)`
- `flatMap(mapper)`
- `limit(n)`
- `map(mapper)`
- `peek(consumer)`
- `skip(n)`
- `sub(start, end)`
- `takeWhile(predicate)`
- `dropWhile(predicate)`
- `parallel([threadCount])` – Sets concurrency level

### Conversions
- `toOrdered()` → OrderedCollectable
- `toUnordered()` → UnorderedCollectable (default behaviour)
- `toStatistics([mapper])` → Statistics
- `toWindow()` → WindowCollectable

### Collectable – Terminal operations
- `anyMatch(predicate)`
- `allMatch(predicate)`
- `noneMatch(predicate)`
- `collect(collector | supplier, [interrupter], accumulator, combiner, [finisher])`
- `count()`
- `findFirst()`
- `findAny()`
- `forEach(consumer)`
- `reduce(accumulator)` or `reduce(identity, accumulator)`
- `toList()`
- `toVector()`
- `toSet()`
- `toMap(keyExtractor, valueExtractor)`
- `group(classifier)`
- `groupBy(keyExtractor, valueExtractor)`
- `join([delimiter, prefix, suffix])`
- `cout([formatter])`
- `partition(count)`
- `partitionBy(classifier)`

### OrderedCollectable (additional)
- `sorted([comparator])`
- `reverse()`
- `shuffle([random])`

### Statistics
- `minimum([comparator])`
- `maximum([comparator])`
- `sum()`
- `mean()`
- `median()`
- `mode()`
- `variance()`
- `standardDeviation()`
- `range()`
- `quartiles()`
- `interquartileRange()`
- `skewness()`
- `kurtosis()`
- `frequency()`

### WindowCollectable
- `getSlidingWindows(size, step)`
- `getTumblingWindows(size)`
- `slide(size, step)`
- `tumble(size)`
- `slideAggregate(size, step, aggregator)`
- `tumbleAggregate(size, aggregator)`
- `mapWindows(size, step, mapper)`
- `timestampedSlidingWindows(size, step)`
- `filterWindows(size, step, predicate)`
- `windowCount(size, step)`
- `firstWindow(size, step)`
- `lastWindow(size, step)`
- `anyWindow / allWindows / noneWindow`
- `skipWindows / limitWindows / subWindows`
- `partitionWindows / groupWindows`

### Optional
- `Optional.empty()`
- `Optional.of(value)`
- `Optional.ofNullable(value)`
- `isPresent() / isEmpty()`
- `get()`
- `orElse(other) / orElseGet(supplier) / orElseThrow(supplier)`
- `map / flatMap / filter / ifPresent`

### Collector
- `Collector.of(supplier, accumulator, combiner, [interrupter], [finisher])`
- `Collector.shortable(...)`

## Why semantic-js?

Unlike many JavaScript iteration libraries, semantic-js enforces explicit ordering when needed, provides rich statistical and windowing tools out-of-the-box, and supports custom collectors with short-circuiting – all in a lightweight, intuitive API.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Licence

MIT Licence

---

Part of the **semantic** family: semantic-cpp | semantic-js | semantic-java (coming soon) | semantic-typescript (coming soon)
