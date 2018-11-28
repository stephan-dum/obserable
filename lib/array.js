import ObservableEmitter  from "./observable.js";
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

export default ArrayEmitter;
