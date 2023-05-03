import { Observable, Subscriber, Subscription } from "rxjs";
import "rxjs/operator/repeat";


const source$ =  Observable.create((observer: Subscriber<number>) => {
    console.log("on subscribe");
    setTimeout(() => observer.next(1), 1000);
    setTimeout(() => observer.next(2), 2000);
    setTimeout(() => observer.next(3), 3000);

    setTimeout(() => observer.complete(), 4000);

    return {
        unsubscribe() {
            console.log("on unsubscribe");
        }
    }
})

// reapeat产生的数据：1 2 3  1 2 3
// 对数据源订阅了两次、也退订了两次
// 然而repeat无法确定上游是否还有数据，只能等上游主动告知  => complete
// 上有数据完结（comlete）之后，repeat会根据countdown（这里是2）判断是否需要再订阅一次
// const repeated$ = source$.repeat(2);

// repeated$.subscribe(
//     console.log,
//     (err: Error) => console.error(err),
//     () => console.log("complete")
// )

const errorFunc = <T>(err: Error, observer: Subscriber<T>, subscription: Subscription) => {
    observer.error(err);
    subscription.unsubscribe();
}

const nextFunc = <T>(value: T, observer: Subscriber<T>, subscription: Subscription) => {
    try{
        return observer.next(value);
    } catch(err) {
        errorFunc(err as Error, observer, subscription);
    }
}

function fakeRepeat<T>(this: Observable<T>, countdown: number) {
    let subscription: Subscription;

    return Observable.create((observer: Subscriber<T>) => {

        const repeatSubscribe = () => {
            subscription = this.subscribe(
                (value: T) => nextFunc(value, observer, subscription),
                (err: Error) => errorFunc(err, observer, subscription),
                () => {
                    countdown -= 1;
                    if(countdown === 0) {
                        observer.complete();
                        subscription.unsubscribe();
                    } else {
                        subscription.unsubscribe();
                        repeatSubscribe();
                    }
                },
            )
        }

        repeatSubscribe();
    })
}

// @ts-ignore
Observable.prototype.fakeRepeat = fakeRepeat;

const repeated$ = source$.fakeRepeat(2);

repeated$.subscribe(
    console.log,
    (err: Error) => console.error(err),
    () => console.log("complete")
)