import { RenderMode, ServerRoute } from '@angular/ssr';

// For each address, who draws the page, and when?
//   Prerender = once, when we build (fast, but frozen until the next build)
//   Server    = fresh on every visit (always up to date)
//   Client    = in the browser (for pages about ONE person)
export const serverRoutes: ServerRoute[] = [
  // The home page shows settings from config.json and the toy list. Both can change
  // WITHOUT a new build, so the server draws it fresh each time.
  { path: '', renderMode: RenderMode.Server },

  // A toy page changes with the toy in the address, so the server draws it on request.
  { path: 'product/:id', renderMode: RenderMode.Server },

  // Everything else is about ONE person (cart, wishlist, login, orders, admin),
  // so the browser draws it. A server cannot know what is in your cart.
  { path: '**', renderMode: RenderMode.Client },
];
