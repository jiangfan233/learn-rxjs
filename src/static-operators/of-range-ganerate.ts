// 静态操作符，
// 只能用在上游产生数据流（Observable对象），
// 不能接受Observable对象作为参数
import { of } from "rxjs/observable/of";
import { range } from "rxjs/observable/range";
import { generate } from "rxjs/observable/generate";


// 以同步方式产生数据，所有数据（1，2，3）都在一个Observable对象中
of(1,2,3)

// range：从1开始产生一组长度为100的数字序列，
// 同步产生数据
range(1, 100)

// ******************************************

let res = [];
for(let i = 0; i < 10; i += 2) {
    res.push(i * 100);
}

// generate 以同步方式自定义生成一组数据
// generate的工作方式和for类似，但使用函数代替for中的表达式，比for强大得多
// generate中的函数应使用纯函数
generate(
    // 初始状态
    1,
    // 满足条件时继续生成
    value => value < 10,
    // 状态变化的方式
    value => value + 2,
    // 一个状态如何产生结果
    value => value * 100
)
// .subscribe(console.log);











