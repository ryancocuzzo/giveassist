/**
 * Mock Firebase for frontend demo mode.
 * Provides an in-memory database that mirrors the Firebase Realtime Database API.
 */

import { DEMO_USER, events, active_event, users, plans } from './mockData.js';

const db = {
  '/db/active_event': active_event,
  '/db/events': { ...events },
  '/db/plans': { ...plans },
  '/users': JSON.parse(JSON.stringify(users)),
  '/receipts': {},
  '/queriable': {}
};

function getNestedValue(obj, parts) {
  let current = obj;
  for (const part of parts) {
    if (current == null) return null;
    current = current[part];
  }
  return current;
}

function setNestedValue(obj, parts, value) {
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] == null) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function resolveDbPath(path) {
  const parts = path.split('/').filter(Boolean);
  for (let len = parts.length; len >= 1; len--) {
    const candidate = '/' + parts.slice(0, len).join('/');
    if (db[candidate] !== undefined) {
      const remaining = parts.slice(len);
      return { root: candidate, subPath: remaining };
    }
  }
  return { root: path, subPath: [] };
}

function readFromDb(path) {
  const { root, subPath } = resolveDbPath(path);
  const rootVal = db[root];
  if (subPath.length === 0) return rootVal;
  return getNestedValue(rootVal, subPath);
}

function writeToDb(path, value) {
  const { root, subPath } = resolveDbPath(path);
  if (subPath.length === 0) {
    db[root] = value;
  } else {
    if (db[root] == null) db[root] = {};
    setNestedValue(db[root], subPath, value);
  }
}

function createSnapshot(val) {
  return {
    val: () => val,
    forEach: (cb) => {
      if (val && typeof val === 'object') {
        Object.keys(val).forEach((key) => {
          cb({ key, val: () => val[key] });
        });
      }
    },
    exists: () => val != null
  };
}

function createRef(path) {
  return {
    once: (eventType, callback) => {
      const val = readFromDb(path);
      const snap = createSnapshot(val);
      if (callback) { callback(snap); return Promise.resolve(snap); }
      return Promise.resolve(snap);
    },
    set: (val) => { writeToDb(path, val); return Promise.resolve(); },
    push: (val) => {
      const current = readFromDb(path) || {};
      const key = 'push_' + Date.now();
      if (typeof current === 'object') { current[key] = val; writeToDb(path, current); }
      return Promise.resolve({ key });
    },
    child: (childPath) => createRef(path + '/' + childPath),
    limitToLast: (n) => ({
      once: (eventType) => {
        const val = readFromDb(path);
        return Promise.resolve(createSnapshot(val));
      }
    })
  };
}

/* Auth state listeners */
let authStateCallbacks = [];
let currentUser = DEMO_USER;

const firebase = {
  database: () => ({
    ref: (path) => createRef(path || '/')
  }),
  auth: () => {
    const authObj = {
      currentUser,
      signInWithEmailAndPassword: (email, pass) => {
        console.log('[DEMO] Login: ' + email);
        currentUser = DEMO_USER;
        authStateCallbacks.forEach((cb) => cb(currentUser));
        return Promise.resolve(currentUser);
      },
      signOut: () => {
        console.log('[DEMO] Logout');
        currentUser = null;
        authStateCallbacks.forEach((cb) => cb(null));
        return Promise.resolve();
      },
      onAuthStateChanged: (callback) => {
        authStateCallbacks.push(callback);
        // Fire immediately with current user
        setTimeout(() => callback(currentUser), 100);
      },
      setPersistence: () => Promise.resolve()
    };
    // Attach static properties
    authObj.Auth = { Persistence: { LOCAL: 'LOCAL' } };
    return authObj;
  }
};

// Make firebase.auth also act as a namespace with Auth
firebase.auth.Auth = { Persistence: { LOCAL: 'LOCAL' } };
firebase.auth.GoogleAuthProvider = function() {};

export const auth = firebase.auth();
export const provider = new firebase.auth.GoogleAuthProvider();
export default firebase;
