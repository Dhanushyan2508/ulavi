/**
 * Extracts the contact person's name from OCR lines.
 * Employs a scoring heuristic favoring capitalized words of length 2-4 near the top of the card.
 *
 * @param {string[]} lines - Cleaned OCR lines
 * @param {string[]} [addressLines=[]] - Lines already parsed as part of the address
 * @returns {{ name: string, confidence: number }} The detected name and its score
 */
export function parseName(lines, addressLines = []) {
  if (!lines || !Array.isArray(lines)) {
    return { name: '', confidence: -999 };
  }

  // Keywords to penalize (since personal names shouldn't contain job titles or company indicators)
  const designationKeywords = [
    "manager", "developer", "engineer", "director", "founder", "ceo", "cto", "cfo", "coo", "vp", 
    "vice president", "president", "executive", "consultant", "designer", "analyst", "hr", "human resources",
    "specialist", "coordinator", "representative", "officer", "agent", "lead", "head", "partner", "investigator", "theorist"
  ];

  const companyKeywords = [
    "solutions", "technologies", "tech", "systems", "software", "private", "limited", "pvt", "corp", 
    "company", "industries", "group", "inc", "co", "llc", "ltd", "association", "agency", "organization", "partners"
  ];

  // Common address indicators to avoid name mismatch
  const addressKeywords = /\b(st|street|rd|road|ave|avenue|blvd|boulevard|lane|ln|drive|dr|way|court|ct|suite|ste|floor|fl|bldg|building|box|plaza|plz|highway|hwy|p\.o\.)\b/i;

  let bestName = "";
  let bestScore = -999;

  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();

    // 1. Skip lines matching addresses, emails, or websites
    if (addressLines.includes(line)) return;
    if (lower.includes('@') || lower.includes('www.') || lower.includes('http')) return;

    let score = 0;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    // 2. Word Count: human names are almost always 2 to 3 words (sometimes 4 including middle names/initials)
    if (words.length >= 2 && words.length <= 4) {
      score += 15;
    } else if (words.length === 1) {
      score += 5; // A single word is possible (e.g. mononym) but less likely than a full name
    } else {
      score -= 15; // 5+ words is highly likely to be a tagline or address block
    }

    // 3. Capitalization: words in a name usually start with uppercase letters (e.g., "John Smith")
    const isCapitalized = words.every(w => /^[A-Z]/.test(w));
    if (isCapitalized) {
      score += 15;
    }

    // 4. Position: Names are typically positioned at the top of a business card (lines 0, 1, or 2)
    if (idx === 0) {
      score += 15;
    } else if (idx === 1) {
      score += 10;
    } else if (idx === 2) {
      score += 5;
    }

    // 5. Heavy penalties for matches in company, title, or address dictionaries
    const hasCompanyKeyword = companyKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(lower);
    });
    if (hasCompanyKeyword) {
      score -= 25;
    }

    const hasDesignationKeyword = designationKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(lower);
    });
    if (hasDesignationKeyword) {
      score -= 25;
    }

    if (addressKeywords.test(lower)) {
      score -= 25;
    }

    // Personal names rarely contain digits
    if (/\d/.test(line)) {
      score -= 25;
    }

    // Exclude labels
    if (/^(tel|phone|p|t|f|fax|email|e|m|web|w|site|add|adr|address)[:\.\s]*/i.test(line)) {
      score -= 30;
    }

    if (score > bestScore) {
      bestScore = score;
      bestName = line;
    }
  });

  return {
    name: bestName,
    confidence: bestScore
  };
}
