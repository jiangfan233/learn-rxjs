import { of } from "rxjs/observable/of";
import { interval } from "rxjs/observable/interval";
import { delay, repeatWhen } from "rxjs/operators";
import { Observable, Subscriber, Subscription } from "rxjs";
import { empty } from "rxjs/observable/empty";
import { fromEvent } from "rxjs/observable/fromEvent";


// of(1).pipe(
//     repeatWhen((obs$) => obs$.delay(1000))
// ).subscribe(console.log)

let str = "";

const source$ = Observable.create((observer: Subscriber<string>) => {
    console.log("subscribe");

    observer.next(str += "e");
    observer.complete();

    return {
        unsubscribe() {
            console.log("unsubscribe");
        }
    }
})

const notifier = <T>(notification$: Observable<T>): Observable<T> => {
    // @ts-ignore
    return interval(2000);
    // return notification$.delay(3000);
}

// source$.pipe(
//     fakeRepeatWhen(notifier)
//     // repeatWhen(notifier)
// )
// .subscribe(
//     console.log,
//     console.error,
//     () => console.log("done")
// )


type Fn = <T>(obs$: Observable<T>) => Observable<T>;

function fakeRepeatWhen<T>(fn: Fn) {
    const controller$ = fn(of(1));

    // fakeRepeatWhen 是一个高阶函数，
    // 这里接受上游的Observable对象，并给下游返回一个新的Observable对象
    return (obs$: Observable<T>) => Observable.create((observer: Subscriber<T>) => {
        let subscription: Subscription;
        let sub: Subscription;

        const nextFunc = () => {
            // console.log("nextDunc")
            subscription = obs$.subscribe(
                (value: T) => observer.next(value),
                (err: Error) => {
                    observer.error(err);
                    subscription && subscription.unsubscribe();
                    sub.unsubscribe();
                },
                () => {
                    // 
                    // observer.complete();
                    subscription && subscription.unsubscribe();
                }
            )

            return {
                unsubscribe() {
                    subscription.unsubscribe();
                }
            }
        };

        const errorFunc = <T>(observer: Subscriber<T>) => observer.error; 

        const completeFunc = <T>(observer: Subscriber<T>) => () => {
            sub && sub.unsubscribe();
            controller$.subscribe(nextFunc, errorFunc, completeFunc(observer));
        }

        nextFunc();

        sub = controller$.subscribe(
            nextFunc,
            errorFunc(observer),
            completeFunc(observer)
        )

        return {
            unsubscribe() {
                sub.unsubscribe();
            }
        }
    })
}


const app = document.querySelector("#app");
const button = document.createElement("button");
button.innerHTML = "click"
app?.appendChild(button);

source$.pipe(
    // repeatWhen(() => fromEvent(button, "click"))
    fakeRepeatWhen(() => fromEvent(button, "click"))
).subscribe(console.log)