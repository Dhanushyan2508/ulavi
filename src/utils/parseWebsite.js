/**
 * Extracts all unique website URLs from OCR lines.
 * Handles explicit URLs (http/https/www) and naked domains, while ignoring email domains.
 *
 * @param {string[]} lines - Cleaned OCR lines
 * @returns {string[]} An array of unique, clean website URLs
 */
export function parseWebsite(lines) {
  if (!lines || !Array.isArray(lines)) return [];

  // Regexes for explicit websites and common naked domains
  const explicitWebRegex = /\b(https?:\/\/[^\s]+|www\.[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}[^\s]*)\b/gi;
  const nakedDomainRegex = /\b([a-zA-Z0-9\-]+\.(com|co|io|net|org|edu|gov|in|uk|me|us|biz|info|tech|online|solutions|systems|software|agency|group|consulting|ltd|xyz|website))\b/gi;
  
  const rawMatches = [];

  lines.forEach(line => {
    // 1. Remove any email addresses from the line to prevent matching email domains
    let lineToTest = line;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    lineToTest = lineToTest.replace(emailRegex, '');

    // 2. Check for explicit web URLs
    const explicitMatches = lineToTest.match(explicitWebRegex);
    if (explicitMatches) {
      explicitMatches.forEach(w => {
        let cleaned = w.trim();
        // Clean label prefixes like "Web:", "W:", "Website:"
        cleaned = cleaned.replace(/^(web|website|w|site)[:\.\s]*/i, '');
        cleaned = cleaned.replace(/^[\s\-\(\)\/\\•\:]+|[\s\-\(\)\/\\•\:]+$/g, '').trim();
        if (cleaned) rawMatches.push(cleaned);
      });
    }

    // 3. Check for naked domains (e.g. company.com)
    const nakedMatches = lineToTest.match(nakedDomainRegex);
    if (nakedMatches) {
      nakedMatches.forEach(w => {
        let cleaned = w.trim();
        
        // Clean label prefixes
        cleaned = cleaned.replace(/^(web|website|w|site)[:\.\s]*/i, '');
        cleaned = cleaned.replace(/^[\s\-\(\)\/\\•\:]+|[\s\-\(\)\/\\•\:]+$/g, '').trim();
        
        if (cleaned) {
          const lower = cleaned.toLowerCase();
          // Exclude edge cases like file names or numbers ending in dots
          if (lower.startsWith('.') || lower.endsWith('.')) return;
          rawMatches.push(cleaned);
        }
      });
    }
  });

  // 4. Deduplicate (e.g. if we matched both "example.com" and "www.example.com")
  // We normalize to the root domain and keep the format that has more indicators (like www. or http://)
  const uniqueWebsites = [];
  
  rawMatches.forEach(w => {
    const normalized = w.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/i, '');
    
    const existingIdx = uniqueWebsites.findIndex(uw => {
      const uwNormalized = uw.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/i, '');
      return uwNormalized === normalized;
    });

    if (existingIdx === -1) {
      uniqueWebsites.push(w);
    } else {
      // Overwrite existing with a version containing more URL details (like www. or https://)
      const existing = uniqueWebsites[existingIdx];
      const hasDetailedIndicators = w.toLowerCase().includes('www') || w.toLowerCase().includes('http');
      const existingHasDetailed = existing.toLowerCase().includes('www') || existing.toLowerCase().includes('http');
      
      if (hasDetailedIndicators && !existingHasDetailed) {
        uniqueWebsites[existingIdx] = w;
      }
    }
  });

  return uniqueWebsites;
}
