// Not exported: only used inside this file. Other files cannot reach it.
function makeDiscount(percentOff) {
  return (amountPaise) => Math.round((amountPaise * (100 - percentOff)) / 100);
}

export const discountRules = {
  kids: makeDiscount(10),
  happyHour: makeDiscount(20),
};
