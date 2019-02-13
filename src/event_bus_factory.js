const EventEmitter = require('eventemitter3');
EventEmitter.prototype.dispatch = EventEmitter.prototype.emit;

export default function createEventBus() {
  return new EventEmitter();
}
