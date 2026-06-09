import React from 'react';
import ContactComparisonCard from './ContactComparisonCard';

/**
 * DuplicateComparison - Renders the side-by-side contact cards and handles pagination
 * if multiple similar duplicates exist in IndexedDB.
 * 
 * @param {object} props
 * @param {object} props.existing - Existing duplicate contact
 * @param {object} props.newContact - Scanned contact
 * @param {object} props.fieldStatuses - Object mapping fields to statuses
 * @param {number} props.duplicatesLength - Total duplicates found
 * @param {number} props.currentIndex - Current active duplicate index
 * @param {function} props.onIndexChange - Index toggle callback
 */
export default function DuplicateComparison({
  existing,
  newContact,
  fieldStatuses,
  duplicatesLength,
  currentIndex,
  onIndexChange
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Pagination / Carousel Selector if multiple duplicate records */}
      {duplicatesLength > 1 && (
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '10px 16px', 
            background: 'var(--primary-light)', 
            border: '1.5px solid var(--primary-light)',
            borderRadius: '16px',
            boxSizing: 'border-box'
          }}
        >
          <button 
            type="button"
            className="btn btn-outline" 
            style={{ 
              padding: '6px 10px', 
              fontSize: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4, 
              height: 32,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.5 : 1
            }} 
            disabled={currentIndex === 0} 
            onClick={() => onIndexChange(currentIndex - 1)}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>chevron_left</span> Previous
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
              Duplicate {currentIndex + 1} of {duplicatesLength}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: duplicatesLength }).map((_, idx) => (
                <div 
                  key={idx}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: idx === currentIndex ? 'var(--primary)' : 'rgba(37,99,235,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>

          <button 
            type="button"
            className="btn btn-outline" 
            style={{ 
              padding: '6px 10px', 
              fontSize: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4, 
              height: 32,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              cursor: currentIndex === duplicatesLength - 1 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === duplicatesLength - 1 ? 0.5 : 1
            }} 
            disabled={currentIndex === duplicatesLength - 1} 
            onClick={() => onIndexChange(currentIndex + 1)}
          >
            Next <span className="material-icons" style={{ fontSize: 16 }}>chevron_right</span>
          </button>
        </div>
      )}

      {/* Grid Comparison Layout */}
      <div 
        className="slide-in-right"
        key={currentIndex} // Re-animate when pagination index changes!
        style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap',
          gap: 16, 
          position: 'relative'
        }}
      >
        {/* Existing Card */}
        <ContactComparisonCard 
          title="Existing Contact" 
          contact={existing} 
          fieldStatuses={fieldStatuses}
          avatarColor="#004ac6"
        />

        {/* Central Overlay VS Icon Connector */}
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Muted background circle divider, invisible on small screens but beautiful on desktops */}
          <div 
            className="mobile-hide"
            style={{ 
              width: 38, 
              height: 38, 
              borderRadius: '50%', 
              background: 'var(--surface)', 
              border: '2px solid var(--border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)',
              pointerEvents: 'auto'
            }}
          >
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>compare_arrows</span>
          </div>
        </div>

        {/* Scanned Card */}
        <ContactComparisonCard 
          title="New Scanned Contact" 
          contact={newContact} 
          fieldStatuses={fieldStatuses}
          avatarColor="#16a34a"
        />
      </div>
    </div>
  );
}
