import { createCustomElement } from '@angular/elements';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { ToyStars } from 'toy-ui';

// 1. Start a tiny Angular app (without any page of its own).
// 2. Turn the ToyStars component into a custom HTML tag.
// 3. Tell the browser about the new tag.
createApplication({ providers: [provideBrowserGlobalErrorListeners()] }).then((app) => {
  const element = createCustomElement(ToyStars, { injector: app.injector });
  customElements.define('toy-stars-widget', element);
});
