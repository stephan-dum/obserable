# reactiv-object

```javascript

let po = new ProxyObserver({
  "hallo" : "wert1",
  "id2" : "wert2"
});

po.id3 = "wert3";
delete po.hallo;

po.on("delete", function(property) {
  console.log("deleted", property);
});

po.on("change", function(property, value) {
  console.log("changed", property, "==", value)
})

po.on("change$id3", function(value) {
  console.log("changed id3 ==", value);
})

```
