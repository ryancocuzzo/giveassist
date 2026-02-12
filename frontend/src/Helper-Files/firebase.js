import vars from './variables.js';

const DEMO_MODE = vars.DEMO_MODE;

/**
 * Firebase module with demo/production gating.
 *
 * In demo mode, uses a lazy-loaded mock. In production, uses Firebase compat SDK.
 * All firebase methods are accessed through the wrapper functions below,
 * which delegate to the real implementation once initialized.
 */

let _fb = null;
let _auth = null;
let _provider = null;

const _readyPromise = (async () => {
  if (DEMO_MODE) {
    const mock = await import('../demo/mockFirebase.js');
    _fb = mock.default;
    _auth = mock.auth;
    _provider = mock.provider;
  } else {
    const fb = await import('firebase/compat/app');
    await import('firebase/compat/auth');
    await import('firebase/compat/database');
    _fb = fb.default;
    _fb.initializeApp(vars.fb_config);
    _provider = new _fb.auth.GoogleAuthProvider();
    _auth = _fb.auth();
  }
})();

/**
 * Thin wrapper object that delegates to the real (or mock) firebase.
 * All methods are called lazily (never at module-load time), so
 * by the time they're invoked, _fb is guaranteed to be initialized
 * (as long as firebaseReady is awaited before rendering).
 */
const firebase = {
  database() {
    return _fb.database();
  },
  auth() {
    return _fb.auth();
  }
};

// Attach static auth namespace for `firebase.auth.Auth.Persistence.LOCAL`
firebase.auth.Auth = { Persistence: { LOCAL: 'LOCAL' } };
firebase.auth.GoogleAuthProvider = function () {};

export const firebaseReady = _readyPromise;
export const auth = () => _auth;
export const provider = () => _provider;
export default firebase;
