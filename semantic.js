export const isNumber = (unknown) => {
  return typeof(unknown) === "number" || unknown instanceof Number;
}

export const areAllNumbers = (unknowns) => {
  if(isIterable(unknowns)){
    for(const element of unknowns){
      if(!isNumber(element)){
        return false;
      }
    }
    return true;
  }
  return isNumber(unknowns);
}

export const isString = (unknown) => {
  return typeof(unknown) === "string" || unknown instanceof String;
}

export const areAllStrings = (unknowns) => {
  if(isIterable(unknowns)){
    for(const element of unknowns){
      if(!isString(element)){
        return false;
      }
    }
    return true;
  }
  return isString(unknowns);
}

export const isBoolean = (unknown) => {
  return typeof(unknown) === "boolean" || unknown instanceof Boolean;
}

export const areAllBooleans = (unknowns) => {
  if(isIterable(unknowns)){
    for(const element of unknowns){
      if(!isBoolean(element)){
        return false;
      }
    }
    return true;
  }
  return isBoolean(unknowns);
}

export const isSymbol = (unknown) => {
  return typeof(unknown) === "symbol";
}

export const areAllSymbols = (unknowns) => {
  if(isIterable(unknowns)){
    for(const element of unknowns){
      if(!isSymbol(element)){
        return false;
      }
    }
    return true;
  }
  return isSymbol(unknowns);
}

export const isFunction = (unknown) => {
  return typeof(unknown) === "function";
}

export const areAllFunctions = (unknowns) => {
  if(isIterable(unknowns)){
    for(const element of unknowns){
      if(!isFunction(element)){
        return false;
      }
    }
    return true;
  }
  return isFunction(unknowns);
}

export const isObject = (unknown) => {
  return typeof(unknown) === "object" && unknown !== null;
}

export const areAllObjects = (unknowns) => {
  if(isIterable(unknowns)){
    for(const element of unknowns){
      if(!isObject(element)){
        return false;
      }
    }
    return true;
  }
  return isObject(unknowns);
}

export const validate = (unknown) => {
  return unknown !== (void 0) && unknown !== null;
}

export const invalidate = (unknown) => {
  return unknown === (void 0) || unknown === null;
}

export const isIterable = (unknown) => {
  if(isObject(unknown)){
    return isFunction(unknown[Symbol.iterator]) || isFunction(unknown[Symbol.asyncIterator]);
  }
  return false;
}

export class Optional {
  #value;
  
  constructor(value) {
    if (validate(value)) {
      this.#value = value;
    }
  }
  
