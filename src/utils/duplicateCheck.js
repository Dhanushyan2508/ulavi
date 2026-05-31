export const normalizeText = (text) => {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
};

export const normalizeEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

const isPlaceholderName = (name) => {
  const lower = (name || '').toLowerCase().trim();
  return lower === '' || lower === 'unknown name' || lower === 'unknown' || lower === 'business contact';
};

const isPlaceholderCompany = (company) => {
  const lower = (company || '').toLowerCase().trim();
  return lower === '' || lower === 'unknown company' || lower === 'unknown';
};

export const findDuplicates = (newContact, existingContacts) => {
  const duplicates = [];
  
  // Extract all potential phone numbers and emails for the new contact
  const newPhones = (newContact.phones || [newContact.phone, newContact.altPhone])
    .filter(Boolean)
    .map(normalizePhone);
  
  const newEmails = (newContact.emails || [newContact.email, newContact.altEmail])
    .filter(Boolean)
    .map(normalizeEmail);

  const newName = normalizeText(newContact.name);
  const newCompany = normalizeText(newContact.company);

  for (const existing of existingContacts) {
    let matches = [];
    
    // Extract all potential phone numbers and emails for the existing contact
    const existingPhones = (existing.phones || [existing.phone, existing.altPhone])
      .filter(Boolean)
      .map(normalizePhone);
      
    const existingEmails = (existing.emails || [existing.email, existing.altEmail])
      .filter(Boolean)
      .map(normalizeEmail);

    const existingName = normalizeText(existing.name);
    const existingCompany = normalizeText(existing.company);

    // Match if there is any overlap in the numbers/emails list
    const hasPhoneMatch = newPhones.some(p => existingPhones.includes(p));
    const hasEmailMatch = newEmails.some(e => existingEmails.includes(e));

    if (hasPhoneMatch) matches.push('phone');
    if (hasEmailMatch) matches.push('email');
    
    if (newName && newName === existingName && !isPlaceholderName(newContact.name) && !isPlaceholderName(existing.name)) {
      matches.push('name');
    }
    if (newCompany && newCompany === existingCompany && !isPlaceholderCompany(newContact.company) && !isPlaceholderCompany(existing.company)) {
      matches.push('company');
    }

    if (matches.length > 0) {
      // Only consider it a duplicate if phone, email, or name matches
      if (matches.includes('phone') || matches.includes('email') || matches.includes('name')) {
        const isExact = matches.includes('phone') && matches.includes('email') && matches.includes('name');
        
        duplicates.push({
          contact: existing,
          matches,
          isExact,
          isPartial: !isExact,
        });
      }
    }
  }

  // Sort: exact matches first, then partial with most fields matched
  return duplicates.sort((a, b) => {
    if (a.isExact && !b.isExact) return -1;
    if (!a.isExact && b.isExact) return 1;
    return b.matches.length - a.matches.length;
  });
};
