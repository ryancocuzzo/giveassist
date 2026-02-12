const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const server_root = import.meta.env.VITE_API_URL || 'http://localhost:1234';

const stripe_api_key = DEMO_MODE
  ? 'pk_test_demo'
  : (import.meta.env.VITE_STRIPE_KEY || '');

const fb_config = DEMO_MODE
  ? {
      apiKey: 'demo-api-key',
      authDomain: 'demo.firebaseapp.com',
      databaseURL: 'https://demo.firebaseio.com',
      projectId: 'demo-project',
      storageBucket: 'demo.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000:web:demo'
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

export const PLANS = [
  { title: 'PX', cost: 4.99 },
  { title: 'PY', cost: 2.99 },
  { title: 'PZ', cost: null }
];

export function lowestPlanCost() {
  let lowest = 999;
  PLANS.forEach((plan) => {
    if (plan.cost != null && plan.cost < lowest) lowest = plan.cost;
  });
  return lowest;
}

export function priceForPlanWithTitle(title) {
  if (!title || typeof title !== 'string' || title.length > 2) {
    throw new Error('priceForPlanWithTitle: incorrect title. Got ' + title);
  }
  let cost = null;
  PLANS.forEach((plan) => {
    if (title === plan.title) cost = plan.cost;
  });
  return cost;
}

export function titleOfPlanWithCost(cost) {
  if (!cost || typeof cost !== 'number') {
    throw new Error('titleOfPlanWithCost: incorrect cost.');
  }
  let title = null;
  PLANS.forEach((plan) => {
    if (cost === plan.cost) title = plan.title;
  });
  return title || 'PZ';
}

export function planExists(title) {
  if (!title || typeof title !== 'string' || title.length > 2) {
    throw new Error('planExists: incorrect title.');
  }
  let found = false;
  PLANS.forEach((plan) => {
    if (title === plan.title) found = true;
  });
  return found;
}

export const formatPlan = (planname, customAmt) => {
  if (typeof planname !== 'string' || customAmt === undefined) {
    throw new Error('formatPlan: invalid params');
  }
  const found_price = priceForPlanWithTitle(planname);
  const price = found_price ? found_price : customAmt;
  return planname + ',' + String(price);
};

const variables = {
  DEMO_MODE,
  local_urls: {
    home: '/',
    vote: '/vote',
    stats: '/stats',
    login: '/login',
    signUp: '/signup'
  },
  server_urls: {
    home: server_root,
    eventPrivileges: server_root + '/eventPrivileges',
    createEvent: server_root + '/createEvent',
    changePaymentSource: server_root + '/changePaymentSource',
    change_plan: server_root + '/change_plan',
    deleteUser: server_root + '/deleteUser',
    castVote: server_root + '/castVote',
    initiate_new_user: server_root + '/initiate_new_user',
    totalUsersForEvent: server_root + '/totalUsersForEvent',
    get_plan_stats: server_root + '/get_plan_stats'
  },
  stripe_api_key,
  fb_config
};

export default variables;