  isEmpty() {
    return invalidate(this.#value);
  }
  
  isPresent() {
    return validate(this.#value);
  }
  
  get() {
    if (this.isEmpty()) {
      throw new Error("No value present");
    }
    return this.#value;
  }
  
  ifPresent(consumer) {
    if (this.isPresent() && isFunction(consumer)) {
      consumer(this.#value);
    }
  }
  
  filter(predicate) {
    if (!this.isPresent() || !isFunction(predicate)) {
      return Optional.ofNullable(null);
    }
    return predicate(this.#value) ? this : Optional.ofNullable(null);
  }
  
  map(mapper) {
    if (this.isEmpty() || !isFunction(mapper)) {
      return Optional.ofNullable(null);
    }
    return Optional.ofNullable(mapper(this.#value));
  }
  
  flatMap(mapper) {
    if (this.isEmpty() || !isFunction(mapper)) {
      return Optional.ofNullable(null);
    }
    const result = mapper(this.#value);
    if (!(result instanceof Optional)) {
      throw new Error("FlatMap mapper must return an Optional");
    }
    return result;
  }
  
  orElse(other) {
    return this.isPresent() ? this.#value : other;
  }
  
  orElseGet(supplier) {
    if (this.isPresent()) {
      return this.#value;
    }
    if (isFunction(supplier)) {
      return supplier();
    }
    throw new Error("Supplier must be a function");
  }
  
  orElseThrow(supplier) {
    if (this.isPresent()) {
      return this.#value;
    }
    if (isFunction(supplier)) {
      throw supplier();
    }
    throw new Error("Exception supplier must be a function");
  }
  
  static empty() {
    return new Optional(null);
  }
  
  static of(value) {
    if (invalidate(value)) {
      throw new Error("Value cannot be null or undefined");
    }
    return new Optional(value);
  }
  
  static ofNullable(value) {
    return new Optional(value);
  }
  
  static ofNonNull(value) {
    if (invalidate(value)) {
      throw new Error("Value cannot be null or undefined.");
    }
    return new Optional(value);
  }
}

export class Collector {
  supplier;
  interrupter;
  accumulator;
  combiner;
  finisher;
  
  constructor(supplier, accumulator, combiner, interrupter = (element) => false, finisher = (result) => result) {
    if(areAllFunctions([supplier, accumulator, combiner, interrupter, finisher])){
      this.supplier = supplier;
      this.interrupter = interrupter;
      this.accumulator = accumulator;
      this.combiner = combiner;
      this.finisher = finisher;
    } else {
      throw new TypeError("Requires non null, non undefined functions.");
    }
  }
  
  static of(supplier, accumulator, combiner, interrupter = (element) => false, finisher = (result) => result) {
    return new Collector(supplier, accumulator, combiner, interrupter, finisher);
  }
  
  static shortable(supplier, interrupter, accumulator, combiner, finisher) {
    return new Collector(supplier, accumulator, combiner, interrupter, finisher);
  }
}

export class Generative {
  accept;
  interrupter;
  
  constructor(accept = (element, index) => {}, interrupter = (element) => false) {
    this.accept = accept;
    this.interrupter = interrupter;
  }
  
  static of(accept, interrupter = (element) => false) {
    return new Generative(accept, interrupter);
  }
  
  empty() {
    return new Semantic();
  }
  
  fill(element, count = 1) {
    if(validate(count) && isNumber(count) && count >= 0) {
      if(isFunction(element)) {
        return this.iterate((accept, interrupter) => {
          for(let index = 0; index < count; index++) {
            const elem = element();
            if(interrupter(elem)) {
              break;
            }
            accept(elem, index);
          }
        });
      } else {
        return this.iterate((accept, interrupter) => {
          for(let index = 0; index < count; index++) {
            if(interrupter(element)) {
              break;
            }
            accept(element, index);
          }
        });
      }
    }
    throw new TypeError("Supplier must be a function or value, and count must be a non-negative number.");
  }
  
  from(iterable) {
    if(isIterable(iterable)) {
      return this.iterate((accept, interrupter) => {
        let index = 0;
        for(const element of iterable) {
          if(interrupter(element)) {
            break;
          }
          accept(element, index);
          index++;
        }
      });
    }
    return this.empty();
  }
  
  iterate(generator) {
    if(!isFunction(generator)) {
      throw new TypeError("Generator must be a function");
    }
    return new Semantic(generator);
  }
  
  range(start, end, step = 1) {
    if(!areAllNumbers([start, end, step]) || step === 0) {
      throw new TypeError("Range parameters must be numbers and step cannot be zero");
    }
    const minimum = Math.min(start, end);
    const maximum = Math.max(start, end);
    const ascending = start < end;
    
    return this.iterate((accept, interrupter) => {
      if(ascending) {
        for(let value = start; value < end; value += step) {
          if(interrupter(value)) {
            break;
          }
          accept(value, (value - start) / step);
        }
      } else {
        for(let value = start; value > end; value -= step) {
          if(interrupter(value)) {
            break;
          }
          accept(value, (start - value) / step);
        }
      }
    });
  }
  
  of(...elements) {
    return this.from(elements);
  }
}

export class Semantic {
  #generator;
  #concurrent = 1;
  
  constructor(generator = (accept, interrupter) => {}, concurrent = 1) {
    this.#generator = generator;
    this.#concurrent = concurrent;
  }
  
  get generator() {
    return this.#generator;
  }
  
  get concurrent() {
    return this.#concurrent;
  }
  
  concat(other) {
    if(!(other instanceof Semantic)) {
      throw new TypeError("Argument must be a Semantic");
    }
    return new Semantic((accept, interrupter) => {
      let index = 0;
      this.#generator((element, idx) => {
        if(interrupter(element)) {
          return;
        }
        accept(element, index++);
      }, interrupter);
      
      other.generator((element, idx) => {
        if(interrupter(element)) {
          return;
        }
        accept(element, index++);
      }, interrupter);
    });
  }
  
  distinct(identifier = undefined) {
    const seen = new Set();
    return new Semantic((accept, interrupter) => {
      this.#generator((element, index) => {
        if(interrupter(element)) {
          return;
        }
        const key = isFunction(identifier) ? identifier(element) : element;
        if(!seen.has(key)) {
          seen.add(key);
          accept(element, index);
        }
      }, interrupter);
    });
  }
  
  filter(predicate) {
    if(!isFunction(predicate)) {
      throw new TypeError("Predicate must be a function");
    }
    return new Semantic((accept, interrupter) => {
      let filteredIndex = 0;
      this.#generator((element, index) => {
        if(interrupter(element) || !predicate(element)) {
          return;
        }
        accept(element, filteredIndex++);
      }, interrupter);
    });
  }
  
  limit(n) {
    if(!isNumber(n) || n < 0) {
      throw new TypeError("Limit must be a non-negative number");
    }
    return new Semantic((accept, interrupter) => {
      let count = 0;
      this.#generator((element, index) => {
        if(interrupter(element) || count >= n) {
          return;
        }
        accept(element, index);
        count++;
      }, interrupter);
    });
  }
  
  map(mapper) {
    if(!isFunction(mapper)) {
      throw new TypeError("Mapper must be a function");
    }
    return new Semantic((accept, interrupter) => {
      this.#generator((element, index) => {
        if(interrupter(element)) {
          return;
        }
        const mapped = mapper(element);
        accept(mapped, index);
      }, interrupter);
    });
  }
  
  flatMap(mapper) {
    if(!isFunction(mapper)) {
      throw new TypeError("Mapper must be a function");
    }
    return new Semantic((accept, interrupter) => {
      this.#generator((element, index) => {
        if(interrupter(element)) {
          return;
        }
        const nested = mapper(element);
        if(nested instanceof Semantic) {
          nested.generator((nestedElement, nestedIndex) => {
            if(interrupter(nestedElement)) {
              return;
            }
            accept(nestedElement, index);
          }, interrupter);
        } else if(isIterable(nested)) {
          let nestedIndex = 0;
          for(const nestedElement of nested) {
            if(interrupter(nestedElement)) {
              break;
            }
            accept(nestedElement, index);
            nestedIndex++;
          }
        }
      }, interrupter);
    });
  }
  
  skip(n) {
    if(!isNumber(n) || n < 0) {
      throw new TypeError("Skip must be a non-negative number");
    }
    return new Semantic((accept, interrupter) => {
      let skipped = 0;
      this.#generator((element, index) => {
        if(interrupter(element)) {
          return;
        }
        if(skipped < n) {
          skipped++;
          return;
        }
        accept(element, index - skipped);
      }, interrupter);
    });
  }
  
  sub(start, end) {
    if(!areAllNumbers([start, end]) || start < 0 || end < start) {
      throw new TypeError("Start and end must be non-negative numbers with end >= start");
    }
    return this.skip(start).limit(end - start);
  }
  
  takeWhile(predicate) {
    if(!isFunction(predicate)) {
      throw new TypeError("Predicate must be a function");
    }
    return new Semantic((accept, interrupter) => {
      this.#generator((element, index) => {
        if(interrupter(element) || !predicate(element)) {
          return;
        }
        accept(element, index);
      }, interrupter);
    });
  }
  
  dropWhile(predicate) {
    if(!isFunction(predicate)) {
      throw new TypeError("Predicate must be a function");
    }
    return new Semantic((accept, interrupter) => {
      let dropping = true;
      this.#generator((element, index) => {
        if(interrupter(element)) {
          return;
        }
        if(dropping && predicate(element)) {
          return;
        }
        dropping = false;
        accept(element, index);
      }, interrupter);
    });
  }
  
  peek(consumer) {
    if(!isFunction(consumer)) {
      throw new TypeError("Consumer must be a function");
    }
    return new Semantic((accept, interrupter) => {
      this.#generator((element, index) => {
        if(interrupter(element)) {
          return;
        }
        consumer(element);
        accept(element, index);
      }, interrupter);
    });
  }
  
  toOrdered() {
    return new OrderedCollectable(this.#generator, this.#concurrent);
  }
  
  toUnordered() {
    return new UnorderedCollectable(this.#generator, this.#concurrent);
  }
  
  toStatistics(mapper = (x) => x) {
    return new Statistics(this.#generator, this.#concurrent, mapper);
  }
  
  toWindow() {
    return new WindowCollectable(this.#generator, this.#concurrent);
  }
  
  parallel(threadCount = navigator.hardwareConcurrency || 4) {
    return new Semantic(this.#generator, threadCount);
  }
}

export class Collectable {
  #generator;
  #concurrent = 1;
  
  constructor(generator = (accept, interrupter) => {}, concurrent = 1) {
    this.#generator = generator;
    this.#concurrent = concurrent;
  }
  
  anyMatch(predicate) {
    if(!isFunction(predicate)) {
      throw new TypeError("Predicate must be a function");
    }
    let found = false;
    this.#generator((element, index) => {
      if(predicate(element)) {
        found = true;
      }
    }, (element) => found);
    return found;
  }
  
  allMatch(predicate) {
    if(!isFunction(predicate)) {
      throw new TypeError("Predicate must be a function");
    }
    let allMatch = true;
    this.#generator((element, index) => {
      if(!predicate(element)) {
        allMatch = false;
      }
    }, (element) => !allMatch);
    return allMatch;
  }
  
  noneMatch(predicate) {
    return !this.anyMatch(predicate);
  }
  
  collect(supplier, interrupter, accumulator, combiner, finisher) {
    if(supplier instanceof Collector) {
      const collector = supplier;
      return this.collectWithCollector(collector);
    } else if(areAllFunctions([supplier, accumulator, combiner])) {
      const finisherFn = isFunction(finisher) ? finisher : (result) => result;
      const collector = new Collector(supplier, accumulator, combiner, interrupter, finisherFn);
      return this.collectWithCollector(collector);
    } else {
      throw new TypeError("Invalid arguments for collect");
    }
  }
  
  collectWithCollector(collector) {
    let result = collector.supplier();
    let shouldBreak = false;
    
    this.#generator((element, index) => {
      if(collector.interrupter(element)) {
        shouldBreak = true;
        return;
      }
      result = collector.accumulator(result, element);
    }, (element) => shouldBreak);
    
    return collector.finisher(result);
  }
  
  count() {
    let count = 0;
    this.#generator((element, index) => {
      count++;
    }, (element) => false);
    return count;
  }
  
  findFirst() {
    let first = null;
    this.#generator((element, index) => {
      first = element;
    }, (element) => first !== null);
    return Optional.ofNullable(first);
  }
  
  findAny() {
    return this.findFirst(); // In sequential execution, findAny is same as findFirst
  }
  
  forEach(consumer) {
    if(!isFunction(consumer)) {
      throw new TypeError("Consumer must be a function");
    }
    this.#generator((element, index) => {
      consumer(element, index);
    }, (element) => false);
  }
  
  reduce(identityOrAccumulator, accumulator) {
    if(isFunction(identityOrAccumulator) && accumulator === undefined) {
      const accumulatorFn = identityOrAccumulator;
      let result = null;
      let hasFirst = false;
      this.#generator((element, index) => {
        if(!hasFirst) {
          result = element;
          hasFirst = true;
        } else {
          result = accumulatorFn(result, element);
        }
      }, (element) => false);
      return Optional.ofNullable(result);
    } else if(validate(identityOrAccumulator) && isFunction(accumulator)) {
      const identity = identityOrAccumulator;
      const accumulatorFn = accumulator;
      let result = identity;
      this.#generator((element, index) => {
        result = accumulatorFn(result, element);
      }, (element) => false);
      return result;
    } else {
      throw new TypeError("Invalid arguments for reduce");
    }
  }
  
  toList() {
    const list = [];
    this.#generator((element, index) => {
      list.push(element);
    }, (element) => false);
    return list;
  }
  
  toVector() {
    return this.toList();
  }
  
  toSet() {
    const set = new Set();
    this.#generator((element, index) => {
      set.add(element);
    }, (element) => false);
    return set;
  }
  
  toUnorderedSet() {
    return this.toSet();
  }
  
  toMap(keyExtractor, valueExtractor) {
    if(!areAllFunctions([keyExtractor, valueExtractor])) {
      throw new TypeError("Key and value extractors must be functions");
    }
    const map = new Map();
    this.#generator((element, index) => {
      const key = keyExtractor(element);
      const value = valueExtractor(element);
      map.set(key, value);
    }, (element) => false);
    return map;
  }
  
  group(classifier) {
    if(!isFunction(classifier)) {
      throw new TypeError("Classifier must be a function");
    }
    const groups = new Map();
    this.#generator((element, index) => {
      const key = classifier(element);
      if(!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(element);
    }, (element) => false);
    return groups;
  }
  
  groupBy(keyExtractor, valueExtractor) {
    if(!areAllFunctions([keyExtractor, valueExtractor])) {
      throw new TypeError("Key and value extractors must be functions");
    }
    const groups = new Map();
    this.#generator((element, index) => {
      const key = keyExtractor(element);
      const value = valueExtractor(element);
      if(!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(value);
    }, (element) => false);
    return groups;
  }
  
  join(delimiter = "", prefix = "", suffix = "") {
    const elements = this.toList();
    return prefix + elements.join(delimiter) + suffix;
  }
  
  cout(formatter = (element) => `${element}`) {
    this.#generator((element, index) => {
      console.log(formatter(element));
    }, (element) => false);
  }
  
  partition(count) {
    if(!isNumber(count) || count <= 0) {
      throw new TypeError("Partition count must be a positive number");
    }
    const partitions = [];
    let current = [];
    this.#generator((element, index) => {
      current.push(element);
      if(current.length >= count) {
        partitions.push([...current]);
        current = [];
      }
    }, (element) => false);
    if(current.length > 0) {
      partitions.push(current);
    }
    return partitions;
  }
  
  partitionBy(classifier) {
    if(!isFunction(classifier)) {
      throw new TypeError("Classifier must be a function");
    }
    const partitions = new Map();
    this.#generator((element, index) => {
      const key = classifier(element);
      if(!partitions.has(key)) {
        partitions.set(key, []);
      }
      partitions.get(key).push(element);
    }, (element) => false);
    return Array.from(partitions.values());
  }
}

