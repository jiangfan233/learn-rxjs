import { interval } from "rxjs";
import { map, take, takeLast } from "rxjs/operators";


interval(500).pipe(
  take(5),
  map(x => x + 10),

  // takeLast 和 last 一样都需要等到上游数据流完结的时候决定吐出哪些数据
  takeLast(3)
).subscribe(
  console.log
)