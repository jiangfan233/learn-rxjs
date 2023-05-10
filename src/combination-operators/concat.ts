import { of } from "rxjs/observable/of";

import { interval } from "rxjs/observable/interval";

// 打包完成 24.6 kb，静态操作符
import { concat } from "rxjs/observable/concat";
// 打包完成 25.0 kb，实例操作符
// import "rxjs/add/operator/concat";


const source1$ = of(1,2,3);
const source$2 = of(4,5,6);

// concat 把若干数据源头尾相连，如果一个数据源没有“尾”（不会complete），那后面的数据源永远不会上场
// const source3$ = concat(interval(1000), source1$, source$2);

const source3$ = concat(source1$, source$2);

source3$.subscribe(console.log);