export class OrderedCollectable extends Collectable {
  constructor(generator = (accept, interrupter) => {}, concurrent = 1) {
    super(generator, concurrent);
  }
  
  sorted(comparator = undefined) {
    const list = this.toList();
    if(isFunction(comparator)) {
      list.sort(comparator);
    } else {
      list.sort();
    }
    return new Semantic((accept, interrupter) => {
      for(let i = 0; i < list.length; i++) {
        if(interrupter(list[i])) {
          break;
        }
        accept(list[i], i);
      }
    });
  }
  
  reverse() {
    const list = this.toList();
    list.reverse();
    return new Semantic((accept, interrupter) => {
      for(let i = 0; i < list.length; i++) {
        if(interrupter(list[i])) {
          break;
        }
        accept(list[i], i);
      }
    });
  }
  
  shuffle(random = Math.random) {
    const list = this.toList();
    for(let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return new Semantic((accept, interrupter) => {
      for(let i = 0; i < list.length; i++) {
        if(interrupter(list[i])) {
          break;
        }
        accept(list[i], i);
      }
    });
  }
  
  semantic() {
    return new Semantic(this.generator, this.concurrent);
  }
}

export class UnorderedCollectable extends Collectable {
  constructor(generator = (accept, interrupter) => {}, concurrent = 1) {
    super(generator, concurrent);
  }
  
