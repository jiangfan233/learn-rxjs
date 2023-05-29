import { interval } from "rxjs/observable/interval";
import { combineAll, take } from "rxjs/operators";
import { map } from "rxjs/operators";



const ho$ = interval(1000).pipe(
    take(2),
    map(x => interval(1500).pipe(
        map(y => x + ":" + y),
        take(2),
    ))
)

ho$.pipe(
    combineAll()
)
// ho$
.subscribe(
    console.log,
    console.error,
    () => console.log("completed"),
)
