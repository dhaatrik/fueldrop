
const store = new Map();
const listeners = new Map();

global.localStorage = {
  getItem: (key) => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  clear: () => store.clear(),
  removeItem: (key) => store.delete(key),
  get length() { return store.size; },
  key: (index) => Array.from(store.keys())[index] || null,
};

global.window = {
  dispatchEvent: (event) => {
    const type = event.type;
    if (listeners.has(type)) {
      listeners.get(type).forEach(cb => cb(event));
    }
    return true;
  },
  addEventListener: (type, listener) => {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(listener);
  },
  removeEventListener: (type, listener) => {
    if (listeners.has(type)) {
      const list = listeners.get(type);
      const idx = list.indexOf(listener);
      if (idx !== -1) list.splice(idx, 1);
    }
  },
};

global.CustomEvent = class {
  constructor(type, options) {
    this.type = type;
    this.detail = options?.detail;
  }
};

global.StorageEvent = class {
  constructor(type, options) {
    this.type = type;
    this.key = options?.key;
    this.newValue = options?.newValue;
  }
};

global.Event = class {
  constructor(type) {
    this.type = type;
  }
};
