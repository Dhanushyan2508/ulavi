import React from 'react';

/**
 * MatchBadge - Renders a sleek pill badge indicating the match status of a contact field.
 * 
 * @param {object} props
 * @param {'exact' | 'partial' | 'new' | 'conflict'} props.type - The status classification
 */
export default function MatchBadge({ type }) {
  const configs = {
    exact: {
      text: 'Exact Match',
      icon: 'check_circle',
      bg: 'rgba(22, 163, 74, 0.1)',
      color: '#16A34A',
    },
    partial: {
      text: 'Similar',
      icon: 'info',
      bg: 'rgba(217, 119, 6, 0.1)',
      color: '#D97706',
    },
    new: {
      text: 'New Info',
      icon: 'add_circle',
      bg: 'rgba(37, 99, 235, 0.1)',
      color: '#2563EB',
    },
    conflict: {
      text: 'Conflict',
      icon: 'warning',
      bg: 'rgba(220, 38, 38, 0.1)',
      color: '#DC2626',
    },
  };

  const config = configs[type];
  if (!config) return null;

  return (
    <span 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 4, 
        padding: '3px 8px', 
        borderRadius: 999, 
        fontSize: '11px', 
        fontWeight: 600, 
        letterSpacing: '0.01em',
        background: config.bg, 
        color: config.color,
        textTransform: 'uppercase',
        transition: 'all 0.2s ease'
      }}
    >
      <span className="material-icons" style={{ fontSize: 12 }}>{config.icon}</span>
      {config.text}
    </span>
  );
}
