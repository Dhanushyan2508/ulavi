import React, { useState, useEffect } from 'react';
import PhoneOptionCard from './PhoneOptionCard';
import EmailOptionCard from './EmailOptionCard';
import { prioritizePhones, prioritizeEmails } from '../utils/prioritizeContacts';

/**
 * ContactSelectionModal - A premium bottom sheet dialog that lets the user choose the primary 
 * phone (WhatsApp) number and email address from all detected options.
 *
 * @param {object} props
 * @param {string[]} props.phones - Array of all detected phone numbers
 * @param {string[]} props.emails - Array of all detected email addresses
 * @param {string} props.currentPhone - Currently selected phone number
 * @param {string} props.currentEmail - Currently selected email address
 * @param {string[]} [props.ocrLines=[]] - Original OCR lines for label classification context
 * @param {function} props.onConfirm - Called with { selectedPhone, selectedEmail } on confirmation
 * @param {function} [props.onClose] - Optional cancel/close handler
 */
export default function ContactSelectionModal({ 
  phones = [], 
  emails = [], 
  currentPhone = '', 
  currentEmail = '', 
  ocrLines = [], 
  onConfirm, 
  onClose 
}) {
  const [selectedPhone, setSelectedPhone] = useState(currentPhone);
  const [selectedEmail, setSelectedEmail] = useState(currentEmail);

  // Set default prioritized selections if current selection is not present/valid
  useEffect(() => {
    if (!selectedPhone || !phones.includes(selectedPhone)) {
      const bestPhone = prioritizePhones(phones, ocrLines);
      setSelectedPhone(bestPhone || (phones[0] || ''));
    }
    if (!selectedEmail || !emails.includes(selectedEmail)) {
      const bestEmail = prioritizeEmails(emails);
      setSelectedEmail(bestEmail || (emails[0] || ''));
    }
  }, [phones, emails, ocrLines]);

  const handleConfirm = () => {
    // Return selected values to caller
    onConfirm({
      selectedPhone,
      selectedEmail
    });
  };

  const hasMultiplePhones = phones.length > 1;
  const hasMultipleEmails = emails.length > 1;

  // Don't render if there aren't multiple selections to make
  if (!hasMultiplePhones && !hasMultipleEmails) {
    return null;
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div 
        className="modal-sheet" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxHeight: '85vh', 
          display: 'flex', 
          flexDirection: 'column', 
          paddingBottom: 12,
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Notch header indicator */}
        <div style={{ 
          width: 40, 
          height: 4, 
          background: '#E2E8F0', 
          borderRadius: 2, 
          margin: '0 auto 16px', 
          flexShrink: 0 
        }} />

        {/* Title Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 20, 
          flexShrink: 0 
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Choose Contact Details</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '4px 0 0', lineHeight: 1.4 }}>
              Multiple contact methods were detected. Select the channels to use for message delivery and CRM saving.
            </p>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              style={{ 
                background: 'var(--background)', 
                border: 'none', 
                cursor: 'pointer', 
                padding: 6,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span className="material-icons" style={{ color: 'var(--text-secondary)', fontSize: 20 }}>close</span>
            </button>
          )}
        </div>

        {/* Scrollable Selection Cards */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 20 }}>
          {/* WhatsApp / Phone Section */}
          {phones.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 18 }}>chat</span>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                  WhatsApp / Mobile Number {phones.length > 1 && <span style={{ color: 'var(--primary)', textTransform: 'none', fontWeight: 500 }}>({phones.length} options)</span>}
                </span>
              </div>
              {phones.map(phone => (
                <PhoneOptionCard 
                  key={phone} 
                  phone={phone} 
                  isSelected={selectedPhone === phone} 
                  onSelect={() => setSelectedPhone(phone)} 
                  ocrLines={ocrLines}
                />
              ))}
            </div>
          )}

          {/* Email Address Section */}
          {emails.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 18 }}>email</span>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                  Primary Email Address {emails.length > 1 && <span style={{ color: 'var(--primary)', textTransform: 'none', fontWeight: 500 }}>({emails.length} options)</span>}
                </span>
              </div>
              {emails.map(email => (
                <EmailOptionCard 
                  key={email} 
                  email={email} 
                  isSelected={selectedEmail === email} 
                  onSelect={() => setSelectedEmail(email)} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Sticky Confirm Action Bar */}
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button 
            className="btn btn-primary btn-full" 
            style={{ 
              py: 14, 
              fontSize: 14, 
              fontWeight: 700, 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8,
              boxShadow: 'var(--shadow-md)'
            }}
            onClick={handleConfirm}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>check_circle</span>
            Confirm Selections
          </button>
        </div>
      </div>
    </div>
  );
}
