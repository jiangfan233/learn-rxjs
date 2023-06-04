import { Observable, Subscriber } from "rxjs";
import { interval } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { of } from "rxjs";


const fakeTakeUntil =
  (switch$: Observable<any>) => (source$: Observable<any>) =>
    Observable.create((observer: Subscriber<any>) => {
      const switchSub = switch$.subscribe(
        (_) => {
          observer.complete();
        },
        (err) => observer.error(err),

        // https://rxjs.dev/api/index/function/takeUntil
        // If the notifier doesn't emit any value and completes then takeUntil will pass all values.
        () => {}
      );

      // 如果 switch$ 是同步的数据流，程序执行到这里observer就已经closed了
      !observer.closed && source$.subscribe({
        next(val) {
          // console.log("next");
          observer.next(val);
        }
      });

      return switchSub;
    });

const completed = Observable.create((observer: Subscriber<any>) => {
  observer.complete();
});

const sub = interval(200)
// of("tsssss")
  .pipe(
    // takeUntil(interval(500))
    fakeTakeUntil(interval(500))
    // fakeTakeUntil(of(1))
    // takeUntil(of(1))
  )
  .subscribe(console.log, console.error, () => console.log("done"));

setTimeout(() => {
  sub.unsubscribe()
}, 450)