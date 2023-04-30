import { of } from "rxjs/observable/of";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";


// of(1,2,3).map(x => x * x).subscribe(console.log);
of(1, 2, 3, 4)
    .filter(x => x % 2 === 0)
    .map(x => x * 2)
    .subscribe(console.log)