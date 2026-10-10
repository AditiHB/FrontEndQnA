import {
  stand,
  menu,
  initialStock,
  addToCart,
  setQuantity,
  removeFromCart,
  reduceStock,
  Order,
  TakeAwayOrder,
  StandError,
  orderNumbers,
  createStore,
} from './index.js';
import { filterMenu } from './menu.js';
import { debounce } from './perf.js';
import { safeUrl } from './security.js';
import { getOrders, sendOrder } from './api.js';
import {
  loadCart,
  saveCart,
  loadSettings,
  saveSettings,
  loadDraftName,
  saveDraftName,
} from './storage.js';
import { renderMenu, renderCart, renderServerOrders, renderReport, setMessage } from './ui.js';
import { watchKitchen } from './board.js';
import { loadWhenVisible, runReportInWorker } from './sections.js';

const topBar = document.querySelector('#top-bar');
const tableInfo = document.querySelector('#table-info');
const backLink = document.querySelector('#back-link');
const themeButton = document.querySelector('#theme-toggle');
const searchBox = document.querySelector('#search');
const menuList = document.querySelector('#menu');
const cartList = document.querySelector('#cart');
const cartTotal = document.querySelector('#cart-total');
const form = document.querySelector('#order-form');
const message = document.querySelector('#message');
const board = document.querySelector('#board');
const ordersSection = document.querySelector('#orders-section');
const ordersList = document.querySelector('#server-orders');
const reportSection = document.querySelector('#report-section');
const reportStatus = document.querySelector('#report-status');
const reportList = document.querySelector('#report');
const layoutInfo = document.querySelector('#layout-info');

const params = new URLSearchParams(location.search);
const table = params.get('table');
const debug = params.has('debug'); // add ?debug to the address to see timings in the Console

const store = createStore({
  cart: loadCart(),
  stock: initialStock,
  settings: loadSettings(),
  query: '',
});
const orderIds = orderNumbers();
let latestOrders = null; // the last list we got from the server

const cleanup = new AbortController();
const { signal } = cleanup;

// Time a piece of work with performance.mark / measure. (Measure first, then optimise!)
function measure(label, work) {
  performance.mark(`${label}-start`);
  work();
  performance.mark(`${label}-end`);
  const entry = performance.measure(label, `${label}-start`, `${label}-end`);
  if (debug) console.log(`${label} took ${entry.duration.toFixed(2)} ms`);
}

function applyTheme({ theme }) {
  document.body.classList.toggle('dark', theme === 'dark');
  themeButton.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

function drawMenu({ stock, query }) {
  const items = filterMenu(menu, query);
  renderMenu(menuList, items, stock);
  if (items.length === 0) {
    menuList.textContent = 'Nothing on the menu matches that.';
  }
}

// Redraw ONLY what changed. A new reference (!==) means "this part changed".
let shown = {};
function render(state) {
  if (state.stock !== shown.stock || state.query !== shown.query) {
    measure('draw menu', () => drawMenu(state));
  }
  if (state.cart !== shown.cart) {
    renderCart(cartList, cartTotal, state.cart);
    saveCart(state.cart);
  }
  if (state.settings !== shown.settings) {
    applyTheme(state.settings);
    saveSettings(state.settings);
  }
  shown = state;
}

function change(update) {
  try {
    store.update(update);
    setMessage(message, '');
  } catch (error) {
    if (!(error instanceof StandError)) throw error;
    setMessage(message, error.message, 'error');
  }
}

const applySearch = debounce((query) => {
  store.update((state) => ({ ...state, query }));
}, 250);

const saveDraft = debounce(saveDraftName, 300);

function onSearchInput(event) {
  applySearch(event.target.value);
}

function onNameInput(event) {
  saveDraft(event.target.value);
}

function onMenuClick(event) {
  const button = event.target.closest('button[data-action="add"]');
  if (!button) return;
  const { id } = button.closest('[data-id]').dataset;
  change((state) => ({ ...state, cart: addToCart(state.cart, id, 1, state.stock) }));
}

function onCartClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { id } = button.closest('[data-id]').dataset;
  const { action } = button.dataset;
  change((state) => {
    if (action === 'remove') {
      return { ...state, cart: removeFromCart(state.cart, id) };
    }
    const current = state.cart.find((line) => line.itemId === id)?.quantity ?? 0;
    const quantity = action === 'inc' ? current + 1 : current - 1;
    return { ...state, cart: setQuantity(state.cart, id, quantity, state.stock) };
  });
}

