import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const DEFAULT_WA_TEMPLATE = `Hi {{name}},

It was great connecting with you!

We are Ulavi Technologies — glad we connected.
Looking forward to exploring ways we can collaborate.

Feel free to reach out anytime!

Warm regards,
Team Ulavi`;

const DEFAULT_EMAIL_SUBJECT = `Great connecting with you, {{name}}!`;

const DEFAULT_EMAIL_BODY = `Hi {{name}},

It was wonderful connecting with you!

We are Ulavi Technologies, and we truly enjoyed our conversation. We would love to explore how we can work together.

Please feel free to reach out to us anytime at support@ulavi.com or visit www.ulavi.com

Looking forward to staying in touch!

Warm regards,
Team Ulavi Technologies`;

const VARIABLES = ['{{name}}', '{{company}}', '{{phone}}', '{{email}}'];

const SAMPLE_VALUES = {
  '{{name}}': 'Raj Kumar',
  '{{company}}': 'TechCorp',
  '{{phone}}': '+91 98765 43210',
  '{{email}}': 'raj@techcorp.com',
};

const TemplateContext = createContext(null);

export function TemplateProvider({ children }) {
  const [waTemplate, setWaTemplate] = useState(() => localStorage.getItem('waTemplate') || DEFAULT_WA_TEMPLATE);
  const [emailSubject, setEmailSubject] = useState(() => localStorage.getItem('emailSubject') || DEFAULT_EMAIL_SUBJECT);
  const [emailBody, setEmailBody] = useState(() => localStorage.getItem('emailBody') || DEFAULT_EMAIL_BODY);

  useEffect(() => {
    localStorage.setItem('waTemplate', waTemplate);
  }, [waTemplate]);

  useEffect(() => {
    localStorage.setItem('emailSubject', emailSubject);
  }, [emailSubject]);

  useEffect(() => {
    localStorage.setItem('emailBody', emailBody);
  }, [emailBody]);

  const resetWa = useCallback(() => setWaTemplate(DEFAULT_WA_TEMPLATE), []);
  const resetEmail = useCallback(() => {
    setEmailSubject(DEFAULT_EMAIL_SUBJECT);
    setEmailBody(DEFAULT_EMAIL_BODY);
  }, []);

  const fillTemplate = useCallback((template, contact) => {
    if (!template) return '';
    return template
      .replace(/\{\{name\}\}/g, contact.name || '')
      .replace(/\{\{company\}\}/g, contact.company || '')
      .replace(/\{\{phone\}\}/g, contact.phone || '')
      .replace(/\{\{email\}\}/g, contact.email || '');
  }, []);

  return (
    <TemplateContext.Provider value={{
      waTemplate, setWaTemplate, resetWa,
      emailSubject, setEmailSubject,
      emailBody, setEmailBody, resetEmail,
      fillTemplate,
      VARIABLES, SAMPLE_VALUES,
      DEFAULT_WA_TEMPLATE, DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_BODY,
    }}>
      {children}
    </TemplateContext.Provider>
  );
}

export const useTemplates = () => useContext(TemplateContext);
