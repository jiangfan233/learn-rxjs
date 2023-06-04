import { interval } from "rxjs/observable/interval";
import { defaultIfEmpty, isEmpty, first, take, map } from "rxjs/operators";
import { empty } from "rxjs/observable/empty";

// empty().pipe(
//   // isEmpty(),
//   defaultIfEmpty("this defalut value"),
// ).subscribe(console.log);

