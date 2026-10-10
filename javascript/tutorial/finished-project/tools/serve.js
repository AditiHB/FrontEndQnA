// tools/serve.js - a tiny web server for our files AND a tiny pretend "orders" API.
// Start it with: node tools/serve.js     (stop it with Ctrl+C)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseHeaders } from './headers.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT ?? 3000);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

// Our "database": a plain array in memory. It is emptied whenever the server restarts.
const orders = [];

function sendJson(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...baseHeaders,
  });
  response.end(JSON.stringify(data));
}

// A request body arrives in pieces. A request is an ASYNC ITERABLE (Step 14!), so we can `for await` it.
async function readJson(request) {
  let text = '';
  for await (const chunk of request) {
    text += chunk;
  }
  return JSON.parse(text);
}

async function handleApi(request, response, pathname) {
  if (pathname === '/api/orders' && request.method === 'GET') {
    return sendJson(response, 200, orders.toReversed().slice(0, 10)); // newest 10
  }

  if (pathname === '/api/orders' && request.method === 'POST') {
    let order;
    try {
      order = await readJson(request);
    } catch {
      return sendJson(response, 400, { error: 'That was not valid JSON' });
    }
    const goodName = typeof order?.customer === 'string' && order.customer.trim() !== '';
    const goodLines = Array.isArray(order?.lines) && order.lines.length > 0;
    if (!goodName || !goodLines) {
      return sendJson(response, 400, { error: 'An order needs a customer name and some lines' });
    }
    const saved = {
      id: orders.length + 1,
      customer: order.customer.trim(),
      takeAway: Boolean(order.takeAway),
      table: order.table ?? null,
      visitorId: order.visitorId ?? null,
      lines: order.lines,
      receivedAt: new Date().toISOString(),
    };
    orders.push(saved);
    return sendJson(response, 201, saved);
  }

  if (pathname === '/api/slow') {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // on purpose: to practise timeouts
    return sendJson(response, 200, { ok: true });
  }

  return sendJson(response, 404, { error: 'No such API' });
}

async function serveFile(response, pathname) {
  const file = normalize(join(root, pathname === '/' ? 'index.html' : pathname));

  // Never serve anything outside our project folder.
  if (!file.startsWith(root)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
      ...baseHeaders,
    });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
}

const server = createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, 'http://localhost');
    if (pathname.startsWith('/api/')) {
      await handleApi(request, response, pathname);
    } else {
      await serveFile(response, pathname);
    }
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'Something went wrong on the server' });
  }
});

server.listen(port, () => {
  console.log(`Lemonade Stand is open at http://localhost:${port}`);
});
