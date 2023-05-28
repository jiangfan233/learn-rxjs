import { Observable, Subscriber, Subscription } from "rxjs";
import { interval } from "rxjs/observable/interval";
import { concatAll, take } from "rxjs/operators";
import { map } from "rxjs/operators";




const fakeConcatAll = () => (obs$: Observable<any>) => {
    let obsArr: Observable<any>[] = [];
    let currentSubscription :Subscription | undefined;
    let hoCompleted = false;
    return Observable.create((observer: Subscriber<any>) => {

        const start = () => {
            if(obsArr.length <= 0) return;
            return obsArr.shift()!.subscribe(
                val => observer.next(val),
                err => observer.error(err),
                () => {
                    if(obsArr.length > 0) {
                        currentSubscription = start();
                    } else {
                        currentSubscription = undefined;
                        if(hoCompleted) {
                            observer.complete();
                        }
                    }
                }
            )
        }

        const hoSubscrption = obs$.subscribe(
            subObs => {
                obsArr.push(subObs);
                if(!currentSubscription) {
                    currentSubscription = start();
                }
            },
            err => observer.error(err),
            () => hoCompleted = true        
        )

        return {
            unsubscribe() {
                hoSubscrption.unsubscribe();
                currentSubscription && currentSubscription.unsubscribe();
                obsArr.length = 0;
            }
        }
    })
}


// 高阶Observable仍然可以操作数据，
// 产生两个Observable对象，这两个对象都有自己的生命周期
const ho$ = interval(1000).pipe(
    take(2),
    map(x => interval(1500).pipe(
        map(y => x + ":" + y),
        take(2),
    ))
)

ho$.pipe(
    // concatAll()
    fakeConcatAll()
)
// ho$
.subscribe(
    console.log,
    console.error,
    () => console.log("complete"),
)
