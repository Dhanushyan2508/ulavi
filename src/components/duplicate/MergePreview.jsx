import React, { useState, useEffect } from 'react';

/**
 * MergePreview - Shows a real-time card representing the live merged output contact.
 * Animates with a beautiful blue glow when field selections change.
 * 
 * @param {object} props
 * @param {object} props.merged - The currently merged contact object
 */
export default function MergePreview({ merged }) {
  const [animate, setAnimate] = useState(false);

  // Trigger blue glow pulse whenever merged properties change
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 800);
    return () => clearTimeout(timer);
  }, [merged]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Live Merge Preview
        </h3>
        <span 
          style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: 'var(--primary)', 
            background: 'var(--primary-light)', 
            padding: '2px 8px', 
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Dynamic Preview
        </span>
      </div>

      {/* Merged Contact Business Card Mock */}
      <div 
        className={`merge-glow-active ${animate ? 'merge-glow-active' : ''}`}
        style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#f8fafc',
          borderRadius: 'var(--radius-card)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1.5px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 180,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Hologram/Radar Chip Icon decorative */}
        <div 
          style={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            background: 'linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(22,163,74,0.35) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)'
          }}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>contact_phone</span>
        </div>

        {/* Top Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Name */}
          <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
            {merged.name || 'Unknown Name'}
          </div>
          {/* Company */}
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {merged.company || 'Unknown Company'}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />

        {/* Contact info details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px 12px' }}>
          {/* Phone */}
          {merged.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
              <span className="material-icons" style={{ fontSize: 13, color: '#94a3b8' }}>phone</span>
              <span style={{ color: '#cbd5e1', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {merged.phone}
              </span>
            </div>
          )}
          
          {/* Email */}
          {merged.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
              <span className="material-icons" style={{ fontSize: 13, color: '#94a3b8' }}>email</span>
              <span style={{ color: '#cbd5e1', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {merged.email}
              </span>
            </div>
          )}

          {/* Website */}
          {merged.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
              <span className="material-icons" style={{ fontSize: 13, color: '#94a3b8' }}>language</span>
              <span style={{ color: '#cbd5e1', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {merged.website}
              </span>
            </div>
          )}

          {/* Address */}
          {merged.address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
              <span className="material-icons" style={{ fontSize: 13, color: '#94a3b8' }}>place</span>
              <span style={{ color: '#cbd5e1', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {merged.address}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
