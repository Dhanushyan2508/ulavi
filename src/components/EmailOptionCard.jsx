import React from 'react';
import { classifyEmail } from '../utils/classifyEmail';

/**
 * EmailOptionCard - Renders a touch-friendly selection option card for email addresses.
 * Displays the email, a badge with its type (Personal/Sales/Support/Admin), and a radio selection bubble.
 *
 * @param {object} props
 * @param {string} props.email - The email address to show
 * @param {boolean} props.isSelected - True if this option is currently selected
 * @param {function} props.onSelect - Triggered when clicking the card
 */
export default function EmailOptionCard({ email, isSelected, onSelect }) {
  const type = classifyEmail(email);

  // Enterprise style badges colors
  const badgeColors = {
    Personal: { background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' }, // Light green
    Sales: { background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }, // Light blue
    Support: { background: 'rgba(217, 119, 6, 0.1)', color: '#D97706' }, // Light amber
    Admin: { background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }, // Light red
  };

  const currentBadge = badgeColors[type] || badgeColors.Personal;

  return (
    <div 
      className={`selection-option-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        marginBottom: 10,
        cursor: 'pointer',
        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
        borderRadius: 12,
        background: isSelected ? 'var(--primary-light, rgba(37, 99, 235, 0.05))' : 'var(--card-bg, #ffffff)',
        boxShadow: isSelected ? '0 4px 6px -1px rgba(37, 99, 235, 0.1)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        touchAction: 'manipulation'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Styled Radio Indicator */}
        <div style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: isSelected ? '6px solid var(--primary)' : '2px solid var(--border)',
          background: 'white',
          transition: 'all 0.2s ease',
          flexShrink: 0
        }} />
        <span style={{ 
          fontSize: 14, 
          fontWeight: isSelected ? 600 : 500, 
          color: 'var(--text-primary)',
          wordBreak: 'break-all'
        }}>
          {email}
        </span>
      </div>
      
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 6,
        textTransform: 'uppercase',
        flexShrink: 0,
        ...currentBadge
      }}>
        {type}
      </span>
    </div>
  );
}
