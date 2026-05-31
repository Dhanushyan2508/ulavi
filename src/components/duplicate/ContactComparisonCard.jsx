import React from 'react';
import MatchBadge from './MatchBadge';

const FIELD_LABELS = {
  name: { label: 'Name', icon: 'person' },
  company: { label: 'Company', icon: 'business' },
  phone: { label: 'Phone', icon: 'phone' },
  email: { label: 'Email', icon: 'email' },
  website: { label: 'Website', icon: 'language' },
  address: { label: 'Address', icon: 'place' },
  notes: { label: 'Notes', icon: 'notes' },
};

/**
 * ContactComparisonCard - Displays a contact column in a grid layout, highlighting matching
 * or conflicting fields.
 * 
 * @param {object} props
 * @param {string} props.title - Card title (e.g. "Existing Contact", "Scanned Contact")
 * @param {object} props.contact - The contact object
 * @param {object} props.fieldStatuses - Object mapping fields to 'exact' | 'partial' | 'new' | 'conflict'
 * @param {string} [props.avatarColor] - Optional avatar bg color
 */
export default function ContactComparisonCard({ title, contact, fieldStatuses = {}, avatarColor = 'var(--primary)' }) {
  
  const getFieldClass = (status) => {
    if (status === 'exact') return 'bg-field-exact';
    if (status === 'partial') return 'bg-field-partial';
    if (status === 'new') return 'bg-field-new';
    if (status === 'conflict') return 'bg-field-conflict';
    return '';
  };

  const getStatusIcon = (status) => {
    if (status === 'exact') return { icon: 'check_circle', color: '#16A34A' };
    if (status === 'partial') return { icon: 'info', color: '#D97706' };
    if (status === 'new') return { icon: 'add_circle', color: '#2563EB' };
    if (status === 'conflict') return { icon: 'warning', color: '#DC2626' };
    return { icon: 'help_outline', color: 'var(--text-secondary)' };
  };

  return (
    <div 
      className="card" 
      style={{ 
        flex: 1, 
        minWidth: 240,
        padding: 16, 
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxSizing: 'border-box'
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <div 
          style={{ 
            width: 42, 
            height: 42, 
            borderRadius: '50%', 
            background: avatarColor, 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 700, 
            fontSize: 16,
            flexShrink: 0
          }}
        >
          {contact.name ? contact.name[0].toUpperCase() : '?'}
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </h4>
          <h3 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {contact.name || 'Unknown Name'}
          </h3>
        </div>
      </div>

      {/* Fields List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(FIELD_LABELS).map(([fieldKey, { label, icon }]) => {
          const value = contact[fieldKey];
          const status = fieldStatuses[fieldKey];
          
          // Render even if empty to maintain height alignment with side-by-side card
          const displayValue = value ? value : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not provided</span>;
          const statusConfig = getStatusIcon(status);

          return (
            <div 
              key={fieldKey}
              className={getFieldClass(status)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1px solid transparent',
                transition: 'all 0.25s ease'
              }}
            >
              {/* Field Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                  <span className="material-icons" style={{ fontSize: 14 }}>{icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</span>
                </div>
                {value && status && <MatchBadge type={status} />}
              </div>

              {/* Field Value */}
              <div 
                style={{ 
                  fontSize: '13px', 
                  fontWeight: value && status === 'conflict' ? 600 : 400,
                  color: 'var(--text-primary)',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                  marginTop: 2
                }}
              >
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scanned/Created Metadata (if existing) */}
      {contact.scannedAt && (
        <div 
          style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)', 
            borderTop: '1px solid var(--border)', 
            paddingTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span className="material-icons" style={{ fontSize: 12 }}>calendar_today</span>
          <span>Scanned: {new Date(contact.scannedAt).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
}
