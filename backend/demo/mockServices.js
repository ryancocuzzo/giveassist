/**
 * Mock services for demo mode.
 * Provides in-memory stubs for Firebase Admin, Stripe, and Twilio
 * so the server runs without any external credentials.
 */

const mockData = require('./mockData');

// ─── In-Memory Database ──────────────────────────────────────────────────────

const db = {
  '/db/active_event': mockData.active_event,
  '/db/events': { ...mockData.events },
  '/db/plans': { ...mockData.plans },
  '/users': JSON.parse(JSON.stringify(mockData.users)),
  '/stripe_ids': { ...mockData.stripe_ids },
  '/admins': { ...mockData.admins },
  '/receipts': { ...mockData.receipts },
  '/queriable': {}
};

function getNestedValue(obj, pathParts) {
  let current = obj;
  for (const part of pathParts) {
    if (current == null) return null;
    current = current[part];
  }
  return current;
}

function setNestedValue(obj, pathParts, value) {
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (current[pathParts[i]] == null) current[pathParts[i]] = {};
    current = current[pathParts[i]];
  }
  current[pathParts[pathParts.length - 1]] = value;
}

function resolveDbPath(path) {
  const parts = path.split('/').filter(Boolean);

  // Try to match the longest known root path
  for (let len = parts.length; len >= 1; len--) {
    const candidateRoot = '/' + parts.slice(0, len).join('/');
    if (db[candidateRoot] !== undefined) {
      const remaining = parts.slice(len);
      if (remaining.length === 0) {
        return { root: candidateRoot, subPath: [] };
      }
      return { root: candidateRoot, subPath: remaining };
    }
  }

  // Fallback: store at full path
  return { root: path, subPath: [] };
}

function readFromDb(path) {
  const { root: rootPath, subPath } = resolveDbPath(path);
  const rootVal = db[rootPath];
  if (subPath.length === 0) return rootVal;
  return getNestedValue(rootVal, subPath);
}

function writeToDb(path, value) {
  const { root: rootPath, subPath } = resolveDbPath(path);
  if (subPath.length === 0) {
    db[rootPath] = value;
  } else {
    if (db[rootPath] == null) db[rootPath] = {};
    setNestedValue(db[rootPath], subPath, value);
  }
}

// ─── Mock Firebase Snapshot ──────────────────────────────────────────────────

function createSnapshot(val) {
  const value = val;
  return {
    val: () => value,
    forEach: (cb) => {
      if (value && typeof value === 'object') {
        Object.keys(value).forEach((key) => {
          cb({
            key,
            val: () => value[key]
          });
        });
      }
    },
    exists: () => value != null
  };
}

// ─── Mock Firebase Ref ───────────────────────────────────────────────────────

function createRef(path) {
  return {
    once: (eventType, callback) => {
      const val = readFromDb(path);
      const snap = createSnapshot(val);
      if (callback) {
        callback(snap);
        return Promise.resolve(snap);
      }
      return Promise.resolve(snap);
    },
    set: (val) => {
      writeToDb(path, val);
      return Promise.resolve();
    },
    push: (val) => {
      const current = readFromDb(path) || {};
      const key = 'push_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      if (typeof current === 'object') {
        current[key] = val;
        writeToDb(path, current);
      }
      return Promise.resolve({ key });
    },
    child: (childPath) => createRef(path + '/' + childPath),
    limitToLast: (n) => ({
      once: (eventType) => {
        const val = readFromDb(path);
        const snap = createSnapshot(val);
        return Promise.resolve(snap);
      }
    })
  };
}

// ─── Mock Firebase Root (database) ───────────────────────────────────────────

const root = {
  ref: (path) => createRef(path)
};

// ─── Mock Firebase Admin ─────────────────────────────────────────────────────

const admin = {
  auth: () => ({
    verifyIdToken: (token) => Promise.resolve({ uid: mockData.DEMO_USER_UID }),
    getUser: (uid) => {
      if (mockData.users[uid]) {
        return Promise.resolve({ uid, email: mockData.users[uid].i.e });
      }
      return Promise.reject(new Error('User not found'));
    },
    getUserByEmail: (email) => {
      for (const [uid, user] of Object.entries(mockData.users)) {
        if (user.i.e === email) return Promise.resolve({ uid, email });
      }
      return Promise.reject(new Error('User not found'));
    },
    getUserByPhoneNumber: (phone) => Promise.resolve({ uid: mockData.DEMO_USER_UID }),
    createUser: (props) => Promise.resolve({ uid: 'demo_new_' + Date.now() }),
    deleteUser: (uid) => Promise.resolve()
  }),
  database: () => root,
  credential: {
    cert: () => ({})
  }
};

// ─── Mock Stripe ─────────────────────────────────────────────────────────────

const stripe = {
  customers: {
    create: (params) => Promise.resolve({ id: 'cus_demo_new_' + Date.now(), ...params }),
    createSource: (customerId, params) => Promise.resolve({ id: 'src_demo_' + Date.now() }),
    update: (customerId, params, callback) => {
      if (callback) callback(null, { id: customerId, ...params });
      return Promise.resolve({ id: customerId, ...params });
    },
    del: (customerId, callback) => {
      if (callback) callback(null, { deleted: true });
      return Promise.resolve({ deleted: true });
    }
  },
  subscriptions: {
    create: (params, accountParams, callback) => {
      const sub = { id: 'sub_demo_' + Date.now(), items: { data: [{ id: 'si_demo' }] } };
      if (callback) callback(null, sub);
      return Promise.resolve(sub);
    },
    retrieve: (subId) => Promise.resolve({
      id: subId,
      items: { data: [{ id: 'si_demo_item' }] }
    }),
    update: (subId, params, callback) => {
      const sub = { id: subId, ...params };
      if (callback) callback(null, sub);
      return Promise.resolve(sub);
    }
  }
};

// ─── Mock Twilio ─────────────────────────────────────────────────────────────

const twilio_client = {
  messages: {
    create: (params) => {
      console.log('[DEMO] SMS would send to ' + params.to + ': ' + params.body.substring(0, 80) + '...');
      return Promise.resolve({ sid: 'SM_demo_' + Date.now() });
    }
  }
};

module.exports = {
  root,
  admin,
  stripe,
  twilio_client
};
