import { Observable, Subscriber } from "rxjs";
import { of } from "rxjs/observable/of";
import { filter, map } from "rxjs/operators";

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
        // 这里的this指向的是调用 fakemap方法的Observable对象(Observable.fakemap(project))
        // fakemap方法返回一个新的Observable对象，并拿着旧Observable对象的订阅关系（subscription）
        // 所以自定义操作符（custom operator）需要返回一个保持上游订阅关系的新的Observable对象
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
// of(1,2,3).fakemap(x => x + 10).subscribe(console.log);

// ********************** 分割线 *****************************

// 这里（高阶函数）和上面的不同在于：
// 使用 obs$ 取代了this, 保证函数式编程范式
// 既可以以参数的形式获取到context上下文（旧的Observable对象），
// 又利用这个参数对结果进行了处理
function fakeMapPro<T, R>(project: (value: T) => R) {
    return function(obs$: Observable<T>) {
        return new Observable((observer: Subscriber<R>) => {
            const subscription = obs$.subscribe(
                (value: T) => observer.next(project(value)),
                (err: Error) => observer.error(err),
                () => observer.complete(),
            )

            return {
                unsubscribe() {
                    subscription.unsubscribe();
                }
            }
        })
    }
}

// 上面的简化写法，使用箭头函数彻底摆脱this困扰
// 但是要求函数语义理解更深刻
// fakeMapProSimp 接受一个 projet 映射函数作为参数，
// 返回一个新的函数，新的函数接受一个 obs$ 作为参数，返回一个新的Observable对象
const fakeMapProSimp = <T, R>(project: (value: T) => R) => (obs$: Observable<T>) => new Observable((observer: Subscriber<R>) => {
    const subscription = obs$.subscribe(
        (value: T) => observer.next(project(value)),
        (err: Error) => observer.error(err),
        () => observer.complete(),
    )

    return {
        unsubscribe() {
            subscription.unsubscribe();
        }
    }
})

// let 是pipe的前身，可理解为“让他来做”
// 但是let只能接受一个操作符参数
// of(1,2,3)
//     .let(filter((x: number) => x % 2 === 0))
//     .let(fakeMapPro(x => x + 9))
//     .subscribe(console.log);


// pipable
of(1,2,3,4).pipe(
    filter(x => x % 2 === 0),
    map(x => x + 1000),
).subscribe(console.log)