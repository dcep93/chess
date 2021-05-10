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
  last: string;
};

class CacheW {
  _version: string = "0.0.1";
  _size: number = 1000;
  _cache: LRUCache;
  _logged = false;

  constructor() {
    const stored = localStorage.getItem(this._version);
    if (!stored) {
      const DUMMY = "_";
      this._cache = {
        cache: {},
        order: {
          [DUMMY]: {
            key: DUMMY,
            count: 0,
            before: undefined,
            after: undefined,
          },
        },
        last: DUMMY,
      };
      this.save();
    } else {
      this._cache = JSON.parse(stored);
    }
  }

  save() {
    localStorage.setItem(this._version, JSON.stringify(this._cache));
  }

  async load<T>(key: string, f: () => Promise<T>): Promise<T> {
    return Promise.resolve()
      .then(() => this.load_helper(key, f))
      .catch((err) => {
        if (!this._logged) document.title = `!${document.title}`;
        this._logged = true;
        console.log(err);
        return f();
      });
  }

  async load_helper<T>(key: string, f: () => Promise<T>): Promise<T> {
    var rval = this._cache[key];
    if (rval === undefined) {
      return Promise.resolve()
        .then(f)
        .then((rval) => {
          this._cache[key] = rval;
          this._cache.order[key] = {
            key,
            count: 0,
            before: this._cache.last,
            after: undefined,
          };
          this._cache.order[this._cache.last]!.after = key;
          this._cache.last = key;
          this._sort_order(key);
          if (Object.keys(this._cache.order).length > this._size) {
            const deleting = this._cache.order[this._cache.last]!;
            delete this._cache.cache[deleting.key];
            delete this._cache.order[deleting.key];
            this._cache.last = deleting.before;
            this._cache.order[this._cache.last]!.after = undefined;
          }
          this.save();
          return rval;
        });
    }
    this._sort_order(key);
    return rval;
  }

  _sort_order(key: string) {
    const current = this._cache.order[key]!;
    current.count++;
    while (current.before !== undefined) {
      var before = this._cache.order[current.before];
      if (before.count > current.count) break;
      [current.before, current.after, before.before, before.after] = [
        before.before,
        current.before,
        key,
        current.after,
      ];
      if (before.after !== undefined) {
        this._cache.order[before.after]!.before = current.after;
      } else {
        this._cache.last = current.after;
      }
      if (current.before !== undefined) {
        this._cache.order[current.before]!.after = key;
      }
    }
  }
}

const cache_w = new CacheW();
