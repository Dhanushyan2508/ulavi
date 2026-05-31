import React from 'react';
import MatchBadge from './MatchBadge';

const FIELD_METADATA = {
  name: { label: 'Name', icon: 'person' },
  company: { label: 'Company', icon: 'business' },
  phone: { label: 'Phone', icon: 'phone' },
  email: { label: 'Email', icon: 'email' },
  website: { label: 'Website', icon: 'language' },
  address: { label: 'Address', icon: 'place' },
  notes: { label: 'Notes', icon: 'notes' },
};

/**
 * MergeFieldSelector - Provides interactive, side-by-side selection panels
 * for resolving data differences field-by-field during merge operations.
 * 
 * @param {object} props
 * @param {object} props.existing - Existing contact object
 * @param {object} props.scanned - New scanned contact object
 * @param {object} props.fieldStatuses - Object mapping fields to statuses
 * @param {object} props.selections - Object mapping fields to 'existing' | 'new'
 * @param {function} props.onChange - Callback (fieldKey, value) when user toggles selection
 */
export default function MergeFieldSelector({ existing, scanned, fieldStatuses = {}, selections = {}, onChange }) {
  
  // Get all fields that have either a conflict or a new value (exclude exact matches or empty fields)
  const interactiveFields = Object.entries(FIELD_METADATA).filter(([key]) => {
    const status = fieldStatuses[key];
    return status === 'conflict' || status === 'new' || status === 'partial';
  });

  if (interactiveFields.length === 0) {
    return (
      <div 
        style={{ 
          padding: 16, 
          textAlign: 'center', 
          background: 'rgba(22, 163, 74, 0.05)', 
          border: '1px solid rgba(22, 163, 74, 0.2)',
          borderRadius: 12,
          color: '#16A34A',
          fontSize: '13px',
          fontWeight: 500
        }}
      >
        <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: 6, fontSize: 18 }}>check_circle</span>
        All fields match perfectly. No manual merge choices are required!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
        Resolve Conflicts Field-by-Field
      </h3>
      <p style={{ margin: '-10px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
        Click to toggle which value you want to keep in the final merged contact.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {interactiveFields.map(([fieldKey, { label, icon }]) => {
          const status = fieldStatuses[fieldKey];
          const valExisting = existing[fieldKey] || '';
          const valScanned = scanned[fieldKey] || '';
          const currentSelection = selections[fieldKey];

          return (
            <div 
              key={fieldKey}
              className="dup-card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px' }}>
                  <span className="material-icons" style={{ fontSize: 16, color: 'var(--primary)' }}>{icon}</span>
                  {label}
                </div>
                <MatchBadge type={status} />
              </div>

              {/* Toggle Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {/* Keep Existing Button */}
                <button
                  type="button"
                  onClick={() => onChange(fieldKey, 'existing')}
                  className={`field-select-btn ${currentSelection === 'existing' ? 'selected-existing' : ''}`}
                >
                  <span className="material-icons" style={{ fontSize: 18, color: currentSelection === 'existing' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {currentSelection === 'existing' ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Keep Existing</span>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                      {valExisting || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>[Blank]</span>}
                    </span>
                  </div>
                </button>

                {/* Keep Scanned Button */}
                <button
                  type="button"
                  onClick={() => onChange(fieldKey, 'new')}
                  className={`field-select-btn ${currentSelection === 'new' ? 'selected-new' : ''}`}
                >
                  <span className="material-icons" style={{ fontSize: 18, color: currentSelection === 'new' ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {currentSelection === 'new' ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Keep Scanned</span>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                      {valScanned || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>[Blank]</span>}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
