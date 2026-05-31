import React, { useState, useEffect, useMemo } from 'react';
import DuplicateConfidence from './DuplicateConfidence';
import DuplicateComparison from './DuplicateComparison';
import MergeFieldSelector from './MergeFieldSelector';
import MergePreview from './MergePreview';
import './DuplicateModal.css';

// Text normalizer for string comparisons
const normalizeText = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Intelligent field relationship analyzer
const getFieldStatus = (existingVal, scannedVal) => {
  const eVal = (existingVal || '').trim();
  const sVal = (scannedVal || '').trim();
  
  if (!eVal && !sVal) return 'empty';
  if (eVal && !sVal) return 'exact'; // Scanned has nothing, preserve existing
  if (!eVal && sVal) return 'new'; // Scanned has brand new information
  
  const eNorm = normalizeText(eVal);
  const sNorm = normalizeText(sVal);
  
  if (eNorm === sNorm) return 'exact';
  
  // Checks for containment (e.g. "Eleanor" and "Eleanor Vance")
  if (eNorm.includes(sNorm) || sNorm.includes(eNorm)) return 'partial';
  
  return 'conflict';
};

/**
 * DuplicateModal - Redesigned premium bottom-sheet/modal workflow for handling
 * duplicate cards, displaying comparison details, interactive field merging,
 * and circular SVG match scoring.
 */
