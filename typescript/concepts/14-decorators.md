# 14. Decorators

> **Like I'm 5:** A decorator is a sticker you put on a toy to add a special power, like "this toy can be seen by the teacher". The sticker changes how the toy behaves, without you rewriting the toy.

## Class decorator

```ts
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Config {
  name = 'app';
}
```

## Method decorator (logging example)

```ts
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    console.log(`Calling ${key} with`, args);
    return original.apply(this, args);
  };
  return descriptor;
}

class Calc {
  @log
  add(a: number, b: number) { return a + b; }
}
```

## Two decorator systems

- **Legacy (experimental) decorators**: enabled with `experimentalDecorators: true` in tsconfig. Angular and many older libraries (like NestJS and older Angular code) use this style.
- **Standard (TC39) decorators**: the modern JavaScript standard, supported in TypeScript 5.0 and later, without the flag. The signature is different.

Check your project's tsconfig and framework docs before writing a decorator. The two styles do not work the same way.

## Where you see them

```ts
@Component({ selector: 'app-hello', template: '<p>Hi</p>' })
export class HelloComponent {
  @Input() name = '';
}
```

Angular uses decorators to attach metadata to classes.

## Important points
- Decorators are mostly used by frameworks. For everyday app code, prefer functions and composition.
- Keep decorators simple. Hidden behavior is hard to debug.
- Confirm which decorator style your framework expects before writing one.
