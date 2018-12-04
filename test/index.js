const {
  expect
} = require("chai");

const {
  default : Observable,
  ArrayObserver,
  ObjectObserver,
  ProxyObserver
} = require("../dist/index.js");

function testListener(po) {
  it("change listener", function(resolve) {
    po.on("change", function(property, value) {
      expect(property).to.equal("fubar");
      expect(value).to.equal("test");
      resolve()
    });

    po.fubar = "test";
  });

  it("change$property listener", function(resolve) {
    po.fubar = "test";

    po.on("change$fubar", function(value) {
      expect(value).to.equal("test");
      resolve();
    });
  });
}

describe("observable", function() {
  it("should wait for event handlers before emitting any event", function(resolve) {
    let observer = new Observable();
    observer.emit("test");
    observer.on("test", resolve);
  })
})

describe("observable Array", function() {
  let ao;

  beforeEach(() => {
    ao = new ArrayObserver("input");
  });

  it("should be an array", function() {
    expect(Array.isArray(ao)).to.be.true;
    expect(ao.length).to.equal(1);
    expect(ao instanceof Array).to.be.true;
  });

  it("should emit push", function() {
    ao.on("push", () => { resolve(); })

    ao.push("more");
    expect(ao.length).to.equal(2);
    expect(ao[0]).to.equal("input");
    expect(ao[1]).to.equal("more");
  });

  it("changes", function() {
    testListener(ao);
  });
});

describe("observable Proxy", function() {
  let po;

  beforeEach(() => {
    po = new ProxyObserver({
      "hallo" : "wert1",
      "id2" : "wert2"
    });
  });

  it("delete listener", function(resolve) {
    po.on("delete", function(property) {
      expect(property).to.equal("hallo");
      resolve();
    });

    delete po.hallo;
  });

  it("delete$property listener", function(resolve) {
    po.on("delete$hallo", resolve);

    delete po.hallo;
  });

  it("set listener", function() {
    subpo = new ProxyObserver({ "sub" : true });

    po.subpo = subpo;

    po.set({})
  });

  it("set deep property", function(resolve) {
    Promise.all([
      new Promise((resolve, reject) => {
        po.on("delete$hallo", resolve);
      }),
      new Promise((resolve, reject) => {
        po.on("delete$id2", resolve);
      }),
      new Promise((resolve, reject) => {
        po.any(["sub", "stay"], resolve);
      })
    ]).then((args) => {
      resolve();
    });


    po.set({
      sub : {"sub" : true},
      "stays" : "true"
    });

  });

  it("math any", function(resolve) {
    let m = new ProxyObserver({
      a : 1,
      b : 2,
      c : 3
    });

    m.any(["a", "b"], function() {
      this.c = this.a+this.b;
    });

    m.on("change$c", function(c) {
      resolve();
    });

    m.set({
      a : 2,
      b : 3
    });
  })

  it("changes", function() {
    testListener(po);
  });
});
