import { forkJoin } from "rxjs/observable/forkJoin";
import { timer } from "rxjs/observable/timer";
import { take } from "rxjs/operators";

// forkjoin 等待所有bservable对象都完结（completed）时候把所有observable对象的最后一个数据组合后吐出
forkJoin(
    timer(0, 500).pipe(take(10)),
    timer(3000, 1000).pipe(take(5)),
    (a, b) => `${a}-${b}` 
).subscribe(console.log)

