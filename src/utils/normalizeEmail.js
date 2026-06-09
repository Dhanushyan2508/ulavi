/**
 * Normalizes an email address to a trimmed, lowercase string.
 *
 * @param {string} email - The email address to normalize
 * @returns {string} The normalized email address
 */
export function normalizeEmail(email) {
  if (!email) return '';
  return email.toLowerCase().trim();
}
