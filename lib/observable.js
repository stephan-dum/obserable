const EventEmitter = require('events');

class ObservableEmitter extends EventEmitter {
	constructor() {
		super();

    this.eventQueue = {};
	}
	on(event, listener) {
		super.on(event, listener)

    let queue = this.eventQueue[event]

    if(queue) {
      queue.forEach((args) => {
        this.emit(event, ...args)
      })
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

export default ObservableEmitter;
