import { classifyPhone } from './classifyPhone';
import { classifyEmail } from './classifyEmail';

/**
 * Prioritizes an array of phone numbers and returns the best candidate for primary contact.
 * Rank order: Mobile (3) > Office (2) > Landline (1) > Fax (0).
 *
 * @param {string[]} phones - List of phone numbers
 * @param {string[]} [ocrLines=[]] - Optional original OCR lines for classification context
 * @returns {string} The prioritized primary phone number, or empty string
 */
export function prioritizePhones(phones, ocrLines = []) {
  if (!phones || !Array.isArray(phones) || phones.length === 0) return '';

  const scored = phones.map(phone => {
    const type = classifyPhone(phone, ocrLines);
    let score = 0;
    if (type === 'Mobile') score = 3;
    else if (type === 'Office') score = 2;
    else if (type === 'Landline') score = 1;
    else if (type === 'Fax') score = 0;

    return { phone, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);
  
  // Debug logging
  console.log('[Debug] Scored Phones for Prioritization:', scored);

  return scored[0].phone;
}

/**
 * Prioritizes an array of email addresses and returns the best candidate for primary contact.
 * Rank order: Personal (3) > Admin (2) > Sales (1) > Support (0).
 * Deprioritizes generic info@, support@, sales@, etc.
 *
 * @param {string[]} emails - List of email addresses
 * @returns {string} The prioritized primary email, or empty string
 */
export function prioritizeEmails(emails) {
  if (!emails || !Array.isArray(emails) || emails.length === 0) return '';

  const scored = emails.map(email => {
    const type = classifyEmail(email);
    let score = 0;
    if (type === 'Personal') score = 3;
    else if (type === 'Admin') score = 2;
    else if (type === 'Sales') score = 1;
    else if (type === 'Support') score = 0;

    return { email, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Debug logging
  console.log('[Debug] Scored Emails for Prioritization:', scored);

  return scored[0].email;
}
