import { addActionToQueue, getQueue, removeActionFromQueue, saveContactToDB, getContactsFromDB } from '../storage/db';

// Simulate sending a WhatsApp message
export const simulateSendWhatsApp = async (contact) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 90% success rate to simulate reality
      if (Math.random() > 0.1) resolve({ status: 'sent' });
      else reject(new Error('WhatsApp network failure'));
    }, 1500);
  });
};

// Simulate sending an Email
export const simulateSendEmail = async (contact) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) resolve({ status: 'sent' });
      else reject(new Error('Email server network failure'));
    }, 1200);
  });
};

// Simulate syncing to Zoho CRM
export const simulateSyncZoho = async (contact) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) resolve({ status: 'synced' });
      else reject(new Error('Zoho CRM sync connection failure'));
    }, 1000);
  });
};

let isProcessing = false;

export const enqueueAction = async (actionType, payload) => {
  const queue = await getQueue();
  const exists = queue.some(item => item.type === actionType && item.payload?.contactId === payload.contactId);
  if (!exists) {
    await addActionToQueue({ type: actionType, payload });
  }
};

// Process the offline queue when connection is restored
export const processQueue = async (onQueueProcessed) => {
  if (isProcessing) return;
  if (!navigator.onLine) return;
  
  isProcessing = true;
  
  try {
    let queue = await getQueue();
    if (queue.length === 0) return;

    const contacts = await getContactsFromDB();
    const contactsMap = new Map(contacts.map(c => [c.id, c]));
    const processedIds = new Set();

    while (queue.length > 0) {
      // Filter out items we've already tried in this run to avoid infinite loops on failures
      const pendingItems = queue.filter(item => !processedIds.has(item.id));
      if (pendingItems.length === 0) break;

      for (const item of pendingItems) {
        processedIds.add(item.id);
        const { type, payload } = item;
        let contact = contactsMap.get(payload.contactId);
        
        if (!contact) {
          // If the contact was deleted, remove it from queue
          await removeActionFromQueue(item.id);
          continue;
        }

        try {
          if (type === 'SEND_WHATSAPP') {
            contact = { ...contact, whatsappStatus: 'sending' };
            contactsMap.set(contact.id, contact);
            await saveContactToDB(contact);

            await simulateSendWhatsApp(contact);
            
            contact = { ...contact, whatsappStatus: 'sent' };
            contactsMap.set(contact.id, contact);
            await saveContactToDB(contact);
            await removeActionFromQueue(item.id);
          } else if (type === 'SEND_EMAIL') {
            contact = { ...contact, emailStatus: 'sending' };
            contactsMap.set(contact.id, contact);
            await saveContactToDB(contact);

            await simulateSendEmail(contact);
            
            contact = { ...contact, emailStatus: 'sent' };
            contactsMap.set(contact.id, contact);
            await saveContactToDB(contact);
            await removeActionFromQueue(item.id);
          } else if (type === 'SYNC_ZOHO') {
            contact = { ...contact, zohoStatus: 'sending', syncStatus: 'pending' };
            contactsMap.set(contact.id, contact);
            await saveContactToDB(contact);

            await simulateSyncZoho(contact);
            
            contact = { ...contact, zohoStatus: 'synced', syncStatus: 'synced' };
            contactsMap.set(contact.id, contact);
            await saveContactToDB(contact);
            await removeActionFromQueue(item.id);
          }
        } catch (err) {
          console.error(`Failed to process queued action ${type}:`, err);
          // Update status to failed so the user knows it failed and can manually retry
          if (type === 'SEND_WHATSAPP') {
            contact = { ...contact, whatsappStatus: 'failed' };
          } else if (type === 'SEND_EMAIL') {
            contact = { ...contact, emailStatus: 'failed' };
          } else if (type === 'SYNC_ZOHO') {
            contact = { ...contact, zohoStatus: 'failed' };
          }
          contactsMap.set(contact.id, contact);
          await saveContactToDB(contact);
          
          // Note: we leave it in the queue or remove it depending on retry behavior.
          // Let's keep it in the queue for auto-retry next time processing is triggered,
          // but prevent it from infinite looping in the *current* processQueue execution
          // by tracking processedIds.
        }
      }

      // Re-read queue list to check for updates
      queue = await getQueue();
      // If all remaining items in queue are already in processedIds, stop loop
      const remainingUnprocessed = queue.filter(item => !processedIds.has(item.id));
      if (remainingUnprocessed.length === 0) break;
    }

    if (onQueueProcessed) {
      onQueueProcessed(Array.from(contactsMap.values()));
    }
  } finally {
    isProcessing = false;
  }
};
