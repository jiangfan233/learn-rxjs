import { interval } from "rxjs/observable/interval";
import { zipAll, take } from "rxjs/operators";
import { map } from "rxjs/operators";


const ho$ = interval(400).pipe(
    take(3),
    map(x => interval(400 * x + 400).pipe(
        map(y => x + ":" + y),
        take(2),
    ))
)

// ho$

// 现象：
// 1、ho$ 若永不完结，该数据流永不吐出数据
// 2、ho$ 吐出一组数据(列表)的时间点 与 该组数据中最后到达的那个数据(单一数据)到达时间点基本相同
// 推测
// ho$完结之后才会按子数据流到达顺序依次订阅所有子数据流
ho$.pipe(
    zipAll()
)

