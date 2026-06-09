/**
 * Extracts the company name from OCR text lines.
 * Uses a scoring system based on standard keywords, position, and case patterns.
 *
 * @param {string[]} lines - Cleaned OCR lines
 * @param {string[]} [addressLines=[]] - Lines already parsed as part of the address
 * @returns {{ company: string, confidence: number }} The detected company name and its score
 */
export function parseCompany(lines, addressLines = []) {
  if (!lines || !Array.isArray(lines)) {
    return { company: '', confidence: -999 };
  }

  // Keywords that commonly identify corporate entities
  const companyKeywords = [
    "solutions", "technologies", "tech", "systems", "software", "private", "limited", "pvt", "corp", 
    "corporation", "company", "industries", "group", "inc", "co", "llc", "ltd", "association", 
    "agency", "organization", "partners", "labs", "consulting", "enterprises", "digital"
  ];

  // Designation keywords to avoid capturing a job title as the company name
  const designationKeywords = [
    "manager", "developer", "engineer", "director", "founder", "ceo", "cto", "cfo", "coo", "vp", 
    "vice president", "president", "executive", "consultant", "designer", "analyst", "hr", "human resources",
    "specialist", "coordinator", "representative", "officer", "agent", "lead", "head", "partner", "investigator", "theorist"
  ];

  let bestCompany = "";
  let bestScore = -999;

  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();

    // 1. Skip lines matching addresses, emails, or websites
    if (addressLines.includes(line)) return;
    if (lower.includes('@') || lower.includes('www.') || lower.includes('http')) return;

    let score = 0;

    // 2. Check for company keywords
    const hasCompanyKeyword = companyKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(lower);
    });
    if (hasCompanyKeyword) {
      score += 35;
    }

    // 3. Casing - full UPPERCASE acronyms/words (e.g. "SHIELD" or "FBI") are common for company logos
    if (line === line.toUpperCase() && line.length > 2) {
      score += 15;
    }

    // 4. Card Position (often the first line or just below the name, or at the very bottom)
    if (idx === 0) {
      score += 12;
    } else if (idx === 1) {
      score += 8;
    } else if (idx === lines.length - 1) {
      score += 5;
    }

    // 5. Penalties for designation titles
    const hasDesignationKeyword = designationKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(lower);
    });
    if (hasDesignationKeyword) {
      score -= 25;
    }

    // Penalize phone/email labels
    if (/^(tel|phone|p|t|f|fax|email|e|m|web|w|site|add|adr|address)[:\.\s]*/i.test(line)) {
      score -= 30;
    }

    // Companies rarely have digits in names unless it's a room/street (which are already address-penalized)
    if (/\d/.test(line)) {
      score -= 10;
    }

    // 6. Word count checks (company names are usually 1 to 4 words)
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 1 && words.length <= 4) {
      score += 8;
    } else if (words.length > 5) {
      score -= 20;
    }

    if (score > bestScore) {
      bestScore = score;
      bestCompany = line;
    }
  });

  return {
    company: bestCompany,
    confidence: bestScore
  };
}
