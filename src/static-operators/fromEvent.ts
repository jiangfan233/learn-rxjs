import { fromEvent } from "rxjs/observable/fromEvent";


const button = document.createElement("button");
button.innerHTML = "click me";

let count = 0;

const counter = document.createElement("span");
counter.innerHTML = count.toString();

const app = document.querySelector("#app");
app?.appendChild(counter);
app?.appendChild(button);


const clicks$ = fromEvent(button, "click");
clicks$.subscribe(
    () => counter.innerHTML = (++count).toString(),
)


