import { interval } from "rxjs/observable/interval";
import { timer } from "rxjs/observable/timer";


// interval、timer类似于js中的setInterval 和 setTimeout,功能更强大
// 两者都是异步产生数据

// 每隔1000ms（1s）产生一个数据
// interval(1000).subscribe(console.log)


// 在200ms 后产生一个数据
// timer(200).subscribe(console.log);


const now = new Date();
const later = new Date(now.getTime() + 5000);
// 在某个具体时间点之后产生一个数据
// timer(later).subscribe(console.log);

// 在某个具体时间点及之后的每500ms产生一个数据
// timer(later, 500).subscribe(console.log);