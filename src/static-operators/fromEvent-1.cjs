const EventEmitter = require("events");
const { fromEvent } = require("rxjs/observable/fromEvent")

// @ts-ignore
const emitter = new EventEmitter();

const source$ = fromEvent(emitter, "msg");

source$.subscribe(
    (msg) => console.log("emitter: ", msg),
)

emitter.emit("msg", 1);
emitter.emit("msg", 2);
emitter.emit("ahhhh", "world");
emitter.emit("msg", 3);

module.exports = {}