  semantic() {
    return new Semantic(this.generator, this.concurrent);
  }
}

export class Statistics extends OrderedCollectable {
  #mapper;
  
  constructor(generator = (accept, interrupter) => {}, concurrent = 1, mapper = (x) => x) {
    super(generator, concurrent);
    this.#mapper = mapper;
  }
  
  get mapper() {
    return this.#mapper;
  }
  
  getValues() {
    const values = [];
    this.generator((element, index) => {
      values.push(this.#mapper(element));
    }, (element) => false);
    return values.sort((a, b) => a - b);
  }
  
  count() {
    return super.count();
  }
  
  minimum(comparator = undefined) {
    const values = this.getValues();
    if(values.length === 0) {
      return Optional.empty();
    }
    if(isFunction(comparator)) {
      let min = values[0];
      for(let i = 1; i < values.length; i++) {
        if(comparator(values[i], min) < 0) {
          min = values[i];
        }
      }
      return Optional.of(min);
    }
    return Optional.of(Math.min(...values));
  }
  
  maximum(comparator = undefined) {
    const values = this.getValues();
    if(values.length === 0) {
      return Optional.empty();
    }
    if(isFunction(comparator)) {
      let max = values[0];
      for(let i = 1; i < values.length; i++) {
        if(comparator(values[i], max) > 0) {
          max = values[i];
        }
      }
      return Optional.of(max);
    }
    return Optional.of(Math.max(...values));
  }
  
  sum() {
    const values = this.getValues();
    return values.reduce((acc, val) => acc + val, 0);
  }
  
  mean() {
    const count = this.count();
    if(count === 0) {
      return 0;
    }
    return this.sum() / count;
  }
  
  median() {
    const values = this.getValues();
    if(values.length === 0) {
      return 0;
    }
    const mid = Math.floor(values.length / 2);
    if(values.length % 2 === 0) {
      return (values[mid - 1] + values[mid]) / 2;
    }
    return values[mid];
  }
  
  mode() {
    const values = this.getValues();
    if(values.length === 0) {
      return 0;
    }
    const frequency = new Map();
    let maxFreq = 0;
    let mode = values[0];
    for(const value of values) {
      const freq = (frequency.get(value) || 0) + 1;
      frequency.set(value, freq);
      if(freq > maxFreq) {
        maxFreq = freq;
        mode = value;
      }
    }
    return mode;
  }
  
  variance() {
    const values = this.getValues();
    if(values.length < 2) {
      return 0;
    }
    const mean = this.mean();
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return squaredDiffs.reduce((acc, val) => acc + val, 0) / (values.length - 1);
  }
  
  standardDeviation() {
    return Math.sqrt(this.variance());
  }
  
  range() {
    const min = this.minimum();
    const max = this.maximum();
    if(min.isEmpty() || max.isEmpty()) {
      return 0;
    }
    return max.get() - min.get();
  }
  
  quartiles() {
    const values = this.getValues();
    if(values.length === 0) {
      return [0, 0, 0];
    }
    const q1Index = Math.floor(values.length * 0.25);
    const q2Index = Math.floor(values.length * 0.5);
    const q3Index = Math.floor(values.length * 0.75);
    return [values[q1Index] || 0, values[q2Index] || 0, values[q3Index] || 0];
  }
  
  interquartileRange() {
    const [q1, , q3] = this.quartiles();
    return q3 - q1;
  }
  
  skewness() {
    const values = this.getValues();
    if(values.length < 3) {
      return 0;
    }
    const mean = this.mean();
    const stdDev = this.standardDeviation();
    if(stdDev === 0) {
      return 0;
    }
    const cubedDiffs = values.map(val => Math.pow(val - mean, 3));
    const sumCubedDiffs = cubedDiffs.reduce((acc, val) => acc + val, 0);
    return (sumCubedDiffs / values.length) / Math.pow(stdDev, 3);
  }
  
  kurtosis() {
    const values = this.getValues();
    if(values.length < 4) {
      return 0;
    }
    const mean = this.mean();
    const stdDev = this.standardDeviation();
    if(stdDev === 0) {
      return 0;
    }
    const fourthDiffs = values.map(val => Math.pow(val - mean, 4));
    const sumFourthDiffs = fourthDiffs.reduce((acc, val) => acc + val, 0);
    return (sumFourthDiffs / values.length) / Math.pow(stdDev, 4) - 3;
  }
  
  frequency() {
    const values = this.getValues();
    const freq = new Map();
    for(const value of values) {
      freq.set(value, (freq.get(value) || 0) + 1);
    }
    return freq;
  }
  
  isEmpty() {
    return this.count() === 0;
  }
  
  clear() {
    // In JavaScript, we can't clear a generator, so we create a new empty one
    this.generator = (accept, interrupter) => {};
  }
}

export class WindowCollectable extends OrderedCollectable {
  constructor(generator = (accept, interrupter) => {}, concurrent = 1) {
    super(generator, concurrent);
  }
  
