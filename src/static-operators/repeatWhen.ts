import { of } from "rxjs/observable/of";
import { interval } from "rxjs/observable/interval";
import { delay, repeatWhen } from "rxjs/operators";
import { Observable, Subscriber, Subscription } from "rxjs";
import { empty } from "rxjs/observable/empty";
import { fromEvent } from "rxjs/observable/fromEvent";
import { never } from "rxjs/observable/never";


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

export function fakeRepeatWhen<T>(fn: Fn) {
    const controller$ = fn(of(1));

    // fakeRepeatWhen 是一个高阶函数，
    // 这里接受上游的Observable对象，并给下游返回一个新的Observable对象
    return (obs$: Observable<T>) => Observable.create((observer: Subscriber<T>) => {
        let subscription: Subscription;
        let sub: Subscription;
        // 表示该 controller$ 是否还有数据（还未complete）
        let controllerHaveData = false;

        const nextFunc = () => {
            controllerHaveData = true;
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
            if(controllerHaveData) {
                subscribeContoller();
                controllerHaveData = false;
            } else {
                observer.complete();
            }
        }

        nextFunc();

        // 期望：
        // 1、controller$数据流complete的时候能够下游也能正常结束，
        // 2、controller$数据流complete的时候能够在重新订阅自身
        
        // 实际：
        // controller$数据流只是不再产生数据，不再调用nextFunc了
        // 实际上当controller$数据流complete的时候，并没有调用observer.complete
        // 即下游并没有被通知到。
        
        // 解决方法：
        // 当一个Observable 还有数据产生时，会先调用observer.next，
        // 然后在某一个时刻调用 observer.complete
        // 如果该Observable 已经没有数据，会直接调用 observer.complete
        // 所以只需要维护一个根据 observer.next 是否调用的来改变状态的状态变量即可
        // 该变量同时也表示Observable是否已经complete

        // 上述方法缺陷：
        // 如果fakeRepeatWhen(notifier)中notifier返回一个cold Observable，
        // 该Observable在每次调用完observer.next 之后调用 observer.complete，
        // 又会导致 controller$ 重新订阅 => 无限循环
        // 关键在于如何知道controller$ 什么时候应该重新订阅，什么时候应该调用observer.complete
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