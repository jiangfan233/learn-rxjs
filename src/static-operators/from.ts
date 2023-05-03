import { ObservableInput } from "rxjs/Observable";
import { from } from "rxjs/observable/from";

// 接受一个 数组[1,2,3]，并同时产生三个 Observable对象
// from([1,2,3]).subscribe(console.log)


// 接受一个类数组对象，并产生若干（length）个Observable
function toObservable(...rest: any[]) {
    return from(arguments);
}
// toObservable(1, "jiang", ["hello", "world"], { age: 18 }).subscribe(console.log)


function * generateNumber(max: number) {
    for(let i = 0; i < max; i++) {
        yield i;
    }
    return "done!";
}
// from(generateNumber(5) as unknown as ArrayLike<number>).subscribe(console.log);

// 从结果来看，from是把 字符串当作数组处理了，因此最后会得到 若干只包含单个字母的 Observable对象；
// "hello world".split("")
from("hello world").subscribe(console.log);
