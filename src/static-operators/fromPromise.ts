import { fromPromise } from "rxjs/observable/fromPromise";
import { mergeMap } from "rxjs/operators";


// fromPromise(Promise.resolve("hello")).subscribe(console.log);
// fromPromise(Promise.reject("error ssss")).subscribe(
//     console.log,
//     console.error,
//     () => console.log("done"),
// )

fromPromise(fetch('https://jsonplaceholder.typicode.com/todos/1'))
    .pipe(
        mergeMap(res => fromPromise(res.json()))
    )
    .subscribe(
        res => console.log(res),
        console.error,
        () => console.log("done"),
    )