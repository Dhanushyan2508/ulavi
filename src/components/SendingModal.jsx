import { useState, useEffect } from 'react';

export default function SendingModal({ isOffline, onComplete }) {
  const [waProgress, setWaProgress] = useState(0);
  const [emailProgress, setEmailProgress] = useState(0);
  const [zohoProgress, setZohoProgress] = useState(0);
  
  const [waStatus, setWaStatus] = useState('sending');
  const [emailStatus, setEmailStatus] = useState('sending');
  const [zohoStatus, setZohoStatus] = useState('sending');
  
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const waInterval = setInterval(() => {
      setWaProgress(prev => {
        if (prev >= 100) {
          clearInterval(waInterval);
          setWaStatus(isOffline ? 'queued' : 'sent');
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    const emailInterval = setInterval(() => {
      setEmailProgress(prev => {
        if (prev >= 100) {
          clearInterval(emailInterval);
          setEmailStatus(isOffline ? 'queued' : 'sent');
          return 100;
        }
        return prev + 3;
      });
    }, 70);

    const zohoInterval = setInterval(() => {
      setZohoProgress(prev => {
        if (prev >= 100) {
          clearInterval(zohoInterval);
          setZohoStatus(isOffline ? 'queued' : 'synced');
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    return () => {
      clearInterval(waInterval);
      clearInterval(emailInterval);
      clearInterval(zohoInterval);
    };
  }, [isOffline]);

  useEffect(() => {
    if (waProgress === 100 && emailProgress === 100 && zohoProgress === 100) {
      const timer = setTimeout(() => setAllDone(true), 600);
      return () => clearTimeout(timer);
    }
  }, [waProgress, emailProgress, zohoProgress]);

  const StatusRow = ({ label, icon, color, progress, status }) => {
    const isSending = status === 'sending';
    const isSent = status === 'sent' || status === 'synced';
    const isQueued = status === 'queued';

    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
            <span className="material-icons" style={{ color }}>{icon}</span>
            {label}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>
            {isSending ? `${progress}%` : isSent ? (status === 'synced' ? 'SYNCED' : 'DELIVERED') : 'QUEUED'}
          </div>
        </div>
        <div style={{ height: 6, background: 'var(--background)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${progress}%`, 
            background: isQueued ? 'var(--warning)' : color, 
            transition: 'width 0.3s ease',
            borderRadius: 10
          }} />
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-sheet" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 24 }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: 48, height: 48, borderWidth: 4 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{allDone ? 'Success!' : 'Processing Dispatches'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{allDone ? 'Your follow-ups and syncs are ready.' : 'Please wait while we process the dispatch.'}</p>
        </div>

        <div style={{ textAlign: 'left', marginBottom: 24 }}>
          <StatusRow label="WhatsApp" icon="chat" color="#16A34A" progress={waProgress} status={waStatus} />
          <StatusRow label="Email" icon="email" color="var(--primary)" progress={emailProgress} status={emailStatus} />
          <StatusRow label="Zoho CRM Sync" icon="cloud_sync" color="#EA580C" progress={zohoProgress} status={zohoStatus} />
        </div>

        {allDone && (
          <button className="btn btn-primary btn-full status-sent" onClick={() => onComplete(waStatus, emailStatus, zohoStatus)}>
            Continue to Contacts
          </button>
        )}
      </div>
    </div>
  );
}
