import { Observable, Subscriber } from "rxjs";
import { defer } from "rxjs/observable/defer";
import { of } from "rxjs/observable/of";
import { repeatWhen, takeWhile } from "rxjs/operators";
import { take } from "rxjs/operators";
import { delay } from "rxjs/operators";
import { fakeRepeatWhen } from "./repeatWhen";

// defer接受一个函数，该函数返回真正的Observable数据源
// 一个Observable即使不订阅，在rxjs内部也已经进行了资源调度
// 如果打算提前声明一个Observable但不立刻使用，有不打算让它占据太多资源，
// 这个时候就用 defer
// 同样是不立即订阅，rxjs给defer分配的资源是很少而且可控的
// const source$ = defer(() => of(1,2,3));

// defer和普通Observable在订阅时的表现一致
// source$.subscribe(console.log);


// of(1).pipe(delay(1000), take(3)).subscribe(console.log, console.error, () => console.log("done"))

const fakeDefer = <T>(fn: () => Observable<T>) => {
    let obs$ :Observable<T>

    return Observable.create((observer: Subscriber<T>) => {
        if(!obs$) obs$ = fn();
        const subscription = obs$.subscribe(
            value => observer.next(value),
            err => observer.error(err),
            () => observer.complete()
        )

        return {
            unsubscribe() {
                subscription.unsubscribe();
            }
        }
    })
}

fakeDefer(() => {
    console.log("init source");
    return of(1,2,3);
}).pipe(
    // 正常
    // fakeRepeatWhen((ctrl$) => {
    //     let count = 0;
    //     return ctrl$.pipe(delay(1000), takeWhile((val, index) => count++ < 3))
    // })
    // 有缺陷
    // fakeRepeatWhen((ctrl$) => ctrl$.pipe(delay(1000), take(3)))

    repeatWhen((ctrl$) => ctrl$.pipe(delay(1000), take(3)))
)
.subscribe(console.log, console.error, () => console.log("done"))