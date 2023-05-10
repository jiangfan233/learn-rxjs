import { merge } from "rxjs/observable/merge";
import { timer } from "rxjs/observable/timer";

// 下面两个都在 Observable.prototype 上添加了方法
import "rxjs/add/operator/map";
import "rxjs/add/operator/take";
import { Observable, Subscriber, Subscription } from "rxjs";
import { interval } from "rxjs/observable/interval";
import { fromEvent } from "rxjs/observable/fromEvent";


const fakeMerge = (...rest: any[]) => {
    const concurrent = rest[rest.length - 1];
    let obsArr: Observable<any>[], restArr: Observable<any>[], records: boolean[];
    if(typeof concurrent === "number") {
        obsArr = rest.slice(0, concurrent);
        restArr = rest.slice(concurrent, -1);
    } else {
        obsArr = rest as Observable<any>[];
        restArr = [];
    }
    // records用于记录当前并行数据源（concurrent）的订阅关系，true===已退订、数据源已完结
    records = Array(obsArr.length).fill(false);

    return Observable.create((observer: Subscriber<any>) => {
        let subs: Subscription[];

        const subscribe = (obs$: Observable<any>, index: number) => {
            return obs$.subscribe(
                val => observer.next(val),
                err => {
                    observer.error(err);
                    subs && subs.forEach(sub => sub.unsubscribe());
                },
                () => {
                    // 当一个数据源完结的时候，根据index拿到这个数据源并退订
                    // 取出新的数据源，并更新index的订阅关系。
                    if(subs[index]) {
                        subs[index].unsubscribe();
                        records[index] = true;
                        if(restArr.length > 0) {
                            subs[index] = subscribe(restArr.shift()!, index);
                            records[index] = false;
                        }
                    }
                    // 当所有数据源都完结的时候，fakeMerge 产生的Observable也应该完结
                    if(records.every(record => record === true)) {
                        observer.complete();
                    }
                },
            )
        }

        subs = obsArr.map((obs$, index) => {
            return subscribe(obs$, index);
        })

        return {
            unsubscribe() {
                subs && subs.forEach(sub => sub.unsubscribe());
            }
        }
    })
}


// const source1$ = timer(0, 1000).map(x => x + "A").take(2);
// const source2$ = timer(500, 1000).map(x => x + "B").take(3);

// // concurrent===2：只有当前两个数据源完结的时候第三个才有机会入场
// // const source3$ = merge(source1$, source2$, interval(1000), 2);
// const source3$ = fakeMerge(source1$, source2$, interval(1000), 2);

// source3$.take(10).subscribe(
//     console.log,
//     console.error,
//     () => console.log("done")
// )



const app = document.querySelector("#app");
const button = document.createElement("button");
button.innerHTML = "click"
app?.appendChild(button);

// 实测在移动端中，一次点击可以收到两次信号，touchend在前，click在后，
// 但只需要一个，这个时候只需要取最新的一个就可以了(是否有switchLatest或类似功能的操作符？？)
let count = 1;
merge(fromEvent(button, "click"), fromEvent(button, "touchend"), 1).subscribe(() => {
    button.innerHTML = (count++).toString();
})