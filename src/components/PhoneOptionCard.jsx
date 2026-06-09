import React from 'react';
import { classifyPhone } from '../utils/classifyPhone';

/**
 * PhoneOptionCard - Renders a touch-friendly selection option card for phone numbers.
 * Displays the number, a badge with its type (Mobile/Office/Landline/Fax), and a radio selection bubble.
 *
 * @param {object} props
 * @param {string} props.phone - The phone number to show
 * @param {boolean} props.isSelected - True if this option is currently selected
 * @param {function} props.onSelect - Triggered when clicking the card
 * @param {string[]} [props.ocrLines=[]] - Raw OCR lines for label classification context
 */
export default function PhoneOptionCard({ phone, isSelected, onSelect, ocrLines = [] }) {
  const type = classifyPhone(phone, ocrLines);
  
  // Enterprise style badges colors
  const badgeColors = {
    Mobile: { background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' }, // Light green
    Office: { background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }, // Light blue
    Landline: { background: 'rgba(100, 116, 139, 0.1)', color: '#64748B' }, // Light slate
    Fax: { background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }, // Light red
  };

  const currentBadge = badgeColors[type] || badgeColors.Mobile;

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
          {phone}
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
