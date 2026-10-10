# 24. Angular Elements (Web Components)

> **Like I'm 5:** A Web Component is a custom tag you invent, like `<order-widget>`. Any website can use it, even one that doesn't use Angular.

> **Learn it by doing:** build this step by step in the tutorial: [Chapter 31: Web components (Angular Elements)](../tutorial/31-web-components.md).

## Key concepts
- **Web Components** are reusable custom HTML elements that work in any framework or no framework.
- **Angular Elements** (`@angular/elements`) packages an Angular component as a custom element.
- Use it to embed Angular widgets in non-Angular pages, or to share UI between different frameworks.

## Creating a custom element

```bash
ng add @angular/elements
```

```ts
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';

(async () => {
  const app = await createApplication({ providers: [provideHttpClient()] });
  const OrderWidget = createCustomElement(OrderWidgetComponent, { injector: app.injector });
  customElements.define('order-widget', OrderWidget);
})();
```

## Using it in plain HTML

```html
<order-widget customer-id="42" theme="dark"></order-widget>
<script src="main.js" type="module"></script>
```

Attributes are converted to inputs (`customer-id` → `customerId`). Outputs become DOM `CustomEvent`s.

```ts
el.addEventListener('orderSelected', (e: CustomEvent) => console.log(e.detail));
```

## Styling and encapsulation
- Use `ShadowDom` encapsulation for true isolation, or `Emulated` for simpler integration.
- Global styles from the host page do not reach a Shadow DOM component. Expose CSS custom properties for theming.

## Pitfalls
- Each element bundles its own Angular runtime unless you share it carefully. Keep the number of elements small or use a single shared bootstrap.
- Change detection and zone integration differ across frameworks. Test the integration thoroughly.
- Serializing complex objects through attributes is limited. Pass them as properties on the element instead.

## Important points
- Web Components are a good fit for design systems used across several apps and frameworks.
- For a single Angular app, prefer normal components.