  getSlidingWindows(windowSize, step = 1) {
    if(!isNumber(windowSize) || windowSize <= 0 || !isNumber(step) || step <= 0) {
      throw new TypeError("Window size and step must be positive numbers");
    }
    
    const elements = this.toList();
    const windows = [];
    
    for(let i = 0; i + windowSize <= elements.length; i += step) {
      windows.push(elements.slice(i, i + windowSize));
    }
    
    return windows;
  }
  
  getTumblingWindows(windowSize) {
    return this.getSlidingWindows(windowSize, windowSize);
  }
  
  slide(windowSize, step = 1) {
    const windows = this.getSlidingWindows(windowSize, step);
    return new Semantic((accept, interrupter) => {
      for(let i = 0; i < windows.length; i++) {
        if(interrupter(windows[i])) {
          break;
        }
        accept(windows[i], i);
      }
    });
  }
  
  tumble(windowSize) {
    return this.slide(windowSize, windowSize);
  }
  
  slideAggregate(windowSize, step, aggregator) {
    if(!isFunction(aggregator)) {
      throw new TypeError("Aggregator must be a function");
    }
    const windows = this.getSlidingWindows(windowSize, step);
    if(windows.length === 0) {
      return [];
    }
    return windows.map(window => aggregator(window, windowSize));
  }
  
