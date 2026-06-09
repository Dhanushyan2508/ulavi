/**
 * Extracts all unique mobile, landline, direct, and fax numbers from OCR lines.
 * Filters out common label prefixes and ensures digits count is valid.
 *
 * @param {string[]} lines - Cleaned OCR lines
 * @returns {string[]} An array of unique, formatted phone numbers
 */
export function parsePhones(lines) {
  if (!lines || !Array.isArray(lines)) return [];

  // Match typical phone sequences containing 8 to 15 digits with optional country code,
  // area code parentheses, hyphens, and spaces.
  const phoneRegex = /(\+?\(?\d{1,4}\)?[\s\-\(\)]?\d[\s\-\(\)]?\d[\s\-\(\)]?\d[\s\-\(\)]?\d[\s\-\(\)]?\d[\s\-\(\)]?\d[\s\-\(\)]?\d[\s\-\(\)]?\d[\d\s\-\(\)]*)/g;
  const phones = [];

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Ignore lines that are definitely emails or web URLs to prevent false matches
    if (lowerLine.includes('@') || lowerLine.includes('www.') || lowerLine.includes('http')) {
      return;
    }

    const matches = line.match(phoneRegex);
    if (matches) {
      matches.forEach(match => {
        // Strip common label prefixes (e.g. "Tel:", "Mob:", "Ph:", "T:", "M:", "Direct:", "Fax:")
        let cleaned = match.trim().replace(/^(tel|phone|p|t|f|fax|mobile|mob|m|dir|direct|contact)[:\.\s]*/i, '');
        
        // Remove trailing/leading spaces, brackets, or dashes
        cleaned = cleaned.replace(/^[\s\-\(\)]+|[\s\-\(\)]+$/g, '').trim();

        // Make sure it contains at least 8 digits and at most 16 digits
        const digitCount = cleaned.replace(/\D/g, '').length;
        if (digitCount >= 8 && digitCount <= 16) {
          // Normalize and check for duplicate (by comparing only digits)
          const digits = cleaned.replace(/\D/g, '');
          const isDuplicate = phones.some(p => p.replace(/\D/g, '') === digits);
          if (!isDuplicate) {
            phones.push(cleaned);
          }
        }
      });
    }
  });

  return phones;
}
