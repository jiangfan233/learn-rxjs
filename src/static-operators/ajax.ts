import { ajaxGetJSON } from "rxjs/observable/dom/AjaxObservable";
import { fromEvent } from "rxjs/observable/fromEvent";


const button = document.createElement("button");
button.innerText = "Get Title";

const app = document.querySelector("#app");

const title = document.createElement("p");
app?.appendChild(button);
app?.appendChild(title);


fromEvent(button, "click").subscribe(
    () => ajaxGetJSON("https://jsonplaceholder.typicode.com/todos/1",).subscribe(
        (res: any) => {
            title.innerHTML = res.title || "ahh";
        }
    )
)