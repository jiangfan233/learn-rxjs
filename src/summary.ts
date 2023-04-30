import { Observable, Subscriber } from "rxjs";


const onSubscribe = (observer: Subscriber<number>) => {
    let counter = 1;
    const timerId = setInterval(() => {
        observer.next(counter++);
        if(counter > 3) {
            clearInterval(timerId);
        }
    }, 1000)
}

const source$ = new Observable(onSubscribe);

const subscription = source$.subscribe(
    console.log,
    console.error,
    () => console.log("done"),
)

setTimeout(() => {
    subscription.unsubscribe();
}, 3500)

