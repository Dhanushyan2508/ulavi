/**
 * Extracts all unique email addresses from OCR lines.
 *
 * @param {string[]} lines - Cleaned OCR lines
 * @returns {string[]} An array of unique, lowercase email addresses
 */
export function parseEmails(lines) {
  if (!lines || !Array.isArray(lines)) return [];

  // Match standard email formats
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = [];

  lines.forEach(line => {
    const matches = line.match(emailRegex);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.trim().toLowerCase();
        if (!emails.includes(cleaned)) {
          emails.push(cleaned);
        }
      });
    }
  });

  return emails;
}
