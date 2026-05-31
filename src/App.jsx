import { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import './index.css';
import { useToast } from './context/ToastContext';
import { initialContacts } from './data/contacts';
import BottomNav from './components/BottomNav';
import ScanScreen from './components/ScanScreen';
import ReviewScreen from './components/ReviewScreen';
import ContactsScreen from './components/ContactsScreen';
import TemplatesScreen from './components/TemplatesScreen';
import SendingModal from './components/SendingModal';

import { initDB, getContactsFromDB, saveContactToDB, deleteContactFromDB, getQueue } from './storage/db';
import { enqueueAction, processQueue } from './queue/offlineQueue';
import DuplicateModal from './components/duplicate/DuplicateModal';
import { findDuplicates } from './utils/duplicateCheck';

const AVATAR_COLORS = ['#2563EB', '#D97706', '#16A34A', '#64748B', '#DC2626', '#7C3AED', '#DB2777'];

function App() {
  const [page, setPage] = useState('scan');
  const [contacts, setContacts] = useState([]);
  const [scannedData, setScannedData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showSending, setShowSending] = useState(false);
  const [pendingContact, setPendingContact] = useState(null);
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [duplicates, setDuplicates] = useState(null);
  const [pendingNewContact, setPendingNewContact] = useState(null);

  const addToast = useToast();

  const prepareContacts = (dbContacts) => {
    return dbContacts.map(c => {
      if (c.imageBlob) {
        c.previewUrl = URL.createObjectURL(c.imageBlob);
      }
      return c;
    });
  };

  const handleManualSync = async () => {
    if (isOffline) {
      addToast('Cannot sync while offline.', 'warning');
      return;
    }
    if (isSyncing) return;
    setIsSyncing(true);
    addToast('Syncing pending actions...', 'info');
    await processQueue(async (updatedContacts) => {
      if (updatedContacts) {
        setContacts(prepareContacts(updatedContacts).sort((a, b) => b.id - a.id));
      } else {
        const dbContacts = await getContactsFromDB();
        setContacts(prepareContacts(dbContacts).sort((a, b) => b.id - a.id));
      }
      const q = await getQueue();
      setQueueCount(q.length);
      addToast('Sync complete!', 'success');
    });
    setIsSyncing(false);
  };

  useEffect(() => {
    // Splash screen timer
    setTimeout(() => setShowSplash(false), 2000);

    // Pre-fetch Tesseract core and language data to cache them offline in the PWA service worker
    const prefetchTesseract = async () => {
      if (navigator.onLine) {
        try {
          console.log('[Tesseract] Warm-up pre-fetching core & worker assets...');
          const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
          await Tesseract.recognize(dummyImage, 'eng');
          console.log('[Tesseract] Cache warm-up successful. Ready for offline OCR.');
        } catch (err) {
          console.warn('[Tesseract] Cache pre-fetch warning:', err);
        }
      }
    };
    prefetchTesseract();

    const loadData = async () => {
      await initDB();
      let dbContacts = await getContactsFromDB();
      if (dbContacts.length > 0) {
        setContacts(prepareContacts(dbContacts).sort((a, b) => b.id - a.id));
      } else {
        setContacts(prepareContacts(initialContacts));
        for (const c of initialContacts) {
          await saveContactToDB(c);
        }
        dbContacts = initialContacts;
      }
      const q = await getQueue();
      setQueueCount(q.length);

      // Auto-sync on startup if online
      if (navigator.onLine && q.length > 0) {
        setIsSyncing(true);
        await processQueue(async (updatedContacts) => {
          if (updatedContacts) {
            setContacts(prepareContacts(updatedContacts).sort((a, b) => b.id - a.id));
          }
          const finalQ = await getQueue();
          setQueueCount(finalQ.length);
        });
        setIsSyncing(false);
      }
    };
    loadData();

    const handleOnline = async () => {
      setIsOffline(false);
      setIsSyncing(true);
      await processQueue(async (updatedContacts) => {
        if (updatedContacts) {
          setContacts(prepareContacts(updatedContacts).sort((a, b) => b.id - a.id));
        } else {
          const dbContacts = await getContactsFromDB();
          setContacts(prepareContacts(dbContacts).sort((a, b) => b.id - a.id));
        }
        const q = await getQueue();
        setQueueCount(q.length);
      });
      setIsSyncing(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleCardScanned = async (data, imgUrl) => {
    if (data.offlineSync) {
      const dbContacts = await getContactsFromDB();
      setContacts(prepareContacts(dbContacts).sort((a, b) => b.id - a.id));
      const q = await getQueue();
      setQueueCount(q.length);
      setPage('contacts');
      return;
    }
    setScannedData(data);
    setPreviewUrl(imgUrl);
    setPage('review');
  };

  const handleSaveContact = (formData) => {
    const foundDuplicates = findDuplicates(formData, contacts);
    if (foundDuplicates.length > 0) {
      setDuplicates(foundDuplicates);
      setPendingNewContact(formData);
      return;
    }
    proceedWithSave(formData);
  };

  const proceedWithSave = async (formData, skipSending = false) => {
    if (skipSending && formData.id && formData.status !== 'new') {
      const finalContact = { ...formData, updatedAt: new Date().toISOString() };
      await saveContactToDB(finalContact);
      setContacts(prev => prev.map(c => c.id === finalContact.id ? finalContact : c));
      setScannedData(null);
      setPreviewUrl(null);
      setPage('contacts');
      return;
    }

    const newContact = {
      ...formData,
      id: formData.id || Date.now(),
      status: formData.status || 'new',
      whatsappStatus: formData.whatsappStatus || 'sending',
      emailStatus: formData.emailStatus || 'sending',
      zohoStatus: formData.zohoStatus || 'sending',
      syncStatus: formData.syncStatus || 'pending',
      scannedAt: formData.scannedAt || new Date().toISOString(),
      avatarColor: formData.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    };
    setPendingContact(newContact);
    setShowSending(true);
  };

  const handleDuplicateCancel = () => {
    setDuplicates(null);
    setPendingNewContact(null);
  };

  const handleDuplicateSaveAsNew = (newContact) => {
    setDuplicates(null);
    setPendingNewContact(null);
    proceedWithSave(newContact);
  };

  const handleDuplicateUpdateExisting = (updatedContact) => {
    setDuplicates(null);
    setPendingNewContact(null);
    proceedWithSave(updatedContact, true);
  };

  const handleDuplicateMerge = (mergedContact) => {
    setDuplicates(null);
    setPendingNewContact(null);
    proceedWithSave(mergedContact, true);
  };

  const handleSendComplete = async (waStatus, emailStatus, zohoStatus) => {
    if (pendingContact) {
      const finalContact = {
        ...pendingContact,
        whatsappStatus: waStatus,
        emailStatus: emailStatus,
        zohoStatus: zohoStatus,
        syncStatus: zohoStatus === 'synced' ? 'synced' : 'pending',
      };

      // Generate a local previewUrl from imageBlob if present (for instant display in list)
      if (finalContact.imageBlob && !finalContact.previewUrl) {
        finalContact.previewUrl = URL.createObjectURL(finalContact.imageBlob);
      }

      await saveContactToDB(finalContact);
      setContacts(prev => [finalContact, ...prev]);

      if (waStatus === 'queued') {
        await enqueueAction('SEND_WHATSAPP', { contactId: finalContact.id });
      }
      if (emailStatus === 'queued') {
        await enqueueAction('SEND_EMAIL', { contactId: finalContact.id });
      }
      if (zohoStatus === 'queued') {
        await enqueueAction('SYNC_ZOHO', { contactId: finalContact.id });
      }
      
      const q = await getQueue();
      setQueueCount(q.length);
    }
    
    setShowSending(false);
    setPendingContact(null);
    setScannedData(null);
    setPreviewUrl(null);
    setPage('contacts');
  };

  const handleDiscard = () => {
    setScannedData(null);
    setPreviewUrl(null);
    setPage('scan');
  };

  const handleDeleteContact = async (id) => {
    await deleteContactFromDB(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateContact = async (updated) => {
    await saveContactToDB(updated);
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleRetryContactDispatch = async (contact) => {
    if (isOffline) {
      addToast('Cannot retry sending while offline.', 'warning');
      return;
    }
    
    addToast('Retrying dispatch...', 'info');
    
    if (contact.whatsappStatus === 'failed' || contact.whatsappStatus === 'queued') {
      await enqueueAction('SEND_WHATSAPP', { contactId: contact.id });
    }
    if (contact.emailStatus === 'failed' || contact.emailStatus === 'queued') {
      await enqueueAction('SEND_EMAIL', { contactId: contact.id });
    }
    if (contact.zohoStatus === 'failed' || contact.zohoStatus === 'queued') {
      await enqueueAction('SYNC_ZOHO', { contactId: contact.id });
    }
    
    setIsSyncing(true);
    await processQueue(async (updatedContacts) => {
      if (updatedContacts) {
        setContacts(prepareContacts(updatedContacts).sort((a, b) => b.id - a.id));
      } else {
        const dbContacts = await getContactsFromDB();
        setContacts(prepareContacts(dbContacts).sort((a, b) => b.id - a.id));
      }
      const q = await getQueue();
      setQueueCount(q.length);
      addToast('Retry completed!', 'success');
    });
    setIsSyncing(false);
  };

  const PAGE_TITLE = {
    scan: 'CardConnect AI',
    review: 'Review Contact',
    contacts: 'All Contacts',
    templates: 'Templates',
  };

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-logo">CC</div>
        <h1 style={{color: 'white', marginTop: 16}}>CardConnect AI</h1>
        <div className="spinner splash-spinner" />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-logo">
          <div className="logo-icon">
            <span className="material-icons" style={{ fontSize: 20 }}>document_scanner</span>
          </div>
          {PAGE_TITLE[page]}
        </div>
        
        <div 
          className="network-status" 
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
          onClick={handleManualSync}
          title="Click to manually sync"
        >
          {isSyncing && (
            <span className="material-icons syncing-icon" style={{ color: 'var(--primary)', fontSize: 18 }}>sync</span>
          )}
          {queueCount > 0 && (
            <div className="queue-badge">{queueCount} pending</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: isOffline ? 'var(--warning)' : 'var(--success)' }}>
            <span className="material-icons" style={{ fontSize: 16 }}>
              {isOffline ? 'wifi_off' : 'wifi'}
            </span>
            {isOffline ? 'Offline' : 'Online'}
          </div>
        </div>
      </header>

          {isOffline && (
            <div className="offline-banner">
              You are offline. Actions will be saved and synced automatically when you reconnect.
            </div>
          )}

          {showInstallPrompt && (
            <div className="install-prompt">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="app-icon-mini">CC</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14 }}>Install CardConnect AI</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Add to home screen for offline access</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setShowInstallPrompt(false)}>Later</button>
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={handleInstallClick}>Install</button>
              </div>
            </div>
          )}

          <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {page === 'scan' && (
              <ScanScreen onCardScanned={handleCardScanned} key="scan" />
            )}
            {page === 'review' && (
              <ReviewScreen
                scannedData={scannedData}
                previewUrl={previewUrl}
                onSave={handleSaveContact}
                onDiscard={handleDiscard}
                isOffline={isOffline}
                key="review"
              />
            )}
            {page === 'contacts' && (
              <ContactsScreen
                contacts={contacts}
                onDelete={handleDeleteContact}
                onUpdate={handleUpdateContact}
                onGoToScan={() => setPage('scan')}
                onRetryDispatch={handleRetryContactDispatch}
                key="contacts"
              />
            )}
            {page === 'templates' && (
              <TemplatesScreen key="templates" />
            )}
          </main>

          {showSending && (
            <SendingModal
              isOffline={isOffline}
              onComplete={handleSendComplete}
            />
          )}

          {duplicates && pendingNewContact && (
            <DuplicateModal
              duplicates={duplicates}
              newContact={pendingNewContact}
              onCancel={handleDuplicateCancel}
              onSaveAsNew={handleDuplicateSaveAsNew}
              onUpdateExisting={handleDuplicateUpdateExisting}
              onMerge={handleDuplicateMerge}
            />
          )}

          <BottomNav activePage={page} setPage={setPage} />
        </div>
  );
}

export default App;
