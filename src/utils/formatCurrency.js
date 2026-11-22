/**
 * Transit Fare Formatting Utilities
 */

export function formatFare(amount) {
  if (typeof amount !== 'number') {
    return typeof amount === 'string' ? amount : '$0.00';
  }
  return `$${amount.toFixed(2)}`;
}