  tumbleAggregate(windowSize, aggregator) {
    return this.slideAggregate(windowSize, windowSize, aggregator);
  }
  
  window(windowSize, step = windowSize) {
    return this.slide(windowSize, step).toWindow();
  }
  
  mapWindows(windowSize, step, mapper) {
    if(!isFunction(mapper)) {
      throw new TypeError("Mapper must be a function");
    }
    const windows = this.getSlidingWindows(windowSize, step);
    return windows.map(window => mapper(window));
  }
  
  mapTumblingWindows(windowSize, mapper) {
    return this.mapWindows(windowSize, windowSize, mapper);
  }
  
  timestampedSlidingWindows(windowSize, step = 1) {
    const elements = this.toList();
    const windows = [];
    
    for(let i = 0; i + windowSize <= elements.length; i += step) {
      const window = elements.slice(i, i + windowSize);
      windows.push([i, window]);
    }
    
    return windows;
  }
  
  timestampedTumblingWindows(windowSize) {
    return this.timestampedSlidingWindows(windowSize, windowSize);
  }
  
  filterWindows(windowSize, step, predicate) {
    if(!isFunction(predicate)) {
      throw new TypeError("Predicate must be a function");
    }
    const windows = this.getSlidingWindows(windowSize, step);
    const filtered = windows.filter(predicate);
    return new WindowCollectable((accept, interrupter) => {
      for(let i = 0; i < filtered.length; i++) {
        if(interrupter(filtered[i])) {
          break;
        }
        accept(filtered[i], i);
      }
    });
  }
  
