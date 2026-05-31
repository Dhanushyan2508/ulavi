/**
 * Classifies an email address into 'Personal', 'Support', 'Sales', or 'Admin'.
 * Looks at the local part (username) of the email address.
 *
 * @param {string} email - The email address to classify
 * @returns {'Personal' | 'Support' | 'Sales' | 'Admin'} The classified email category
 */
export function classifyEmail(email) {
  if (!email) return 'Personal';

  const lower = email.toLowerCase().trim();
  const username = lower.split('@')[0] || '';

  // 1. Support emails
  if (
    username.includes('support') || 
    username.includes('help') || 
    username.includes('service') || 
    username.includes('care') ||
    username.includes('desk')
  ) {
    return 'Support';
  }

  // 2. Sales / Business transaction emails
  if (
    username.includes('sales') || 
    username.includes('deal') || 
    username.includes('order') || 
    username.includes('market') || 
    username.includes('billing') || 
    username.includes('finance') ||
    username.includes('biz')
  ) {
    return 'Sales';
  }

  // 3. Administrative / Generic inquiries
  if (
    username.includes('admin') || 
    username.includes('info') || 
    username.includes('office') || 
    username.includes('hello') || 
    username.includes('contact') || 
    username.includes('query') ||
    username.includes('mail') ||
    username.includes('general') ||
    username === 'hr' ||
    username === 'jobs' ||
    username === 'career'
  ) {
    return 'Admin';
  }

  // Default to Personal (e.g. j.doe@company.com, standard human business contact)
  return 'Personal';
}
