const EventEmitter = require('events');

class ObservableEmitter extends EventEmitter {
	constructor() {
		super();

    this.eventQueue = {};
	}
	on(event, listener) {
		super.on(event, listener);

    let queue = this.eventQueue[event];

    if(queue) {
      queue.forEach((args) => {
        this.emit(event, ...args);
      });
    }

    return this;
	}
	emit(event, ...args) {
		var listeners = this._events[event];

		if(!listeners || Array.isArray(listeners) && listeners.length == 0) {
			let queue = this.eventQueue[event];

			if(!queue) {
				queue = this.eventQueue[event] = [];
			}

      queue.push(args);
		} else {
			super.emit(event, ...args);
		}
	}
}

const proxyClass = require("@aboutweb/proxyclass");

class ArrayEmitter extends proxyClass.hasInstance(Array, ObservableEmitter) {
  constructor(...data) {
    super();

    if(data) {
      this.push(...data);
    }
  }
  push(...args) {
    super.push(...args);
    this.emit("push", ...args);
    this.emit("change$length", this.length);
    this.emit("change", this);
  }
  pop() {
    let elem = super.pop();

    this.emit("pop", elem);
    this.emit("change$length", this.length);
    this.emit("change", this);

    return elem;
  }
  splice(...args) {
    let elems = super.splice(...args);

    this.emit("splice", ...args);
    this.emit("change$length", this.length);
    this.emit("change", this);

    return elems;
  }
  unshift(...args) {
    super.unshift(...args);

    this.emit("unshift", ...args);
    this.emit("change$length", this.length);
    this.emit("change", this);
  }
  shift() {
    let elem = super.shift();

    this.emit("shift");
    this.emit("change$length", this.length);
    this.emit("change", this);

    return elem;
  }

  set(newValue) {
    while(super.pop()) {}
    super.push(...newValue);

    this.emit("set", this);
    this.emit("change$length", this.length);
    this.emit("change", this);
  }
  static get [Symbol.species]() { return Array; }
}

class ObjectEmitter extends ObservableEmitter {
  constructor(data) {
    super();

    if(data) {
      this.subscribe(data);
    }
  }
  subscribe(data) {
    Object.keys(data).forEach(function(key) {
      let value = data[key];

      Object.defineProperty(this, key, {
        enumerable : true,
        configurable : true,
        get : function() {
          return value;
        },
        set : (
          value instanceof ObservableEmitter
            ?function(newValue) {
              value.set(newValue);
              this.emit("change$"+key, newValue);
            }
            :function(newValue) {
              value = newValue;
              this.emit("change$"+key, newValue);
            }
        )
      });
    }, this);
  }
  unsubscribe(...keys) {
    keys.forEach(function(key) {
      delete this[key];
    }, this);
  }
  set(newValue) {
    this.unsubscribe(...Object.keys(this));
    this.subscribe(newValue);
    this.emit("set", this);
  }
}

class ObserableProxy extends ObservableEmitter {
  constructor(data = {}) {
    super();

    let self = this;
    this.anyChanges = [];
    this.data = data;

    return this.proxy = new Proxy(data, {
      get(target, property) {
        let value = self[property];

        if(property in self) {
          return self[property];
        }

        return data[property];
      },
      set(target, property, value) {
        if(property in self) {
          return Reflect.set(self, property, value);
        }

        let curr = target[property];

        if(curr == value) {
          return true;
        }

        if(curr instanceof ObservableEmitter) {
          if(curr.set(value).length == 0) {
            return true;
          }
        } else {
          Reflect.set(target, property, value);
        }

        self.anyChanges.forEach((anyChange) => {
          if(anyChange.properties.indexOf(property) >= 0) {
            anyChange.listener.call(self.proxy, [property]);
          }
        });

        self.emit("change$"+property, value);
        self.emit("change", property, value);


        return true;
      },
      defineProperty(target, property, descriptor) {
        let curr = target[property];

        Reflect.defineProperty(target, property, descriptor);

        self.anyChanges.forEach((anyChange) => {
          if(anyChange.properties.indexOf(property) >= 0) {
            anyChange.listener.call(self.proxy, [property]);
          }
        });

        self.emit("change$"+property, value);
        self.emit("change", prop, value);

        return true;
      },
      deleteProperty(target, property) {
        Reflect.deleteProperty(target, property);
        self.emit("delete$"+property);
        self.emit("delete", property);
        return true;
      }
    });
  }
  any(properties, listener) {
    this.anyChanges.push({
      properties, listener
    });
  }
  assign(value, mode = "assign") {
    let data = this.data;

    let changes = [];

    for(let property in value) {
      let curr = data[property];

      if(curr == value[property]) {
        continue;
      }

      if(curr && curr[mode]) {
        if(curr[mode](value[property], mode).length == 0) {
          continue;
        }
      } else {
        curr = data[property] = value[property];
      }

      changes.push(property);
      this.emit("change$"+property, curr);
    }

    this.anyChanges.forEach((anyChange) => {
      let matches = anyChange.properties.filter(
        (property) => changes.indexOf(property) >= 0
      );

      if(matches.length) {
        anyChange.listener.call(this.proxy, matches);
      }
    });

    return changes;
  }
  set(value) {
    Object.keys(this.data).forEach((property) => {
      if(!(property in value)) {
        delete this[property];
      }
    });

    return this.assign(value, "set");
  }
}

export default ObservableEmitter;
export { ArrayEmitter as ArrayObserver, ObjectEmitter as ObjectObserver, ObserableProxy as ProxyObserver };
