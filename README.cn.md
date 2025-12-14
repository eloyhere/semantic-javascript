# semantic-javascript

一款现代、懒加载、可链式的 JavaScript 流处理库，支持真正的语义有序、内置统计操作、滚动/滑动窗口以及可选的并行处理。

受 Java Streams 和作者自己的 semantic-cpp 启发，semantic-javascript 将强大的函数式数据处理管道带入 JavaScript —— 全部实现为轻量级、无依赖的包。

## 为什么选择 semantic-javascript？

大多数 JavaScript 迭代库仅关注简单的映射和过滤。semantic-js 更进一步，提供：

- **真正的语义有序** —— 显式调用 `toOrdered()` 以支持顺序敏感操作（如 `findFirst`、`sorted`），默认无序模式以获得更好性能。
- **内置统计功能** —— 直接在流上计算均值、中位数、众数、方差、标准差、偏度、峰度、四分位数等。
- **一流的窗口支持** —— 滚动窗口和滑动窗口，支持聚合、映射、过滤等多种操作。
- **懒加载求值** —— 操作链式组合，直到调用终端操作才真正执行。
- **并行支持** —— 通过 `.parallel(n)` 配置并发度，终端操作使用 Promise.all 实现并行。

无外部依赖。兼容浏览器和 Node.js。

## 安装

```bash
npm install semantic-javascript
```

```js
import { Generative, Semantic } from 'semantic-javascript';
// 或
const { Generative, Semantic } = require('semantic-javascript');
```

## 快速开始

```js
const result = new Generative()
  .from([1, 2, 3, 4, 5, 6, 7, 8])
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .toList();

console.log(result); // [4, 16, 36, 64]
```

## 核心 API

### 流创建（Generative）

- `new Generative().empty()` —— 空流
- `new Generative().of(...elements)` —— 从可变参数创建
- `new Generative().from(iterable)` —— 从数组、Set、Map、生成器等创建
- `new Generative().fill(value | supplier, count)` —— 重复值或供应商结果
- `new Generative().range(start, end, step = 1)` —— 数值范围（包含起点，不包含终点）

### 中间操作（Semantic）

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
- `.parallel(concurrency)` —— 设置并发度（终端操作中使用）

### 类型转换

- `.toOrdered()` —— 切换到有序模式（保留插入顺序，支持可靠的 `findFirst`、`sorted` 等）
- `.toUnordered()` —— 显式无序（默认行为）
- `.toStatistics([mapper])` —— 启用统计操作
- `.toWindow()` —— 启用窗口操作

### 终端操作（Collectable）

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
- `.findFirst()` / `.findAny()` —— 返回 Optional
- `.forEach(consumer)`
- `.reduce(identity, accumulator)` 或 `.reduce(accumulator)`（无初始值返回 Optional）
- `.collect(collector)` 或 `.collect(supplier, accumulator, combiner, [interrupter], [finisher])`
- `.cout([formatter])` —— 控制台输出（调试用）
- `.partition(count)`
- `.partitionBy(classifier)`

### 有序操作（OrderedCollectable）

- `.sorted([comparator])`
- `.reverse()`
- `.shuffle([random])`

### 统计操作（Statistics）

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

### 窗口操作（WindowCollectable）

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
- `.firstWindow(size, step)`、`.lastWindow(size, step)`
- `.anyWindow / allWindows / noneWindow(size, step, predicate)`
- `.skipWindows / limitWindows / subWindows`
- `.partitionWindows / groupWindows`

### Optional

Java 风格的 Optional，支持：
- `Optional.of(value)`
- `Optional.ofNullable(value)`
- `Optional.empty()`
- `.isPresent()`、`.get()`、`.orElse()`、`.orElseGet()`、`.orElseThrow()`、`.map()`、`.flatMap()`、`.filter()`、`.ifPresent()`

### Collector

类似 Java 的自定义收集器：
- `Collector.of(supplier, accumulator, combiner, [interrupter], [finisher])`

## 示例

### 基础流

```js
new Generative()
  .from(['apple', 'banana', 'cherry', 'date'])
  .filter(s => s.startsWith('a'))
  .map(s => s.toUpperCase())
  .toUnordered()
  .toList();
// → ['APPLE']
```

### 统计

```js
const stats = new Generative()
  .range(1, 11)
  .toStatistics();

console.log(stats.mean());        // 5.5
console.log(stats.median());      // 5.5
console.log(stats.standardDeviation()); // ≈3.0277
console.log(stats.skewness());    // 0
```

### 窗口

```js
const windows = new Generative()
  .from([1, 2, 3, 4, 5, 6, 7, 8])
  .toWindow()
  .getSlidingWindows(3, 2);
// → [[1,2,3], [3,4,5], [5,6,7]]
```

### 自定义收集器

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

## 与竞品对比

| 特性                             | lodash / fp | RxJS       | underscore | ixjs       | semantic-js                          |
|----------------------------------|-------------|------------|------------|------------|--------------------------------------|
| 懒加载求值                       | 部分支持    | 支持       | 不支持     | 支持       | 支持                                 |
| 可链式 API                       | 支持        | 支持       | 支持       | 支持       | 支持                                 |
| 真正的语义有序                   | 不支持      | 不支持     | 不支持     | 不支持     | 支持（显式有序/无序模式）             |
| 内置统计功能                     | 不支持      | 不支持     | 不支持     | 不支持     | 支持（完整套件）                     |
| 滚动/滑动窗口                    | 不支持      | 部分支持   | 不支持     | 部分支持   | 支持（一流、丰富 API）                |
| 并行处理                         | 不支持      | 支持       | 不支持     | 不支持     | 支持（可配置）                       |
| 无依赖                           | 支持        | 不支持     | 支持       | 不支持     | 支持                                 |
| Optional 与 Collector 工具       | 不支持      | 不支持     | 不支持     | 不支持     | 支持                                 |

semantic-js 通过将强大的统计和窗口功能与严格的语义有序结合，在轻量级包中脱颖而出。

## 许可证

MIT 许可证

---

享受 JavaScript 中的函数式流处理 —— semantic 的方式！🚀

如果觉得有用，请给仓库点 Star，并欢迎提交 issue 或贡献代码。
