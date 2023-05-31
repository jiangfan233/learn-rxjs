import { interval } from "rxjs/observable/interval";
import { map, take } from "rxjs/operators";
import { switchAll, exhaust } from "rxjs/operators";



const ho$ = interval(500).pipe(
  take(4),
  map(x => interval(300 * (x + 1)).pipe(
    take(2),
  	map(n => x + String.fromCharCode(n + 97))
  )),
  // switchAll 与 exhuast 
  // 对于新到的子数据流，switchAll和exhaust采用的是完全相反的策略
  // switchAll 喜新厌旧
  // 只要上游吐出新的 子数据流，switchAll会直接订阅“新的”并退订“旧的”
  // 根据上一点，switchAll产生的Observable只有在上游完结且当前子数据流也完结情况下才会完结

  // exhaust 从一而终
  // exhaust 会先耗尽当前的子数据流(current)，之后等待并重新订阅 上游吐出的“新的”子数据流(next)
  // 在exhuast订阅新的子数据流之前，上游可能已经吐出不止一个子数据流，但因为current未完结，因此这些数据流被忽略
  
  // switchAll()
  exhaust()
)

ho$
