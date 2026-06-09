/**
 * Classifies a phone number as 'Mobile', 'Office', 'Landline', or 'Fax'.
 * Checks the context of the OCR line where the number was found, as well as the number format.
 *
 * @param {string} phone - The phone number to classify
 * @param {string[]} [ocrLines=[]] - The list of OCR lines for contextual label check
 * @returns {'Mobile' | 'Office' | 'Landline' | 'Fax'} The classified type
 */
export function classifyPhone(phone, ocrLines = []) {
  if (!phone) return 'Mobile';

  const normalized = phone.toLowerCase();
  
  // Look for the line in OCR output that contains this phone number to check for label hints
  let contextLine = '';
  if (ocrLines && Array.isArray(ocrLines)) {
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length >= 6) {
      const foundLine = ocrLines.find(line => {
        const lineDigits = line.replace(/\D/g, '');
        return lineDigits.includes(phoneDigits);
      });
      if (foundLine) {
        contextLine = foundLine.toLowerCase();
      }
    }
  }

  // 1. Fax detection
  if (contextLine.includes('fax') || contextLine.includes('f:') || normalized.includes('fax')) {
    return 'Fax';
  }

  // 2. Explicit Mobile labels
  if (
    contextLine.includes('mob') || 
    contextLine.includes('cell') || 
    contextLine.includes('m:') || 
    contextLine.includes('personal') ||
    contextLine.includes('handphone')
  ) {
    return 'Mobile';
  }

  // 3. Office or Landline labels
  if (
    contextLine.includes('off') || 
    contextLine.includes('work') || 
    contextLine.includes('tel') || 
    contextLine.includes('t:') || 
    contextLine.includes('p:') || 
    contextLine.includes('dir') || 
    contextLine.includes('direct') ||
    contextLine.includes('land') ||
    contextLine.includes('ph:')
  ) {
    if (contextLine.includes('land') || contextLine.includes('home') || contextLine.includes('res')) {
      return 'Landline';
    }
    return 'Office';
  }

  // 4. Fallback formatting guess
  const rawDigits = phone.replace(/\D/g, '');
  
  // Numbers starting with 0 (e.g. area-code landlines in UK/India)
  if (rawDigits.startsWith('0') && rawDigits.length <= 11) {
    return 'Landline';
  }
  
  // Local numbers without country codes that are 7 or 8 digits
  if (rawDigits.length === 7 || rawDigits.length === 8) {
    return 'Landline';
  }

  // Standard fallback
  return 'Mobile';
}
