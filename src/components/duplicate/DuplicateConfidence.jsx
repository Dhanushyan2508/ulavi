import React from 'react';

/**
 * Calculates a match confidence percentage and label based on matching fields.
 */
export function calculateConfidence(matches = [], isExact = false) {
  if (isExact) {
    return { percentage: 98, label: 'Exact Duplicate', color: '#16A34A', bgLight: 'rgba(22, 163, 74, 0.08)' };
  }

  let score = 0;
  if (matches.includes('phone')) score += 35;
  if (matches.includes('email')) score += 35;
  if (matches.includes('name')) score += 20;
  if (matches.includes('company')) score += 10;

  // Bound it between 0 and 100
  score = Math.min(Math.max(score, 0), 100);

  if (score >= 80) {
    return { percentage: score, label: 'Strong Match', color: '#16A34A', bgLight: 'rgba(22, 163, 74, 0.08)' };
  } else if (score >= 50) {
    return { percentage: score, label: 'Possible Match', color: '#D97706', bgLight: 'rgba(217, 119, 6, 0.08)' };
  } else {
    return { percentage: Math.max(score, 30), label: 'Weak Match', color: '#2563EB', bgLight: 'rgba(37, 99, 235, 0.08)' };
  }
}

/**
 * DuplicateConfidence - Renders a premium dynamic SVG circular progress meter and status badge
 * for duplicate confidence level.
 * 
 * @param {object} props
 * @param {string[]} props.matches - Fields that matched
 * @param {boolean} props.isExact - If exact match
 */
export default function DuplicateConfidence({ matches = [], isExact = false }) {
  const { percentage, label, color, bgLight } = calculateConfidence(matches, isExact);

  // SVG parameters
  const radius = 24;
  const strokeWidth = 4.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16, 
        padding: '12px 16px', 
        borderRadius: '16px', 
        background: bgLight,
        border: `1px solid ${color}20`,
        width: '100%',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease'
      }}
    >
      {/* SVG Circle Gauge */}
      <div style={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle 
            cx="28" 
            cy="28" 
            r={radius} 
            fill="transparent" 
            stroke={`${color}15`} 
            strokeWidth={strokeWidth} 
          />
          {/* Active indicator circle */}
          <circle 
            cx="28" 
            cy="28" 
            r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth={strokeWidth} 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        <span 
          style={{ 
            position: 'absolute', 
            fontSize: '13px', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            fontFamily: 'var(--font)'
          }}
        >
          {percentage}%
        </span>
      </div>

      {/* Matching details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {label}
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {isExact 
            ? 'Records have identical name, phone number, and email.' 
            : `Overlaps detected in: ${matches.join(', ')}.`}
        </p>
      </div>
    </div>
  );
}
