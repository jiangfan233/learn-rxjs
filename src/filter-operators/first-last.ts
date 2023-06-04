import { interval } from "rxjs";
import { take, map, first, last } from "rxjs/operators";

interval(1000).pipe(
  take(4),
  map(x => x * 10),
  // first(
  //   x => x > 0 && x % 24 === 0,
  //   (x, index) => [x, index],
  //   // default value if no value found
  //   [-1, -1]  
  // ),

  // 只有当上游数据完结的时候last才会吐出数据
  last(
    x => x > 0 && x % 3 === 0,
    // default value if no value found
    [-1, -1],
    )
).subscribe(
  console.log
)