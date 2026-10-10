export interface OrderLine {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

// What the shopper sends when they press "Place order".
export interface NewOrder {
  name: string;
  email: string;
  address: string;
  giftWrap: boolean;
  notes: string;
  giftTags: string[];
  lines: OrderLine[];
  total: number;
}

// What the server sends back: the same thing, plus a number and a date.
export interface Order extends NewOrder {
  id: string;
  createdAt: string;
  userEmail: string;
}