export default function DuplicateModal({ 
  duplicates = [], 
  newContact, 
  onCancel, 
  onSaveAsNew, 
  onUpdateExisting, 
  onMerge 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLoader, setShowLoader] = useState(true);
  const [selections, setSelections] = useState({});

  // Active duplicate matching record
  const currentDuplicate = duplicates[currentIndex];
  const existing = currentDuplicate?.contact;

  // Phase 1: Interactive Scanner Loading Delay
  useEffect(() => {
    setShowLoader(true);
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1300); // 1.3 seconds scanning animation delay
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Compute field statuses and initialize selections state
  const fieldStatuses = useMemo(() => {
    if (!existing || !newContact) return {};
    
    const statuses = {};
    const fields = ['name', 'company', 'phone', 'email', 'website', 'address', 'notes'];
    
    fields.forEach(field => {
      statuses[field] = getFieldStatus(existing[field], newContact[field]);
    });
    
    return statuses;
  }, [existing, newContact]);

  // Initialize field resolution selections
  useEffect(() => {
    if (!existing || !newContact) return;

    const initialSelections = {};
    Object.keys(fieldStatuses).forEach(field => {
      const status = fieldStatuses[field];
      if (status === 'new') {
        // Scanned value is new information, so import it by default
        initialSelections[field] = 'new';
      } else {
        // Preserves existing data as the safe default for conflicts/partials
        initialSelections[field] = 'existing';
      }
    });

    setSelections(initialSelections);
  }, [existing, newContact, fieldStatuses]);

  // Handle single field choice toggle
  const handleSelectionChange = (fieldKey, value) => {
    setSelections(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  // Generate live merged preview object
  const mergedPreview = useMemo(() => {
    if (!existing || !newContact) return {};

    const preview = { ...existing };
    
    Object.keys(selections).forEach(field => {
      const choice = selections[field];
      if (choice === 'new') {
        preview[field] = newContact[field];
      } else {
        preview[field] = existing[field];
      }
    });

    return preview;
  }, [existing, newContact, selections]);

  // Action handlers
  const handleUpdate = () => {
    const updated = { 
      ...existing, 
      ...newContact, 
      id: existing.id, 
      status: 'updated' 
    };
    onUpdateExisting(updated);
  };

  const handleMerge = () => {
    const finalMerged = {
      ...existing,
      status: 'merged',
      name: selections.name === 'new' ? newContact.name : existing.name,
      company: selections.company === 'new' ? newContact.company : existing.company,
      phone: selections.phone === 'new' ? newContact.phone : existing.phone,
      email: selections.email === 'new' ? newContact.email : existing.email,
      website: selections.website === 'new' ? newContact.website : existing.website,
      address: selections.address === 'new' ? newContact.address : existing.address,
      notes: selections.notes === 'new' 
        ? (existing.notes ? existing.notes + '\n' : '') + (newContact.notes || '')
        : existing.notes,
    };

    // Combine arrays for phones and emails to prevent data loss
    const existingPhones = existing.phones || [existing.phone].filter(Boolean);
    const newPhones = newContact.phones || [newContact.phone].filter(Boolean);
    finalMerged.phones = Array.from(new Set([...existingPhones, ...newPhones]));

    const existingEmails = existing.emails || [existing.email].filter(Boolean);
    const newEmails = newContact.emails || [newContact.email].filter(Boolean);
    finalMerged.emails = Array.from(new Set([...existingEmails, ...newEmails]));

    onMerge(finalMerged);
  };

  if (!currentDuplicate) return null;

  return (
    <div className="dup-backdrop">
      <div className="dup-sheet">
        
        {/* Phase 1: Animated AI Scanning Overlay */}
        {showLoader ? (
          <div className="dup-loader-screen">
            <div className="radar-container">
              <div className="radar-circle" />
              <div className="radar-circle-inner" />
              <div className="radar-scanner-bar" />
              <span className="material-icons radar-icon">psychology</span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Analyzing Contacts Database
              </h3>
              <p className="pulse-text" style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Running duplication match algorithms...
              </p>
            </div>
            <div className="dup-scan-bar-track">
              <div className="dup-scan-bar-fill" />
            </div>
          </div>
        ) : (
          /* Phase 2: Duplicate Resolution Workspace */
          <React.Fragment>
            {/* Elegant Header */}
            <div 
              style={{ 
                padding: '18px 24px', 
                background: 'var(--surface)', 
                borderBottom: '1px solid var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-icons" style={{ color: 'var(--warning)', fontSize: 24 }}>warning</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Similar Contact Found
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Resolve overlap conflicts before saving.
                  </p>
                </div>
              </div>
              <button 
                onClick={onCancel}
                style={{ 
                  background: 'var(--background)', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '6px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <span className="material-icons" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            {/* Resolution Workspace Panel */}
            <div className="dup-resolution-container">
              {/* Dynamic Match score Circle */}
              <DuplicateConfidence 
                matches={currentDuplicate.matches} 
                isExact={currentDuplicate.isExact} 
              />

              {/* Side-by-Side Cards Comparison with pagination */}
              <DuplicateComparison 
                existing={existing}
                newContact={newContact}
                fieldStatuses={fieldStatuses}
                duplicatesLength={duplicates.length}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
              />

              {/* Live Interactive Merge Board */}
              <MergeFieldSelector 
                existing={existing}
                scanned={newContact}
                fieldStatuses={fieldStatuses}
                selections={selections}
                onChange={handleSelectionChange}
              />

              {/* Real-time preview output card */}
              <MergePreview merged={mergedPreview} />
            </div>

            {/* Premium Interactive Action Bar Footer */}
            <div 
              style={{ 
                padding: '16px 24px', 
                background: 'var(--surface)', 
                borderTop: '1px solid var(--border)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 12,
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '13px', fontWeight: 600 }} 
                  onClick={handleMerge}
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>call_merge</span>
                  Merge Contacts
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '13px', fontWeight: 600 }} 
                  onClick={handleUpdate}
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>update</span>
                  Update Existing
                </button>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, height: 40, borderRadius: '12px', fontSize: '13px', fontWeight: 600, border: '1px solid var(--border)', background: 'var(--surface)' }} 
                  onClick={onCancel}
                >
                  Cancel Scan
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, height: 40, borderRadius: '12px', fontSize: '13px', fontWeight: 600, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }} 
                  onClick={() => onSaveAsNew({...newContact, status: 'new'})}
                >
                  Save as New
                </button>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
