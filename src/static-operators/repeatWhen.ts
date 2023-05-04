import { of } from "rxjs/observable/of";
import { interval } from "rxjs/observable/interval";
import { repeatWhen } from "rxjs/operators";
import { Observable, Subscriber, Subscription } from "rxjs";

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

const notifier = <T>(notification$: Observable<T>) => {
    return interval(2000);
    // return notification$.delay(3000)
}

source$.pipe(
    fakeRepeatWhen(notifier)
    // repeatWhen(notifier)
)
.subscribe(
    console.log,
    console.error,
    () => console.log("done")
)


type Fn = <T>(obs$: Observable<T>) => Observable<T>;

function fakeRepeatWhen<T>(fn: Fn) {
    const controller$ = fn();

    // fakeRepeatWhen 是一个高阶函数，
    // 这里接受上游的Observable对象，并给下游返回一个新的Observable对象
    return (obs$: Observable<T>) => Observable.create((observer: Subscriber<T>) => {
        let subscription: Subscription;
        let sub: Subscription;

        const nextFunc = () => {
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

        sub = controller$.subscribe(
            (_) => nextFunc(),
            (err: Error) => observer.error(err),
            () => observer.complete()
        )

        return {
            unsubscribe() {
                sub.unsubscribe();
            }
        }
    })
}