  filterTumblingWindows(windowSize, predicate) {
    return this.filterWindows(windowSize, windowSize, predicate);
  }
  
  windowCount(windowSize, step) {
    const elements = this.toList();
    if(elements.length < windowSize) {
      return 0;
    }
    return Math.floor((elements.length - windowSize) / step) + 1;
  }
  
  tumblingWindowCount(windowSize) {
    return this.windowCount(windowSize, windowSize);
  }
  
  windowStream(windowSize, step) {
    return this.slide(windowSize, step);
  }
  
  tumblingWindowStream(windowSize) {
    return this.tumble(windowSize);
  }
  
  firstWindow(windowSize, step) {
    const windows = this.getSlidingWindows(windowSize, step);
    if(windows.length === 0) {
      return Optional.empty();
    }
    return Optional.of(windows[0]);
  }
  
  firstTumblingWindow(windowSize) {
    return this.firstWindow(windowSize, windowSize);
  }
  
  lastWindow(windowSize, step) {
    const windows = this.getSlidingWindows(windowSize, step);
    if(windows.length === 0) {
      return Optional.empty();
    }
    return Optional.of(windows[windows.length - 1]);
  }
  
  lastTumblingWindow(windowSize) {
    return this.lastWindow(windowSize, windowSize);
  }
  
