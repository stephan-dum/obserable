# Observable

Observer and hook into changes made to Objects or Arrays. Events will not get emitting until there is at least on listener assigned to it.

> This implementation uses [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). Please view [CanIUse](https://caniuse.com/#feat=proxy) for more information on browser support.

## General Events
+ `.on('change', function(property, value))`
  if any property changes
+ `.on('change$'+property, function(value))`
  when ever property changes

## ArrayObserver
  Inherits from Array and Observable

### Methods

+ `set(newValue : Array)`
  removes all old entries and inserts the new data

### Special Events
+ `.on('push', function(...rows : Array<any>))`

+ `.on('pop', function())`

+ `.on('unshift', function(...rows : Array<any>))`

+ `.on('shift', function())`

+ `.on('splice', function(index : Int, amount : Int, ...rows : Array<any>))`

+ `.on('set', function(newValue : Array<any>))`

+ `.on('change$length', function(newValue : Int))`

### Example

```javascript
let ao = new ArrayObserver();

let ul = document.createElement("ul");
let childNodes = ul.childNodes;

function createLI(row, next = null) {
  let li = document.createElement("li");
  li.textContent = row;
  ul.insertBefore(li, next);
}
function removeLI(index) {
  ul.removeChild(childNodes[index]);
}

var listeners =  {
  push : function(...rows) {
    rows.forEach(createLI)
  },
  pop : function() {
    removeLI(childNodes.length-1);
  }
  shift : function() {
    if(childNodes.length) {
      removeLI(0);
    }
  },
  unshift(...rows) {
    let next = childNodes[0] || null;

    rows.forEach((row) => {
      createLI(row, next);
    })
  },
  splice : function(index, amount, ...rows) {    
    let curr = amount;

    while(curr--) {
      removeLI(index);
    }

    curr = childNodes[index];

    rows.forEach((row) => {
      createLI(row, curr);
    });
  }
};

for(key in listeners) {
  ao.on(key, listeners[key]);
}

ao.push("second");
ao.unshift("first");
ao.push("last");

```

## ProxyObserver

Inherits from Obserable. When using set or assign events with `.any` will get triggered in one single commit.

### Methods

+ `set(newValue : Object)`
  removes all old entries and inserts the new data

+ `assign(newValue : Object, mode : Enum["assign", "set"] = "assign")`
  assign newValue to old entries

+ `any(events : Array, callback : Function)`
  if any of this events is fired the callback function will be invoked.

### Special Events
+ `.on('delete', function(property : String))`

+ `.on('delete$'+property, function())`

### Examples
```javascript

  let calc = new ProxyObserver({
    a : 1,
    b : 2,
    c : 3
  });

  calc.any(["a", "b"], function() {
    this.c = this.a+this.b;
  });

  calc.on("change$c", function(c) {
    console.log("new c:", c);
  });

  calc.set({
    a : 2,
    b : 3
  });
})

```
