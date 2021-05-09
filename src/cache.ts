type LRUCache = {
  cache: { [key: string]: any };
  order: {
    [key: string]: {
      key: string;
      count: number;
      before: string | undefined;
      after: string | undefined;
    };
  };
  first: string;
  last: string;
};

class cache {
  static _version: string = "0.0.0";
  static _size: number = 1000;
  static _cache: LRUCache;

  static _init_cache(): LRUCache {
    const stored = localStorage.getItem(cache._version);
    if (!stored) {
      const DUMMY = "_";
      cache._cache = {
        cache: {},
        order: {
          [DUMMY]: {
            key: DUMMY,
            count: 0,
            before: undefined,
            after: undefined,
          },
        },
        first: DUMMY,
        last: DUMMY,
      };
      cache.save_cache();
      return;
    }
    cache._cache = JSON.parse(stored);
  }

  static save_cache() {
    localStorage.setItem(cache._version, JSON.stringify(cache._cache));
  }

  static load<T>(key: string, f: () => Promise<T>): Promise<T> {
    var rval = cache._cache[key];
    if (rval === undefined) {
      return Promise.resolve()
        .then(f)
        .then((rval) => {
          cache._cache[key] = rval;
          cache._cache.order[key] = {
            key,
            count: 0,
            before: cache._cache.last,
            after: undefined,
          };
          cache._cache.order[cache._cache.last]!.after = key;
          cache._cache.last = key;
          cache._sort_order(key);
          if (Object.keys(cache._cache.order).length > cache._size) {
            const deleting = cache._cache.order[cache._cache.last]!;
            delete cache._cache.cache[deleting.key];
            delete cache._cache.order[deleting.key];
            cache._cache.last = deleting.before;
            cache._cache.order[cache._cache.last]!.after = undefined;
          }
          return rval;
        });
    }
    cache._sort_order(key);
    return rval;
  }

  static _sort_order(key: string) {
    const current = cache._cache.order[key]!;
    current.count++;
    while (current.before !== undefined) {
      var before = cache._cache.order[current.before];
      if (before.count > current.count) break;
      [current.before, current.after, before.before, before.after] = [
        before.before,
        current.before,
        key,
        current.after,
      ];
      if (before.after !== undefined) {
        cache._cache.order[before.after]!.before = current.after;
      } else {
        cache._cache.last = current.after;
      }
      cache._cache.order[current.before]!.after = key;
    }
    if (current.before === undefined) cache._cache.first = key;
  }
}

cache._init_cache();
