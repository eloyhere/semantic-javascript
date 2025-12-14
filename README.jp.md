# semantic-javascript

現代的で遅延評価可能な、チェーン可能な JavaScript ストリームライブラリです。真の意味的順序付け、内蔵統計演算、タンブリング/スライディングウィンドウ、オプションのパラレル処理を備えています。

Java Streams および作者自身の semantic-cpp に着想を得て、semantic-javascript は強力な関数型スタイルのデータ処理パイプラインを JavaScript に軽量・依存なしで導入します。

## semantic-javascript を選ぶ理由

多くの JavaScript イテレーションライブラリはシンプルなマッピングとフィルタリングに留まります。semantic-javascript はさらに進んで以下を提供します：

- **真の意味的順序付け** —— `toOrdered()` で順序依存操作（例: `findFirst`、`sorted`）を明示的に有効化、デフォルトは無順序モードでパフォーマンス向上。
- **内蔵統計機能** —— 平均、中央値、最頻値、分散、標準偏差、歪度、尖度、四分位数など、ストリーム上で直接利用可能。
- **一流のウィンドウ処理** —— タンブリングおよびスライディングウィンドウをサポート、集計、マッピング、フィルタリングなど豊富な操作。
- **遅延評価** —— 操作はチェーンされるだけで実行されず、終端操作が呼ばれるまで実際の計算は行われません。
- **パラレル対応** —— `.parallel(n)` で並行度を設定（将来 Promise.all ベースで実装予定）。

依存なし。ブラウザおよび Node.js で動作します。

## インストール

```bash
npm install semantic-javascript
```

```js
import { Generative, Semantic } from 'semantic-javascript';
// または
const { Generative, Semantic } = require('semantic-javascript');
```

## クイックスタート

```js
const result = new Generative()
  .from([1, 2, 3, 4, 5, 6, 7, 8])
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .toList();

console.log(result); // [4, 16, 36, 64]
```

## コア API

### ストリーム作成（Generative）

- `new Generative().empty()` —— 空ストリーム
- `new Generative().of(...elements)` —— 可変引数から作成
- `new Generative().from(iterable)` —— 配列、Set、Map、ジェネレータなどから作成
- `new Generative().fill(value | supplier, count)` —— 値またはサプライヤの結果を繰り返し
- `new Generative().range(start, end, step = 1)` —— 数値範囲（開始含む、終了含まず）

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
- `.parallel(concurrency)` —— 並行度を設定（将来の終端操作で使用）

### 型変換

- `.toOrdered()` —— 有順序モードに切り替え（挿入順序を保持、`findFirst`、`sorted` などに有効）
- `.toUnordered()` —— 明示的に無順序（デフォルト動作）
- `.toStatistics([mapper])` —— 統計演算を有効化
- `.toWindow()` —— ウィンドウ演算を有効化

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
- `.findFirst()` / `.findAny()` —— Optional を返す
- `.forEach(consumer)`
- `.reduce(identity, accumulator)` または `.reduce(accumulator)`（初期値なしの場合 Optional を返す）
- `.collect(collector)` または `.collect(supplier, accumulator, combiner, [interrupter], [finisher])`
- `.cout([formatter])` —— コンソール出力（デバッグに便利）
- `.partition(count)`
- `.partitionBy(classifier)`

### 有順序操作（OrderedCollectable）

- `.sorted([comparator])`
- `.reverse()`
- `.shuffle([random])`

### 統計演算（Statistics）

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

### ウィンドウ処理（WindowCollectable）

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

Java スタイルの Optional を提供：
- `Optional.of(value)`
- `Optional.ofNullable(value)`
- `Optional.empty()`
- `.isPresent()`、`.get()`、`.orElse()`、`.orElseGet()`、`.orElseThrow()`、`.map()`、`.flatMap()`、`.filter()`、`.ifPresent()`

### Collector

Java に似たカスタムコレクター：
- `Collector.of(supplier, accumulator, combiner, [interrupter], [finisher])`

## 例

### 基本ストリーム

```js
new Generative()
  .from(['apple', 'banana', 'cherry', 'date'])
  .filter(s => s.startsWith('a'))
  .map(s => s.toUpperCase())
  .toList();
// → ['APPLE']
```

### 統計演算

```js
const stats = new Generative()
  .range(1, 11)
  .toStatistics();

console.log(stats.mean());        // 5.5
console.log(stats.median());      // 5.5
console.log(stats.standardDeviation()); // ≈3.0277
console.log(stats.skewness());    // 0
```

### ウィンドウ処理

```js
const windows = new Generative()
  .from([1, 2, 3, 4, 5, 6, 7, 8])
  .toWindow()
  .getSlidingWindows(3, 2);
// → [[1,2,3], [3,4,5], [5,6,7]]
```

### カスタムコレクター

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

## 競合製品との比較

| 機能                             | lodash / fp | RxJS       | underscore | ixjs       | semantic-javascript                  |
|----------------------------------|-------------|------------|------------|------------|--------------------------------------|
| 遅延評価                         | 部分        | あり       | なし       | あり       | あり                                 |
| チェーン可能な API                | あり        | あり       | あり       | あり       | あり                                 |
| 真の意味的順序付け               | なし        | なし       | なし       | なし       | あり（明示的な順序/無順序モード）     |
| 内蔵統計演算                     | なし        | なし       | なし       | なし       | あり（完全な機能セット）              |
| タンブリング/スライディングウィンドウ | なし        | 部分       | なし       | 部分       | あり（一流で豊富な API）              |
| パラレル処理                     | なし        | あり       | なし       | なし       | あり（設定可能）                     |
| 依存なし                         | あり        | なし       | あり       | なし       | あり                                 |
| Optional および Collector ユーティリティ | なし        | なし       | なし       | なし       | あり                                 |

semantic-javascript は軽量でありながら強力な統計・ウィンドウ機能と厳格な意味的順序付けを組み合わせ、同種ライブラリの中で独自の地位を築いています。

## ライセンス

MIT ライセンス

---

semantic スタイルで JavaScript の関数型ストリーム処理をお楽しみください！🚀

役に立つと思ったら Star をお願いします。Issue やコントリビューションも歓迎します。
