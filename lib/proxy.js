import ObservableEmitter  from "./observable.js";

class ObserableProxy extends ObservableEmitter {
  constructor(data = {}) {
    super();

    let self = this;
    this.anyChanges = [];
    this.data = data;

    return this.proxy = new Proxy(data, {
      get(target, property) {
        let value = self[property]

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
        self.emit("delete$"+property)
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

export default ObserableProxy;
