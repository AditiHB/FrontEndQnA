// Tiny money helpers. Money is always whole paise (100 paise = ₹1).
export function toRupees(paise) {
  return paise / 100;
}

export const lineTotal = (pricePaise, quantity) => pricePaise * quantity;
