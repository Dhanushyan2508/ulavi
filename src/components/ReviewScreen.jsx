import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useTemplates } from '../context/TemplateContext';
import ContactSelectionModal from './ContactSelectionModal';

const FIELDS = [
  { key: 'name',     label: 'Full Name',    icon: 'person' },
  { key: 'company',  label: 'Company',      icon: 'business' },
  { key: 'email',    label: 'Email',        icon: 'email' },
  { key: 'altEmail', label: 'Alt Email',    icon: 'alternate_email' },
  { key: 'phone',    label: 'Phone',        icon: 'phone' },
  { key: 'altPhone', label: 'Alt Phone',    icon: 'contact_phone' },
  
];

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

export default function ReviewScreen({ scannedData, previewUrl, onSave, onDiscard, isOffline }) {
  const [form, setForm] = useState({
    name: '', company: '', email: '', altEmail: '',
    phone: '', altPhone: '', 
    ...scannedData,
  });
  const [showPicker, setShowPicker] = useState(() => {
    const hasMultiple = (scannedData?.phones?.length > 1) || (scannedData?.emails?.length > 1);
    return hasMultiple;
  });
  const [errors, setErrors] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState('whatsapp');
  const addToast = useToast();
  const { waTemplate, emailSubject, emailBody, fillTemplate } = useTemplates();

  const handlePickerConfirm = ({ selectedPhone, selectedEmail }) => {
    const allPhones = form.phones || [];
    const allEmails = form.emails || [];
    
    // Alt values are the alternative ones in the arrays
    const altPhone = allPhones.find(p => p !== selectedPhone) || '';
    const altEmail = allEmails.find(e => e !== selectedEmail) || '';

    setForm(prev => ({
      ...prev,
      phone: selectedPhone,
      email: selectedEmail,
      altPhone,
      altEmail
    }));
    
    console.log('[Debug] Contact Selection Confirmed:', { selectedPhone, selectedEmail, altPhone, altEmail });
    setShowPicker(false);
    addToast('Selections updated!', 'success');
  };

  const handleSave = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.phone.trim()) newErrors.phone = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Please fix required fields.', 'error');
      setTimeout(() => setErrors({}), 500); // Clear shake animation
      return;
    }
    onSave(form);
  };

  return (
    <div className="page-content">
      {isOffline && (
        <div className="badge badge-warning" style={{ marginBottom: 16, width: '100%', justifyContent: 'center', padding: 8 }}>
          <span className="material-icons" style={{ fontSize: 14, marginRight: 6 }}>wifi_off</span>
          Offline Mode: Contact will be queued
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Verify Details</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Review the AI-extracted data below.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ background: 'var(--primary)', padding: '24px 20px', color: 'white', display: 'flex', gap: 20, alignItems: 'center' }}>
          {previewUrl ? (
            <img src={previewUrl} style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 8, border: '2px solid rgba(255,255,255,0.3)' }} />
          ) : (
            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
              {form.name ? form.name[0] : '?'}
            </div>
          )}
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{form.name || 'Extracted Name'}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{form.company || 'Company Name'}</div>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          {FIELDS.map(f => (
            form[f.key] && (
              <div key={f.key} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 20 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{f.label} <span className="badge badge-primary" style={{ fontSize: 8, padding: '1px 4px', marginLeft: 4 }}>AI</span></div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{form[f.key]}</div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Edit Information</h3>
        {FIELDS.map(f => {
          const hasMultipleOptions = 
            (f.key === 'phone' && form.phones?.length > 1) || 
            (f.key === 'email' && form.emails?.length > 1);

          return (
            <div key={f.key} className={`form-group ${errors[f.key] ? 'shake' : ''}`}>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  value={form[f.key] || ''}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  placeholder=" "
                  style={{
                    borderColor: errors[f.key] ? 'var(--danger)' : '',
                    paddingRight: hasMultipleOptions ? '95px' : ''
                  }}
                />
                <label className="form-label">{f.label}</label>
                {hasMultipleOptions && (
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--primary-light, rgba(37, 99, 235, 0.1))',
                      color: 'var(--primary)',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      zIndex: 10
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 13 }}>tune</span>
                    Change
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 24, overflow: 'hidden' }}>
        <button onClick={() => setPreviewOpen(!previewOpen)} style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, color: 'var(--text-primary)' }}>
            <span className="material-icons" style={{ color: 'var(--primary)' }}>visibility</span>
            Message Preview
          </div>
          <span className="material-icons" style={{ color: 'var(--text-secondary)' }}>{previewOpen ? 'expand_less' : 'expand_more'}</span>
        </button>
        {previewOpen && (
          <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: 'var(--background)', padding: 4, borderRadius: 12 }}>
              <button onClick={() => setPreviewTab('whatsapp')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: previewTab === 'whatsapp' ? 'white' : 'transparent', boxShadow: previewTab === 'whatsapp' ? 'var(--shadow-sm)' : 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: previewTab === 'whatsapp' ? 'var(--primary)' : 'var(--text-secondary)' }}>WhatsApp</button>
              <button onClick={() => setPreviewTab('email')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: previewTab === 'email' ? 'white' : 'transparent', boxShadow: previewTab === 'email' ? 'var(--shadow-sm)' : 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: previewTab === 'email' ? 'var(--primary)' : 'var(--text-secondary)' }}>Email</button>
            </div>
            {previewTab === 'whatsapp' ? (
              <div className="wa-chat-bg">
                <div className="wa-bubble">{fillTemplate(waTemplate, form)}</div>
              </div>
            ) : (
              <div className="email-preview">
                <div className="email-preview-header">
                  <strong>Subject:</strong> {fillTemplate(emailSubject, form)}
                </div>
                <div className="email-preview-body">{fillTemplate(emailBody, form)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <RippleButton className="btn btn-outline" style={{ flex: 1 }} onClick={onDiscard}>Discard</RippleButton>
        <RippleButton className="btn btn-success" style={{ flex: 2 }} onClick={handleSave}>
          <span className="material-icons">send</span>
          Save & Send
        </RippleButton>
      </div>

      {showPicker && (
        <ContactSelectionModal
          phones={form.phones || []}
          emails={form.emails || []}
          currentPhone={form.phone}
          currentEmail={form.email}
          ocrLines={form.ocrLines || []}
          onConfirm={handlePickerConfirm}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
