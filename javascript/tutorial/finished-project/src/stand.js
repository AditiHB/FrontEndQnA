// The stand's details. Other files use: import { stand } from './stand.js'
export const stand = {
  name: 'Sunny Lemonade Stand',
  owner: { name: 'Asha', phone: null },
  hours: { open: 9, close: 17 },
  describe() {
    return `${this.name}, open ${this.hours.open}:00 to ${this.hours.close}:00`;
  },
};
