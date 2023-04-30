import { Observable, Subscriber } from "rxjs";
import { of } from "rxjs/observable/of";

// this 是对 fakemap 函数的执行上下文做了限制，即：
// Observable.fakemap
function fakemap<T, R>(this: Observable<T>, project: (value: T) => R) {
    const that = this;
    // 当这个Observable被订阅的时候，
    // project(value)这个新值会被传递给下游
    // 但并不会直接计算 project(value)，
    // 只有当调用next方法时才会计算
    return new Observable((observer: Subscriber<R>) => {
        // 这里this所处的环境是 箭头函数，this自动指向外部的 this
        // 如果这里把箭头函数改写为普通函数，程序直接报错
        // console.log(this === that);  // true
        const subscription = this.subscribe({
            next: value => {
                try {
                    observer.next(project(value));
                } catch(err) {
                    observer.error(err);
                }
            },
            error: err => observer.error(err),
            complete: () => observer.complete(),
        })

        return {
            // map 方法仅仅是映射数据，
            // 所以当下游退订的时候，map方法仅仅“通知”上游退订
            unsubscribe() {
                subscription.unsubscribe();
            }
        }
    })
}

// @ts-ignore
Observable.prototype.fakemap = fakemap;

// 这种写法可以绑定map方法中的this到特定的Observable对象，
// 不因执行上下文改变而改变
// 但不能链式调用
// map.bind(of(1,2,3))((x) => x + 10).subscribe(console.log);

// @ts-ignore
of(1,2,3).fakemap(x => x + 10).subscribe(console.log);


