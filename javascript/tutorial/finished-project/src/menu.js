import { deepFreeze } from './freeze.js';

// The menu never changes while the app runs, so we freeze it. Nobody can change a price by accident.
const menu = deepFreeze([
  {
    id: 'lemonade',
    name: 'Lemonade',
    emoji: '🍋',
    pricePaise: 4000,
    category: 'drink',
  },
  {
    id: 'mango',
    name: 'Mango Juice',
    emoji: '🥭',
    pricePaise: 6000,
    category: 'drink',
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    emoji: '🧊',
    pricePaise: 5000,
    category: 'drink',
  },
  {
    id: 'cookie',
    name: 'Choc Cookie',
    emoji: '🍪',
    pricePaise: 2500,
    category: 'snack',
  },
  {
    id: 'sandwich',
    name: 'Cheese Sandwich',
    emoji: '🥪',
    pricePaise: 8000,
    category: 'snack',
  },
]);

// How many of each item we start the day with. This starting note never changes either.
// (Stock that goes down as we sell lives in the store as a NEW object each time.)
export const initialStock = deepFreeze({
  lemonade: 10,
  mango: 8,
  'iced-tea': 6,
  cookie: 12,
  sandwich: 5,
});

export function findItem(itemId) {
  return menu.find((item) => item.id === itemId);
}

export default menu;

// Keep the items whose name contains what the person typed (ignoring capital letters).
// With an empty search it returns the SAME array, so nothing needs redrawing.
export function filterMenu(items, query) {
  const text = query.trim().toLowerCase();
  return text === '' ? items : items.filter(({ name }) => name.toLowerCase().includes(text));
}
