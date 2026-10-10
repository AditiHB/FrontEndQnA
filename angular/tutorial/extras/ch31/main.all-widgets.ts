import { createCustomElement } from '@angular/elements';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { ToyBadge, ToyStars } from 'toy-ui';
import { ToyLike } from './like-button';

createApplication({ providers: [provideBrowserGlobalErrorListeners()] }).then((app) => {
  const define = (tag: string, component: Parameters<typeof createCustomElement>[0]) =>
    customElements.define(tag, createCustomElement(component, { injector: app.injector }));

  define('toy-stars-widget', ToyStars);
  define('toy-badge-widget', ToyBadge);
  define('toy-like-widget', ToyLike);
});
