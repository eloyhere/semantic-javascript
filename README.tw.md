# semantic-javascript

一款現代化、惰性求值、可鏈式調用的 JavaScript 串流庫，具備真正的語義排序、內建統計運算、滾動/滑動視窗，以及可選的並行處理功能。

靈感來自 Java Streams 以及作者自身的 semantic-cpp，semantic-javascript 將強大且函數式風格的資料處理管線帶入 JavaScript —— 全部以輕量、無依賴的方式實現。

## 為什麼選擇 semantic-javascript？

大多數 JavaScript 迭代庫僅專注於簡單的映射與過濾。semantic-javascript 更進一步，提供：

- **真正的語義排序** —— 明確的 `toOrdered()` 用於需要順序的操作（如 `findFirst`、`sorted`），預設為無序模式以提升效能。
- **內建統計功能** —— 平均值、中位數、眾數、變異數、標準差、偏度、峰度、四分位數等，直接在串流上使用。
- **一流的視窗處理** —— 滾動（tumbling）與滑動（sliding）視窗，支援聚合、映射、過濾等多種操作。
- **惰性求值** —— 操作僅鏈式記錄，直到呼叫終端操作才真正執行。
- **並行支援** —— 透過 `.parallel(n)` 設定並行度（未來將以 Promise.all 實現）。

無任何依賴。可在瀏覽器與 Node.js 中運行。

## 安裝

```bash
npm install semantic-javascript
```

```js
import { Generative, Semantic } from 'semantic-javascript';
// 或
const { Generative, Semantic } = require('semantic-javascript');
```

## 快速入門

```js
const result = new Generative()
  .from([1, 2, 3, 4, 5, 6, 7, 8])
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .toList();

console.log(result); // [4, 16, 36, 64]
```

## 核心 API

### 串流建立（Generative）

- `new Generative().empty()` —— 空串流
- `new Generative().of(...elements)` —— 由可變參數建立
- `new Generative().from(iterable)` —— 由陣列、Set、Map、generator 等建立
- `new Generative().fill(value | supplier, count)` —— 重複值或供應者結果
- `new Generative().range(start, end, step = 1)` —— 數值範圍（包含起始，不包含結束）

### 中間操作（Semantic）

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
- `.parallel(concurrency)` —— 設定並行度（供未來終端操作使用）

### 類型轉換

- `.toOrdered()` —— 切換至有序模式（保留插入順序，適用於 `findFirst`、`sorted` 等）
- `.toUnordered()` —— 明確無序（預設行為）
- `.toStatistics([mapper])` —— 啟用統計運算
- `.toWindow()` —— 啟用視窗運算

### 終端操作（Collectable）

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
- `.findFirst()` / `.findAny()` —— 回傳 Optional
- `.forEach(consumer)`
- `.reduce(identity, accumulator)` 或 `.reduce(accumulator)`（無初始值回傳 Optional）
- `.collect(collector)` 或 `.collect(supplier, accumulator, combiner, [interrupter], [finisher])`
- `.cout([formatter])` —— 輸出至控制台（適合除錯）
- `.partition(count)`
- `.partitionBy(classifier)`

### 有序操作（OrderedCollectable）

- `.sorted([comparator])`
- `.reverse()`
- `.shuffle([random])`

### 統計運算（Statistics）

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

### 視窗處理（WindowCollectable）

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

Java 風格的 Optional，包含：
- `Optional.of(value)`
- `Optional.ofNullable(value)`
- `Optional.empty()`
- `.isPresent()`、`.get()`、`.orElse()`、`.orElseGet()`、`.orElseThrow()`、`.map()`、`.flatMap()`、`.filter()`、`.ifPresent()`

### Collector

類似 Java 的自訂收集器：
- `Collector.of(supplier, accumulator, combiner, [interrupter], [finisher])`

## 範例

### 基本串流

```js
new Generative()
  .from(['apple', 'banana', 'cherry', 'date'])
  .filter(s => s.startsWith('a'))
  .map(s => s.toUpperCase())
  .toList();
// → ['APPLE']
```

### 統計運算

```js
const stats = new Generative()
  .range(1, 11)
  .toStatistics();

console.log(stats.mean());        // 5.5
console.log(stats.median());      // 5.5
console.log(stats.standardDeviation()); // ≈3.0277
console.log(stats.skewness());    // 0
```

### 視窗處理

```js
const windows = new Generative()
  .from([1, 2, 3, 4, 5, 6, 7, 8])
  .toWindow()
  .getSlidingWindows(3, 2);
// → [[1,2,3], [3,4,5], [5,6,7]]
```

### 自訂收集器

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

## 與競爭對手的比較

| 功能                             | lodash / fp | RxJS       | underscore | ixjs       | semantic-javascript                  |
|----------------------------------|-------------|------------|------------|------------|--------------------------------------|
| 惰性求值                         | 部分        | 是         | 否         | 是         | 是                                   |
| 可鏈式 API                       | 是          | 是         | 是         | 是         | 是                                   |
| 真正的語義排序                   | 否          | 否         | 否         | 否         | 是（明確有序/無序模式）               |
| 內建統計運算                     | 否          | 否         | 否         | 否         | 是（完整套件）                        |
| 滾動/滑動視窗                     | 否          | 部分       | 否         | 部分       | 是（一流、豐富 API）                  |
| 並行處理                         | 否          | 是         | 否         | 否         | 是（可設定）                         |
| 無依賴                           | 是          | 否         | 是         | 否         | 是                                   |
| Optional 與 Collector 工具       | 否          | 否         | 否         | 否         | 是                                   |

semantic-javascript 以輕量方式結合強大的統計與視窗功能，並提供嚴格的語義排序，在同類庫中獨樹一格。

## 授權

MIT 授權

---

盡情享受 JavaScript 中的函數式串流處理 —— semantic 的方式！🚀

若您覺得有用，請為本專案點 Star，並歡迎提出 issue 或貢獻程式碼。
