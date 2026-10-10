# 16. DOM & Events

> **Like I'm 5:** The DOM is a family tree of the page. Each element is a family member. `querySelector` finds a person by their name tag. An event is a shout in the house, and it travels up from the room where it started to every room above.

## Finding elements

```js
const title = document.querySelector('h1.title');
const items = document.querySelectorAll('.item');   // NodeList
const byId = document.getElementById('app');
```

## Changing elements

```js
title.textContent = 'Hello';         // safe text
title.classList.add('active');
title.setAttribute('aria-expanded', 'true');
title.style.color = 'teal';

const card = document.createElement('div');
card.textContent = 'New card';
document.querySelector('#list').append(card);
```

Prefer `textContent` over `innerHTML` for user data, to avoid XSS.

## Events

```js
const button = document.querySelector('#save');

button.addEventListener('click', (event) => {
  event.preventDefault();
  console.log('clicked', event.target);
});
```

## Bubbling and capturing

An event starts at the target, goes down (capture), then bubbles up through parents.

```js
document.addEventListener('click', handler, { capture: true }); // runs on the way down
```

## Event delegation

Instead of adding a listener to every item, add one listener to the parent and check the target.

```js
document.querySelector('#list').addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (!item) return;
  select(item.dataset.id);
});
```

Delegation handles items added later, and uses less memory.

## Removing listeners

```js
const controller = new AbortController();
button.addEventListener('click', onClick, { signal: controller.signal });
controller.abort();   // removes the listener
```

## Important points
- Use event delegation for lists.
- Use `{ passive: true }` for scroll and touch listeners when you don't call `preventDefault`.
- Keep DOM work batched to avoid layout thrashing: read everything first, then write.
