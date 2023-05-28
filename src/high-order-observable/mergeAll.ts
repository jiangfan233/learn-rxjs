
import { Observable, Subscriber, Subscription } from "rxjs";
import { interval } from "rxjs/observable/interval";
import { take } from "rxjs/operators";
import { map } from "rxjs/operators";


// mergeAll和concatAll都是把 Observable 对象降低一维
// concatAll 是按先后顺序把 子数据流 头(subscribe)尾(completed)相连，
// 因此
// 1、最后形成的数据流时间比任何一个子数据流都要长；
// 2、某时刻的数据只属于一个 子数据流；
// 3、子数据流的订阅时间可能晚于 该数据流 在下游的出现时间；
// 4、若中间的子数据流不 complete，后面的子数据流永远不会被订阅。
// 5、concatAll 可比喻为 单线程

// mergeAll 是只要有子数据流在 下游 出现，就会被订阅。
// 因此
// 1、最后形成的数据流执行时间可能和 某一个子数据流 时间相同。
// 2、某时刻的数据可能源于多个数据流
// 3、子数据流在下游的出现时间和订阅时间基本一致（逻辑上时间相同）
// 4、所有的子数据流都会被订阅
// 5、mergeAll 可比喻为 并发
const fakeMergeAll = () => (obs$:Observable<Observable<any>>) => {
    const subscriptionArr: Subscription[] = [];
    return Observable.create((observer: Subscriber<any>) => {
        const hoSubscription = obs$.subscribe(
            subObs$ => {
                const sub = subObs$.subscribe(
                    val => observer.next(val),
                    err => observer.error(err),
                    () => {
                        if(hoSubscription.closed && 
                            subscriptionArr
                                // 执行到这里的时候，该Observable已经可以 "认为" completed了，
                                // 但是还没有被标记为closed 
                                .filter(item => item !== sub)
                                .every(item => item.closed)) {
                            observer.complete();
                        }
                    }
                )
                subscriptionArr.push(sub);
            }
        )

        return {
            unsubscribe() {
                subscriptionArr.forEach(sub => sub.unsubscribe());
                hoSubscription.unsubscribe();
            }
        }
    })
}


// 高阶Observable仍然可以操作数据，
// 产生两个Observable对象，这两个对象都有自己的生命周期
const ho$ = interval(1000).pipe(
    take(3),
    map(x => interval(1500).pipe(
        map(y => x + ":" + y),
        take(2),
    ))
)

const sub = ho$.pipe(
    // concatAll()
    fakeMergeAll()
)
// ho$
.subscribe(
    console.log,
    console.error,
    () => console.log("complete"),
)

setTimeout(() => {
    sub.unsubscribe();
}, 5000)
