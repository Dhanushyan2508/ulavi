import { openDB } from 'idb';

const DB_NAME = 'cardconnect-db';
const DB_VERSION = 1;

let dbPromise = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
};

export const getContactsFromDB = async () => {
  const db = await initDB();
  return db.getAll('contacts');
};

export const saveContactToDB = async (contact) => {
  const db = await initDB();
  return db.put('contacts', contact);
};

export const deleteContactFromDB = async (id) => {
  const db = await initDB();
  return db.delete('contacts', id);
};

export const addActionToQueue = async (action) => {
  const db = await initDB();
  return db.add('queue', { ...action, timestamp: Date.now() });
};

export const getQueue = async () => {
  const db = await initDB();
  return db.getAll('queue');
};

export const removeActionFromQueue = async (id) => {
  const db = await initDB();
  return db.delete('queue', id);
};

export const clearQueue = async () => {
  const db = await initDB();
  return db.clear('queue');
};
