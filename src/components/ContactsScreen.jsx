import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { classifyPhone } from '../utils/classifyPhone';
import { classifyEmail } from '../utils/classifyEmail';

function ContactSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '60%', height: 16, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '40%', height: 12 }} />
      </div>
    </div>
  );
}

function RippleButton({ children, className, onClick, ...props }) {
  const createRipple = (event) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");
    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
    if (onClick) onClick(event);
  };
  return <button className={className} onClick={createRipple} {...props}>{children}</button>;
}

export default function ContactsScreen({ contacts, onDelete, onUpdate, onGoToScan, onRetryDispatch }) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const addToast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filtered = contacts.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.website || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const StatusBadge = ({ status }) => {
    if (status === 'sent' || status === 'synced') return <span className="badge badge-success status-sent"><span className="material-icons" style={{ fontSize: 12, marginRight: 4 }}>check_circle</span>{status === 'synced' ? 'Synced' : 'Sent'}</span>;
    if (status === 'queued') return <span className="badge badge-warning status-pending"><span className="material-icons" style={{ fontSize: 12, marginRight: 4 }}>schedule</span>Queued</span>;
    if (status === 'failed') return <span className="badge badge-danger"><span className="material-icons" style={{ fontSize: 12, marginRight: 4 }}>error</span>Failed</span>;
    return null;
  };

  const ContactTypeBadge = ({ status }) => {
    if (status === 'merged') return <span className="badge badge-primary" style={{ fontSize: 9 }}><span className="material-icons" style={{ fontSize: 10, marginRight: 2 }}>call_merge</span>Merged</span>;
    if (status === 'updated') return <span className="badge badge-primary" style={{ fontSize: 9 }}><span className="material-icons" style={{ fontSize: 10, marginRight: 2 }}>update</span>Updated</span>;
    if (status === 'new') return <span className="badge badge-success" style={{ fontSize: 9 }}><span className="material-icons" style={{ fontSize: 10, marginRight: 2 }}>fiber_new</span>New</span>;
    return null;
  };

  const SyncStatusBadge = ({ syncStatus }) => {
    if (syncStatus === 'pending') {
      return (
        <span className="badge badge-warning" style={{ fontSize: 9, background: 'rgba(217, 119, 6, 0.1)', color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <span className="material-icons syncing-icon" style={{ fontSize: 10, animation: 'spin 2s linear infinite' }}>sync</span>
          Sync Pending
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <div className="page-content">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Contacts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{contacts.length} cards collected</p>
        </div>

        <div className="form-group" style={{ marginBottom: 24 }}>
          <div style={{ position: 'relative' }}>
            <span className="material-icons" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: 20 }}>search</span>
            <input
              className="form-input"
              style={{ paddingLeft: 48 }}
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <>
            <ContactSkeleton />
            <ContactSkeleton />
            <ContactSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', opacity: 0.5 }}>
            <span className="material-icons" style={{ fontSize: 64, marginBottom: 16 }}>contact_page</span>
            <p>No contacts found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((c, i) => (
              <div 
                key={c.id} 
                className="card" 
                style={{ padding: 16, cursor: 'pointer', animationDelay: `${c.id}s` }}
                onClick={() => setSelectedContact(c)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: c.avatarColor || 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                    {c.previewUrl ? (
                      <img src={c.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Card thumbnail" />
                    ) : (
                      c.name ? c.name[0] : '?'
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.name}</span>
                      <ContactTypeBadge status={c.status} />
                      <SyncStatusBadge syncStatus={c.syncStatus} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.company}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <StatusBadge status={c.whatsappStatus} />
                      <StatusBadge status={c.emailStatus} />
                      {c.zohoStatus && <StatusBadge status={c.zohoStatus} />}
                    </div>
                  </div>
                  <span className="material-icons" style={{ color: 'var(--border)' }}>chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal - Rendered OUTSIDE page-content to fix scroll positioning error */}
      {selectedContact && (
        <div className="modal-overlay" onClick={() => setSelectedContact(null)} style={{ zIndex: 1000 }}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: '#E2E8F0', borderRadius: 2, margin: '0 auto 20px' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: selectedContact.avatarColor || 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24, flexShrink: 0 }}>
                {selectedContact.previewUrl ? (
                  <img src={selectedContact.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Card avatar" />
                ) : (
                  selectedContact.name ? selectedContact.name[0] : '?'
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span>{selectedContact.name}</span>
                  <SyncStatusBadge syncStatus={selectedContact.syncStatus} />
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{selectedContact.company}</div>
              </div>
            </div>

            <div style={{ background: 'var(--background)', borderRadius: 16, padding: 16, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '240px', overflowY: 'auto' }}>
              {/* Render all emails with badges */}
              {(() => {
                const contactEmails = selectedContact.emails && selectedContact.emails.length > 0
                  ? selectedContact.emails
                  : [selectedContact.email, selectedContact.altEmail].filter(Boolean);
                
                return contactEmails.map((email, eIdx) => {
                  const isPrimary = email === selectedContact.email;
                  const type = classifyEmail(email);
                  const badgeColors = {
                    Personal: { background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' },
                    Sales: { background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' },
                    Support: { background: 'rgba(217, 119, 6, 0.1)', color: '#D97706' },
                    Admin: { background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' },
                  };
                  const currentBadge = badgeColors[type] || badgeColors.Personal;

                  return (
                    <div key={`email-${eIdx}`} style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <span className="material-icons" style={{ color: isPrimary ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 20, flexShrink: 0 }}>
                          {isPrimary ? 'email' : 'alternate_email'}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: isPrimary ? 600 : 400, wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</span>
                        {isPrimary && (
                          <span className="badge badge-success" style={{ fontSize: 8, padding: '1px 4px', marginLeft: 4, flexShrink: 0 }}>
                            Primary
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0, ...currentBadge }}>
                        {type}
                      </span>
                    </div>
                  );
                });
              })()}

              {/* Render all phones with badges */}
              {(() => {
                const contactPhones = selectedContact.phones && selectedContact.phones.length > 0
                  ? selectedContact.phones
                  : [selectedContact.phone, selectedContact.altPhone].filter(Boolean);

                return contactPhones.map((phone, pIdx) => {
                  const isPrimary = phone === selectedContact.phone;
                  const type = classifyPhone(phone, selectedContact.ocrLines || []);
                  const badgeColors = {
                    Mobile: { background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' },
                    Office: { background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' },
                    Landline: { background: 'rgba(100, 116, 139, 0.1)', color: '#64748B' },
                    Fax: { background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' },
                  };
                  const currentBadge = badgeColors[type] || badgeColors.Mobile;

                  return (
                    <div key={`phone-${pIdx}`} style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <span className="material-icons" style={{ color: isPrimary ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 20, flexShrink: 0 }}>
                          {isPrimary ? 'phone' : 'contact_phone'}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: isPrimary ? 600 : 400, wordBreak: 'break-all' }}>{phone}</span>
                        {isPrimary && (
                          <span className="badge badge-success" style={{ fontSize: 8, padding: '1px 4px', marginLeft: 4, flexShrink: 0 }}>
                            Primary
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0, ...currentBadge }}>
                        {type}
                      </span>
                    </div>
                  );
                });
              })()}
              {selectedContact.website && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 20 }}>language</span>
                  <a href={`https://${selectedContact.website.replace(/^https?:\/\//i, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}>
                    {selectedContact.website}
                  </a>
                </div>
              )}
              {selectedContact.address && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 20, marginTop: 2 }}>place</span>
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{selectedContact.address}</span>
                </div>
              )}
              {selectedContact.notes && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                  <span className="material-icons" style={{ color: 'var(--text-secondary)', fontSize: 20 }}>notes</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{selectedContact.notes}</span>
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                Scanned on: {new Date(selectedContact.scannedAt || Date.now()).toLocaleString()}
              </div>
            </div>

            {/* Scanned Card Image Preview */}
            {selectedContact.previewUrl && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.05em' }}>Scanned Card Image</div>
                <div style={{ width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={selectedContact.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f1f5f9' }} alt="Scanned card" />
                </div>
              </div>
            )}

            {/* Sync / Delivery Status Details & Manual Retry button */}
            {((selectedContact.whatsappStatus && selectedContact.whatsappStatus !== 'sent') || 
              (selectedContact.emailStatus && selectedContact.emailStatus !== 'sent') || 
              (selectedContact.zohoStatus && selectedContact.zohoStatus !== 'synced')) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--warning-light)', borderRadius: 12, marginBottom: 20, border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Delivery Status</span>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
                    onClick={() => {
                      if (onRetryDispatch) {
                        onRetryDispatch(selectedContact);
                        setSelectedContact(null);
                      }
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 14 }}>sync</span> Retry Send
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, flexWrap: 'wrap' }}>
                  {selectedContact.whatsappStatus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <strong>WhatsApp:</strong> 
                      <StatusBadge status={selectedContact.whatsappStatus} />
                    </div>
                  )}
                  {selectedContact.emailStatus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <strong>Email:</strong> 
                      <StatusBadge status={selectedContact.emailStatus} />
                    </div>
                  )}
                  {selectedContact.zohoStatus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <strong>Zoho CRM:</strong> 
                      <StatusBadge status={selectedContact.zohoStatus} />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <RippleButton className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedContact(null)}>Close</RippleButton>
              <RippleButton className="btn btn-danger" style={{ flex: 1 }} onClick={() => { onDelete(selectedContact.id); setSelectedContact(null); }}>Delete</RippleButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
