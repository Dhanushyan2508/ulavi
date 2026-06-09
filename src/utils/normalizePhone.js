/**
 * Normalizes a phone number by keeping only digits and leading plus sign (+).
 * Strips formatting like parentheses, hyphens, and spaces.
 *
 * @param {string} phone - The phone number to normalize
 * @returns {string} The normalized phone number
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
}
