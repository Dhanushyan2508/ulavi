import { cleanOCRText } from './cleanOCRText';
import { parseName } from './parseName';
import { parseCompany } from './parseCompany';
import { parseAddress } from './parseAddress';
import { parsePhones } from './parsePhones';
import { parseEmails } from './parseEmails';
import { parseWebsite } from './parseWebsite';

const SAMPLE_CARDS = [
  {
    name: "US Card (Sarah Connor)",
    rawText: `
      SARAH CONNOR
      VP of Engineering
      Cyberdyne Systems
      Tel: +1 (555) 800-1984
      Cell: +1 (555) 800-1985
      s.connor@cyberdyne.io
      www.cyberdyne.io
      2144 Industrial Way
      Sunnyvale, CA 94089
    `,
    expected: {
      name: "SARAH CONNOR",
      company: "Cyberdyne Systems",
      email: "s.connor@cyberdyne.io",
      phone: "+1 (555) 800-1984",
      altEmail: "",
      altPhone: "+1 (555) 800-1985",
      website: "www.cyberdyne.io",
      address: "2144 Industrial Way, Sunnyvale, CA 94089"
    }
  },
  {
    name: "Indian Card (Rajesh Kumar)",
    rawText: `
      Rajesh Kumar
      Managing Director
      Alpha Tech Solutions Pvt Ltd
      Ph: +91 98765 43210
      Fax: +91 80 2234 5678
      rajesh@alphatech.co.in
      www.alphatech.co.in
      Plot No 42, Sector 4, HSR Layout
      Bangalore, Karnataka - 560102
    `,
    expected: {
      name: "Rajesh Kumar",
      company: "Alpha Tech Solutions Pvt Ltd",
      email: "rajesh@alphatech.co.in",
      phone: "+91 98765 43210",
      altEmail: "",
      altPhone: "+91 80 2234 5678",
      website: "www.alphatech.co.in",
      address: "Plot No 42, Sector 4, HSR Layout, Bangalore, Karnataka - 560102"
    }
  },
  {
    name: "UK Card (Arthur Hastings)",
    rawText: `
      Arthur Hastings
      Senior Investigator
      Poirot Investigations
      hastings@poirot.co.uk
      alt.contact@poirot.co.uk
      Direct: +44 20 7946 0800
      Mobile: +44 7700 900077
      56B Whitehaven Mansions
      London
      SW1A 1AA
    `,
    expected: {
      name: "Arthur Hastings",
      company: "Poirot Investigations",
      email: "hastings@poirot.co.uk",
      phone: "+44 20 7946 0800",
      altEmail: "alt.contact@poirot.co.uk",
      altPhone: "+44 7700 900077",
      website: "",
      address: "56B Whitehaven Mansions, London, SW1A 1AA"
    }
  },
  {
    name: "Noisy OCR Card (John Doe)",
    rawText: `
      | _ John Doe
      Software Engineer
      Google LLC
      | Mob: 9876543210
      | Email: john.doe@google.com
      | Addr: 1600 Amphitheatre Pkwy
      Mountain View, CA 94043
      _ • _
    `,
    expected: {
      name: "John Doe",
      company: "Google LLC",
      email: "john.doe@google.com",
      phone: "9876543210",
      altEmail: "",
      altPhone: "",
      website: "",
      address: "1600 Amphitheatre Pkwy, Mountain View, CA 94043"
    }
  }
];

export function runOCRTests() {
  console.log("%c=== CARDCONNECT AI - PARSING ENGINE TEST SUITE ===", "color: #2563EB; font-weight: bold; font-size: 14px;");
  
  let passedCount = 0;
  let totalFieldsCount = 0;
  let matchedFieldsCount = 0;
 
  SAMPLE_CARDS.forEach((sample, cardIdx) => {
    console.group(`%cTest Card ${cardIdx + 1}: ${sample.name}`, "color: #7C3AED; font-weight: bold;");
    
    // Clean raw text
    const lines = cleanOCRText(sample.rawText);
    
    // Extract multi-line address
    const { address, addressLines } = parseAddress(lines);
    
    // Extract emails, phones, website
    const emails = parseEmails(lines);
    const phones = parsePhones(lines);
    const websites = parseWebsite(lines);
    
    // Score/extract Name, Company
    const { name, confidence: nameConf } = parseName(lines, addressLines);
    const { company, confidence: compConf } = parseCompany(lines, addressLines);
 
    // Map fields
    const parsed = {
      name: name || '',
      company: company || '',
      email: emails[0] || '',
      phone: phones[0] || '',
      altEmail: emails[1] || '',
      altPhone: phones[1] || '',
      website: websites[0] || '',
      address: address || ''
    };

    console.log("Input Lines:", lines);
    console.log("Confidence Scores - Name:", nameConf, "| Company:", compConf);
    console.log("Parsed Result:", parsed);
    console.log("Expected Result:", sample.expected);
 
    // Validate fields
    let cardFailed = false;
    Object.keys(sample.expected).forEach(field => {
      totalFieldsCount++;
      const gotValue = parsed[field].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const expValue = sample.expected[field].trim().toLowerCase().replace(/[^a-z0-9]/g, '');

      if (gotValue === expValue) {
        matchedFieldsCount++;
      } else {
        cardFailed = true;
        console.warn(`%cMismatch on field [${field}]: Got "${parsed[field]}" | Expected "${sample.expected[field]}"`, "color: #D97706;");
      }
    });

    if (!cardFailed) {
      passedCount++;
      console.log("%c✓ CARD PASSED SUCCESSFULLY", "color: #16A34A; font-weight: bold;");
    } else {
      console.log("%c✗ CARD FAILED VALIDATION (partial mismatches)", "color: #DC2626; font-weight: bold;");
    }

    console.groupEnd();
  });

  const accuracy = ((matchedFieldsCount / totalFieldsCount) * 100).toFixed(1);
  console.log("%c==================================================", "color: #2563EB; font-weight: bold;");
  console.log(`%cCards Passed: ${passedCount}/${SAMPLE_CARDS.length}`, passedCount === SAMPLE_CARDS.length ? "color: #16A34A; font-weight: bold;" : "color: #D97706; font-weight: bold;");
  console.log(`%cField-Level Match Accuracy: ${accuracy}% (${matchedFieldsCount}/${totalFieldsCount} fields)`, "font-weight: bold;");
  console.log("%c==================================================", "color: #2563EB; font-weight: bold;");
  
  return { passedCount, accuracy };
}

// Automatically expose to browser console
if (typeof window !== 'undefined') {
  window.runOCRTests = runOCRTests;
}
