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
    // return interval(2000);
    let count = 0;
    return notification$.pipe(
        delay(1000)
    ).takeWhile((val, index) => count++ < 3);
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
                    // 这里只退订上游，repeat的工作交给controller$执行
                    // observer.complete();
                    subscription && subscription.unsubscribe();
                    subscribeContoller();
                }
            )

            return {
                unsubscribe() {
                    subscription.unsubscribe();
                }
            }
        };

        const completeFunc = () => {
            sub && sub.unsubscribe();
            // observer.complete();
            subscribeContoller();
        }

        nextFunc();

        // 期望：
        // 1、controller$数据流complete的时候能够下游也能正常结束，
        // 2、controller$数据流complete的时候能够在重新订阅自身
        
        // 实际：
        // controller$数据流只是不再产生数据，不再调用nextFunc了
        // 实际上当controller$数据流complete的时候，并没有调用observer.complete
        // 即下游并没有被通知到。
        function subscribeContoller() {
            sub = controller$.subscribe(
                nextFunc,
                observer.error,
                completeFunc
            )
        }

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
    // fakeRepeatWhen(() => fromEvent(button, "click").take(3))
    fakeRepeatWhen(notifier)
    // repeatWhen(notifier)
).subscribe(console.log, console.error, () => console.log("done"));