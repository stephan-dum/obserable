import ObservableEmitter  from "./observable.js";

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

export default ObjectEmitter;
