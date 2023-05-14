import { Observable, Subscriber } from "rxjs";
import { combineLatest } from "rxjs/observable/combineLatest";
import { interval } from "rxjs/observable/interval";
import { of } from "rxjs/observable/of";
import { timer } from "rxjs/observable/timer";
import { zip } from "rxjs/observable/zip";
import { map, take } from "rxjs/operators";


// zip: 
// 可操作多组数据流，
// zip产出的数据取决于所有数据流中最短的那个 => 并不是所有数据都能获取到
// zip产出数据的速度取决于所有数据流中最慢的那个
// zip(of(1,2,3), interval(1000).pipe(take(2))).subscribe(
//     console.log,
//     console.error,
//     // 产出 [1,0] [2,1] 之后 done
//     () => console.log("done")
// )

//////////////////////////////////////////////

// zip和combineLatest的区别在于
// zip每吐出一个数据集合都需要等待所有数据源吐出数据（数据源的数据是 and 的关系），
// combineLatest 仅仅在第一次吐出数据集合的时候等待所有数据源，后面要任意数据源产生数据都会吐出数据集合（数据源的数据从 and 变为 or）

// combineLatest 第一次需要填充数据集合，因此需要等待所有数据，
// 后面的每一次只要任意数据源产生数据都会吐出数据集合
// combineLatest(
//     timer(500, 1000).pipe(take(3), map(num => String.fromCharCode(num + 65))),
//     timer(1000, 1000).pipe(take(4))
// ).subscribe(
//     console.log,
//     console.error,
//     () => console.log("done")
// )

const fakeCombineLatest = (...rest: Observable<any>[]) => {
    const values = Array(rest.length).fill(null);
    const completeArr = Array(rest.length).fill(false);

    const nextFunc = (val: any, index: number, observer: Subscriber<any[]>) => {
        values[index] = val;
        // 这里仅仅验证 values 中数据的长度
        if(values.every(val => val !== undefined && val !== null)) {
            observer.next(values.slice());
        }
    }

    const completeFunc = (index: number, observer: Subscriber<any[]>) => {
        completeArr[index] = true;
        if(completeArr.every(isCompleted => isCompleted)) {
            observer.complete()
        }
    }

    return Observable.create((observer: Subscriber<any[]>) => {
        rest.forEach((obs$, index) => {
            obs$.subscribe(
                val => nextFunc(val, index, observer),
                error => observer.error(error),
                () => completeFunc(index, observer),
            )
        })
    })
}


// combineLatest(
fakeCombineLatest(
    timer(500, 1000).pipe(take(3), map(val => String.fromCharCode(val + 65))), 
    timer(1000, 1000).pipe(take(4))
).subscribe(
    console.log,
    console.error,
    () => console.log("done")
)



