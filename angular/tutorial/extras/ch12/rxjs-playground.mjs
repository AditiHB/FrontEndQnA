import { of, interval, Subject, BehaviorSubject, take, map, filter, switchMap, debounceTime, forkJoin, timer } from 'rxjs';

// 1. A tiny pipe: numbers flow in, we change them on the way
of(1, 2, 3, 4).pipe(filter((n) => n % 2 === 0), map((n) => n * 10)).subscribe((n) => console.log('even x10:', n));

// 2. Cold: nothing happens until you subscribe
const lazy = of('hello').pipe(map((s) => s.toUpperCase()));
console.log('(before subscribe: nothing yet)');
lazy.subscribe((v) => console.log('got', v));

// 3. Subject: a shout that everyone listening hears
const shout = new Subject();
shout.subscribe((m) => console.log('A heard', m));
shout.next('hi');
shout.subscribe((m) => console.log('B heard', m));
shout.next('bye');

// 4. BehaviorSubject: remembers the latest value
const score = new BehaviorSubject(0);
score.next(5);
score.subscribe((v) => console.log('late listener sees score', v));

// 5. switchMap: the new question cancels the old one
const slow = (x) => timer(100).pipe(map(() => `answer for ${x}`));
const q = new Subject();
q.pipe(switchMap(slow)).subscribe((v) => console.log(v));
q.next('a'); setTimeout(() => q.next('b'), 30);

// 6. forkJoin: wait for all, then give the last of each
forkJoin([timer(50).pipe(map(() => 'toys')), timer(80).pipe(map(() => 'prices'))]).subscribe((r) => console.log('both ready:', r));
