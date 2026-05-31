import { useState, useRef } from 'react';
import { useTemplates } from '../context/TemplateContext';
import { useToast } from '../context/ToastContext';

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

export default function TemplatesScreen() {
  const {
    waTemplate, setWaTemplate, resetWa,
    emailSubject, setEmailSubject,
    emailBody, setEmailBody, resetEmail,
    fillTemplate, VARIABLES, SAMPLE_VALUES,
  } = useTemplates();
  const addToast = useToast();

  const waRef = useRef(null);
  const emailSubjectRef = useRef(null);
  const emailBodyRef = useRef(null);
  const [activeEmailField, setActiveEmailField] = useState('body');

  const sampleContact = {
    name: SAMPLE_VALUES['{{name}}'],
    company: SAMPLE_VALUES['{{company}}'],
    phone: SAMPLE_VALUES['{{phone}}'],
    email: SAMPLE_VALUES['{{email}}'],
  };

  const insertAtCursor = (ref, setter, variable) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const newVal = val.substring(0, start) + variable + val.substring(end);
    setter(newVal);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + variable.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const VariableSelector = ({ onInsert }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
      {VARIABLES.map(v => (
        <button key={v} className="badge badge-primary" style={{ border: 'none', cursor: 'pointer', fontSize: 10, textTransform: 'none' }} onClick={() => onInsert(v)}>
          {v}
        </button>
      ))}
    </div>
  );

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Templates</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Personalize your automated follow-ups.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span className="material-icons" style={{ color: '#16A34A' }}>chat</span>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>WhatsApp Follow-up</h3>
        </div>
        <div className="form-group">
          <textarea
            ref={waRef}
            className="form-input"
            style={{ minHeight: 140, fontSize: 14, lineHeight: 1.5 }}
            value={waTemplate}
            onChange={e => setWaTemplate(e.target.value)}
            placeholder=" "
          />
          <label className="form-label">Message Template</label>
          <VariableSelector onInsert={v => insertAtCursor(waRef, setWaTemplate, v)} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <RippleButton className="btn btn-success" style={{ flex: 1 }} onClick={() => addToast('WhatsApp saved', 'success')}>Save Changes</RippleButton>
          <RippleButton className="btn btn-outline" onClick={resetWa}>Reset</RippleButton>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Preview</div>
          <div className="wa-chat-bg">
            <div className="wa-bubble">{fillTemplate(waTemplate, sampleContact)}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span className="material-icons" style={{ color: 'var(--primary)' }}>email</span>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Email Follow-up</h3>
        </div>
        <div className="form-group">
          <input
            ref={emailSubjectRef}
            className="form-input"
            value={emailSubject}
            onChange={e => setEmailSubject(e.target.value)}
            onFocus={() => setActiveEmailField('subject')}
            placeholder=" "
          />
          <label className="form-label">Subject Line</label>
        </div>
        <div className="form-group">
          <textarea
            ref={emailBodyRef}
            className="form-input"
            style={{ minHeight: 180, fontSize: 14, lineHeight: 1.6 }}
            value={emailBody}
            onChange={e => setEmailBody(e.target.value)}
            onFocus={() => setActiveEmailField('body')}
            placeholder=" "
          />
          <label className="form-label">Email Body</label>
          <VariableSelector onInsert={v => {
            const ref = activeEmailField === 'subject' ? emailSubjectRef : emailBodyRef;
            const setter = activeEmailField === 'subject' ? setEmailSubject : setEmailBody;
            insertAtCursor(ref, setter, v);
          }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <RippleButton className="btn btn-primary" style={{ flex: 1 }} onClick={() => addToast('Email saved', 'success')}>Save Changes</RippleButton>
          <RippleButton className="btn btn-outline" onClick={resetEmail}>Reset</RippleButton>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Preview</div>
          <div className="email-preview">
            <div className="email-preview-header">
              <strong>Subject:</strong> {fillTemplate(emailSubject, sampleContact)}
            </div>
            <div className="email-preview-body">{fillTemplate(emailBody, sampleContact)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
