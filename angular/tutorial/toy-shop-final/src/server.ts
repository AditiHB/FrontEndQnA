import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';

// Only the real server (not `ng serve`) sends the strict security policy.
const isRealServer = isMainModule(import.meta.url) || !!process.env['pm_id'];

// index.html contains this word as the nonce. For every page we swap in a fresh random one.
const NONCE_PLACEHOLDER = 'CSP_NONCE_PLACEHOLDER';

function contentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    // The server writes style="width: 90%" for the stars. A style attribute cannot carry a nonce,
    // and it cannot run code, so we allow style attributes only.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; ');
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// nginx (or a load balancer) tells us who really asked ("x-forwarded-for") and whether it was https.
// Only believe those headers when the server is reachable ONLY through such a proxy.
const behindProxy = process.env['BEHIND_PROXY'] === 'true';
const angularApp = new AngularNodeAppEngine({
  trustProxyHeaders: behindProxy ? ['x-forwarded-for', 'x-forwarded-proto'] : false,
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * A tiny "are you alive?" page for load balancers, Docker and smoke tests.
 */
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

/**
 * Serve static files from /browser.
 * Files with a hash in their name (main-7U2YD3UK.js) never change, so they are cached for a year.
 * Everything else (config.json, ngsw.json, ngsw-worker.js, ...) must be re-checked every time.
 */
const hashedFile = /-[A-Za-z0-9_-]{8}\.(?:js|css)$/;

app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
      res.setHeader(
        'Cache-Control',
        hashedFile.test(path) ? 'public, max-age=31536000, immutable' : 'no-cache',
      );
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then(async (response) => {
      if (!response) {
        return next();
      }
      if (!isRealServer) {
        return writeResponseToNodeResponse(response, res);
      }
      const nonce = randomBytes(16).toString('base64');
      const html = (await response.text()).replaceAll(NONCE_PLACEHOLDER, nonce);
      res.setHeader('Content-Security-Policy', contentSecurityPolicy(nonce));
      return writeResponseToNodeResponse(new Response(html, response), res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
