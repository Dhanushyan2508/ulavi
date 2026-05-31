/**
 * Cleans raw OCR output text to prepare it for field mapping.
 * Removes duplicate spaces, control characters, standalone noise symbols, 
 * and deduplicates repeated lines (case-insensitive).
 *
 * @param {string} rawText - The raw text string from the OCR response
 * @returns {string[]} An array of cleaned, non-empty text lines
 */
export function cleanOCRText(rawText) {
  if (!rawText) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map(line => {
      // 1. Remove control characters and non-printable characters
      let cleaned = line.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      
      // 2. Normalize whitespace (tabs, multiple spaces) to a single space
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      
      // 3. Strip starting/trailing garbage characters commonly found in OCR noise,
      // but retain plus (+) and parentheses () which are standard in phone numbers.
      cleaned = cleaned.replace(/^[\s|•\-_~\\\/#\*\.]+|[\s|•\-_~\\\/#\*\.]+$/g, '').trim();
      
      return cleaned;
    })
    .filter(line => {
      // Filter out empty lines
      if (!line) return false;
      
      // Filter out standalone punctuation noise (e.g. ",", ".", "|", "_", "-", "~")
      if (line.length === 1 && !/[a-zA-Z0-9]/i.test(line)) return false;
      
      return true;
    });

  // 4. Deduplicate lines (case-insensitive and whitespace-stripped duplicates)
  // This handles situations where OCR API reads the same line twice (e.g., in columned cards)
  const uniqueLines = [];
  const seenNormalized = new Set();

  for (const line of lines) {
    const normalized = line.toLowerCase().replace(/\s+/g, '');
    if (!seenNormalized.has(normalized)) {
      seenNormalized.add(normalized);
      uniqueLines.push(line);
    }
  }

  return uniqueLines;
}
