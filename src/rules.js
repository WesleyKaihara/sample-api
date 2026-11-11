const BASE_RATE = { regular: 0, premium: 0.1, vip: 0.2 };
const BULK_THRESHOLD = 100;
const BULK_BONUS = 0.05;
const MAX_RATE = 0.25;

export function calculateDiscount({ amount, customerType }) {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return { error: 'amount must be a number greater than 0' };
  }
  if (!Object.hasOwn(BASE_RATE, customerType)) {
    return { error: `customerType must be one of: ${Object.keys(BASE_RATE).join(', ')}` };
  }

  let rate = BASE_RATE[customerType];
  if (amount >= BULK_THRESHOLD) rate += BULK_BONUS;
  rate = Math.min(Math.round(rate * 10000) / 10000, MAX_RATE);

  const discount = Math.round(amount * rate * 100) / 100;
  const total = Math.round((amount - discount) * 100) / 100;
  return { amount, customerType, rate, discount, total };
}
