const {
  expect
} = require("chai");

const {
  default : Observable,
  ArrayObserver,
  ObjectObserver,
  ProxyObserver
} = require("../dist/index.js");

//let ao = new ArrayObserver("input");
/*let po = new ProxyObserver({
  "hallo" : "wert1",
  "id2" : "wert2"
});

po.on("delete", function(prop) {
  console.log("stomthing deleted", prop);
});

po.on("change", function(prop, value) {
  console.log("something chagnes", prop, value)
});

delete po.hallo;
po.something = "fubar";
*/
let po = new ProxyObserver({
  "hallo" : "wert1",
  "id2" : "wert2",
  "sub" : new ProxyObserver({ "sub" : false }),
  "stays" : "true"
});



let m = new ProxyObserver({
  a : 1,
  b : 2,
  c : 3
});

m.any(["a", "b"], function() {
  console.log("a | b");
  
  this.c = this.a+this.b;
});

m.on("change$c", function(c) {
  console.log("new c", c)
});

m.set({
  a : 2,
  b : 3
})


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
  console.log("all done", args)

});


po.set({
  sub : {"sub" : true},
  "stays" : "true"
});


let k = Object.keys(po);

function ba() {
  describe("observable", function() {
    it("should wait for event handlers before emitting any event", function(resolve) {
      let observer = new Observable();
      observer.emit("test");
      observer.on("test", resolve);
    })
  })

  describe("obserable Array", function() {
    let ao = new ArrayObserver("input");

    it("should be an array", function() {
      expect(Array.isArray(ao)).to.be.true;
      expect(ao.length).to.equal(1);

      ao.push("more");

      expect(ao.length).to.equal(2);
      expect(ao[0]).to.equal("input");
      expect(ao[1]).to.equal("more");

    })

  });

  describe("obserable Object", function() {

  });

  describe("obserable Array", function() {

  });

  describe("obserable Proxy", function() {
    let po;

    beforeEach(() => {
      po = new ProxyObserver({
      "hallo" : "wert1",
      "id2" : "wert2"
    });
    });

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

    it("set listener", function(resolve) {
      subpo = new ProxyObserver({ "sub" : true });

      po.subpo = subpo;

      po.set({})
    })
  });
}
