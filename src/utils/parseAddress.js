/**
 * Extracts a multi-line business address from OCR text lines.
 * Recognizes US, UK, Indian, and Canadian address markers/postal codes 
 * and groups contiguous lines associated with the address.
 *
 * @param {string[]} lines - Cleaned OCR lines
 * @returns {{ address: string, addressLines: string[] }} The compiled address string and the list of address lines
 */
export function parseAddress(lines) {
  if (!lines || !Array.isArray(lines)) {
    return { address: '', addressLines: [] };
  }

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+?\d[\d\s\-\(\)]{8,}\d)/;
  const websiteRegex = /(www\.[^\s]+)|(https?:\/\/[^\s]+)/i;

  // Broad set of address keywords including street types, office labels, landmarks, and structural markers
  const addressKeywords = /\b(st|street|rd|road|ave|avenue|blvd|boulevard|lane|ln|drive|dr|way|court|ct|suite|ste|floor|fl|bldg|building|box|plaza|plz|highway|hwy|p\.o\.|navy yard|baker st|industrial way|whiteraven|broadway|road|sector|phase|landmark|near|opposite|opp|behind|floor|block|blk|tower|twr|plot|shop|office|room|rm|building|bldg|apartments|apt|mansion|mansions|square|sq|circle|circ|park|pk|estate)\b/i;
  
  // Postal/ZIP code regexes
  const zipRegex = /\b\d{5}(-\d{4})?\b/;
  const postalCodeRegex = /\b[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d\b/i; // Canadian
  const ukPostcodeRegex = /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i; // UK
  const indPinRegex = /\b\d{6}\b/; // Indian (6 digits)
  const indPinSpaceRegex = /\b\d{3}\s\d{3}\b/; // Indian with space (e.g. 560 001)

  // 1. Calculate an address confidence score for every line
  const scoredLines = lines.map((line, index) => {
    let score = 0;
    const lower = line.toLowerCase();

    // Disqualify lines containing emails or websites
    if (emailRegex.test(line) || websiteRegex.test(line)) {
      return { line, index, score: -100, isExplicitAddress: false };
    }

    // Heavy penalty for pure phone lines
    if (phoneRegex.test(line)) {
      const digitRatio = line.replace(/\D/g, '').length / line.length;
      if (digitRatio > 0.6 && !zipRegex.test(line) && !indPinRegex.test(line)) {
        return { line, index, score: -50, isExplicitAddress: false };
      }
    }

    // Positive points for postal/ZIP codes
    const hasZip = zipRegex.test(line);
    const hasUKPost = ukPostcodeRegex.test(line);
    const hasCanPost = postalCodeRegex.test(line);
    const hasIndPin = indPinRegex.test(line) || indPinSpaceRegex.test(line);

    if (hasZip || hasUKPost || hasCanPost || hasIndPin) {
      score += 35;
    }

    // Positive points for street/office/landmark keywords
    if (addressKeywords.test(lower)) {
      score += 25;
    }

    // Positive points if the line starts with a house/office number (e.g. "101", "Suite 5B", "Shop 4")
    if (/^\d+[A-Za-z]?\b/i.test(line) || /^(suite|ste|room|rm|plot|flat|bldg|building|shop|block|blk|floor|fl)\s+\d+/i.test(line)) {
      score += 15;
    }

    // Negative indicators for names/job titles/companies to avoid overlap
    const designationKeywords = /\b(manager|developer|engineer|director|founder|ceo|cto|cfo|coo|vp|president|executive|consultant|designer|analyst|specialist|officer|lead|head|partner|theorist)\b/i;
    const companyKeywords = /\b(solutions|technologies|tech|systems|software|private|limited|pvt|corp|industries|group|inc|llc|ltd|agency|partners)\b/i;

    if (designationKeywords.test(lower)) score -= 20;
    if (companyKeywords.test(lower)) score -= 15;

    return {
      line,
      index,
      score,
      isExplicitAddress: score >= 20
    };
  });

  // 2. Identify contiguous blocks of address lines
  // If a line is explicitly determined to be an address, we expand the block 
  // to adjacent lines that have non-negative scores (which often represent 
  // city/state or building names without explicit keywords).
  const addressLineIndices = new Set();

  scoredLines.forEach((item, idx) => {
    if (item.isExplicitAddress) {
      addressLineIndices.add(idx);

      // Scan backwards
      let prevIdx = idx - 1;
      while (prevIdx >= 0) {
        const prevItem = scoredLines[prevIdx];
        if (prevItem.score >= 0 && !addressLineIndices.has(prevIdx)) {
          addressLineIndices.add(prevIdx);
          prevIdx--;
        } else {
          break;
        }
      }

      // Scan forwards
      let nextIdx = idx + 1;
      while (nextIdx < scoredLines.length) {
        const nextItem = scoredLines[nextIdx];
        if (nextItem.score >= 0 && !addressLineIndices.has(nextIdx)) {
          addressLineIndices.add(nextIdx);
          nextIdx++;
        } else {
          break;
        }
      }
    }
  });

  // 3. Extract and compile results
  const sortedIndices = Array.from(addressLineIndices).sort((a, b) => a - b);
  const addressLines = sortedIndices.map(idx => lines[idx]);
  const address = addressLines.join(', ');

  return {
    address,
    addressLines
  };
}