  anyWindow(windowSize, step, predicate) {
    if(!isFunction(predicate)) {
      throw new TypeError("Predicate must be a function");
    }
    const windows = this.getSlidingWindows(windowSize, step);
    return windows.some(predicate);
  }
  
  allWindows(windowSize, step, predicate) {
    if(!isFunction(predicate)) {
      throw new TypeError("Predicate must be a function");
    }
    const windows = this.getSlidingWindows(windowSize, step);
    return windows.every(predicate);
  }
  
  noneWindow(windowSize, step, predicate) {
    return !this.anyWindow(windowSize, step, predicate);
  }
  
  skipWindows(windowSize, step, count) {
    if(!isNumber(count) || count < 0) {
      throw new TypeError("Count must be a non-negative number");
    }
    const windows = this.getSlidingWindows(windowSize, step);
    const skipped = windows.slice(count);
    return new WindowCollectable((accept, interrupter) => {
      for(let i = 0; i < skipped.length; i++) {
        if(interrupter(skipped[i])) {
          break;
        }
        accept(skipped[i], i);
      }
    });
  }
  
  limitWindows(windowSize, step, count) {
    if(!isNumber(count) || count < 0) {
      throw new TypeError("Count must be a non-negative number");
    }
    const windows = this.getSlidingWindows(windowSize, step);
    const limited = windows.slice(0, count);
    return new WindowCollectable((accept, interrupter) => {
      for(let i = 0; i < limited.length; i++) {
        if(interrupter(limited[i])) {
          break;
        }
        accept(limited[i], i);
      }
    });
  }
  
  subWindows(windowSize, step, start, end) {
    if(!areAllNumbers([start, end]) || start < 0 || end < start) {
      throw new TypeError("Start and end must be non-negative numbers with end >= start");
    }
    return this.skipWindows(windowSize, step, start).limitWindows(windowSize, step, end - start);
  }
  
  partitionWindows(windowSize, step, partitionCount) {
    if(!isNumber(partitionCount) || partitionCount <= 0) {
      throw new TypeError("Partition count must be a positive number");
    }
    const windows = this.getSlidingWindows(windowSize, step);
    const partitionSize = Math.ceil(windows.length / partitionCount);
    const result = [];
    for(let i = 0; i < windows.length; i += partitionSize) {
      result.push(windows.slice(i, i + partitionSize));
    }
    return result;
  }
  
  groupWindows(windowSize, step, classifier) {
    if(!isFunction(classifier)) {
      throw new TypeError("Classifier must be a function");
    }
    const windows = this.getSlidingWindows(windowSize, step);
    const groups = new Map();
    for(const window of windows) {
      const key = classifier(window);
      if(!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(window);
    }
    return groups;
  }
  
  semantic() {
    return new Semantic(this.generator, this.concurrent);
  }
}