function onThemeClick() {
  store.update((state) => ({
    ...state,
    settings: { ...state.settings, theme: state.settings.theme === 'dark' ? 'light' : 'dark' },
  }));
}

async function onSubmit(event) {
  event.preventDefault();
  const { cart } = store.getState();
  if (cart.length === 0) {
    setMessage(message, 'Your cart is empty. Add something tasty first!', 'error');
    return;
  }

  const data = new FormData(form);
  const customer = String(data.get('customer')).trim() || 'friend';
  const OrderType = data.get('takeAway') ? TakeAwayOrder : Order;
  const order = OrderType.fromCart({ id: orderIds.next().value, customer, cart });

  store.update((state) => ({ ...state, cart: [], stock: reduceStock(state.stock, order.lines) }));
  form.reset();
  saveDraft.cancel(); // a pending save must not bring the old name back
  saveDraftName('');
  setMessage(message, `Thank you, ${customer}! ${order.describe()}`);

  saveOnServer(order);
  await watchKitchen(board, order);
}

async function saveOnServer(order) {
  try {
    const saved = await sendOrder(order, { table });
    setMessage(
      message,
      `Thank you, ${order.customer}! Your order is saved on the server as #${saved.id}.`,
    );
    await refreshOrders();
  } catch (error) {
    setMessage(message, `We could not save your order online: ${error.message}`, 'error');
  }
}

async function refreshOrders() {
  try {
    latestOrders = await getOrders();
    renderServerOrders(ordersList, latestOrders);
  } catch (error) {
    setMessage(message, `Could not load recent orders: ${error.message}`, 'error');
  }
}

async function loadReport() {
  reportStatus.textContent = 'Crunching 1,000,000 sales in a Web Worker...';
  try {
    renderReport(reportList, await runReportInWorker(1_000_000));
    reportStatus.textContent = 'Done!';
  } catch (error) {
    reportStatus.textContent = error.message;
  }
}

let scrollQueued = false;
function onScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    topBar.classList.toggle('scrolled', window.scrollY > 10);
    scrollQueued = false;
  });
}

window.addEventListener('error', (event) => console.error('Something broke:', event.error));
window.addEventListener('unhandledrejection', (event) => {
  console.error('A promise failed and nobody caught it:', event.reason);
});

// --- Start up ---
document.querySelector('#stand-name').textContent = stand.name;
document.querySelector('#stand-hours').textContent =
  `Open ${stand.hours.open}:00 to ${stand.hours.close}:00`;
if (table) {
  tableInfo.textContent = `Table ${table}`; // textContent, never innerHTML: the address is untrusted
}

// The address is untrusted: show the "back" link only if it is a normal web address.
const backUrl = safeUrl(params.get('back'));
if (backUrl) {
  backLink.href = backUrl;
  backLink.hidden = false;
}

form.elements.customer.value = loadDraftName();

store.subscribe(render);
render(store.getState());

menuList.addEventListener('click', onMenuClick, { signal });
cartList.addEventListener('click', onCartClick, { signal });
form.addEventListener('submit', onSubmit, { signal });
form.elements.customer.addEventListener('input', onNameInput, { signal });
searchBox.addEventListener('input', onSearchInput, { signal });
themeButton.addEventListener('click', onThemeClick, { signal });
window.addEventListener('scroll', onScroll, { passive: true, signal });
window.addEventListener('pagehide', () => cleanup.abort(), { once: true });

loadWhenVisible(ordersSection, refreshOrders, { signal });
loadWhenVisible(reportSection, loadReport, { signal });

const refreshTimes = setInterval(() => {
  if (latestOrders) renderServerOrders(ordersList, latestOrders);
}, 30_000);

const resizeObserver = new ResizeObserver(([entry]) => {
  const width = Math.round(entry.contentRect.width);
  requestAnimationFrame(() => {
    layoutInfo.textContent = `Page width: ${width}px (${width < 700 ? 'narrow' : 'wide'} layout)`;
  });
});
resizeObserver.observe(document.body);

signal.addEventListener(
  'abort',
  () => {
    clearInterval(refreshTimes);
    applySearch.cancel();
    saveDraft.cancel();
    resizeObserver.disconnect();
  },
  { once: true },
);
