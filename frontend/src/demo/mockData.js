/**
 * Mock data for frontend demo mode.
 * Mirrors the backend mock data structure.
 */

export const DEMO_USER = {
  uid: 'demo_user_001',
  email: 'demo@giveassist.org',
  displayName: 'DemoUsr',
  getIdToken: () => Promise.resolve('demo_token_xxx'),
  updateEmail: () => Promise.resolve()
};

export const events = {
  eidMarch: {
    id: 'eidMarch', t: 'March 2020', s: 'Monthly donation allocation for March 2020',
    o: {
      a: { t: 'Feeding America', s: 'Nationwide network of food banks fighting hunger', org: 'Feeding America', link: 'https://feedingamerica.org', ttl: 12, vrs: { v1: 'demo_user_001' } },
      b: { t: 'Direct Relief', s: 'Improving health for people affected by poverty and emergencies', org: 'Direct Relief', link: 'https://directrelief.org', ttl: 8 },
      c: { t: 'Habitat for Humanity', s: 'Building homes, communities, and hope', org: 'Habitat for Humanity', link: 'https://habitat.org', ttl: 5 },
      ttl: 25
    },
    ttl: 62.38, tu: 14, w: { votes: 12, id: 'a' }, used: true
  },
  eidApril: {
    id: 'eidApril', t: 'April 2020', s: 'Monthly donation allocation for April 2020',
    o: {
      a: { t: 'COVID-19 Relief Fund', s: 'Supporting frontline workers and affected communities', org: 'GlobalGiving', ttl: 15 },
      b: { t: 'Doctors Without Borders', s: 'Medical humanitarian assistance worldwide', org: 'MSF', ttl: 18, vrs: { v1: 'demo_user_001' } },
      c: { t: 'World Central Kitchen', s: 'Using the power of food to heal communities', org: 'WCK', ttl: 10 },
      ttl: 43
    },
    ttl: 78.50, tu: 18, w: { votes: 18, id: 'b' }, used: true
  },
  eidMay: {
    id: 'eidMay', t: 'May 2020', s: 'Monthly donation allocation for May 2020',
    o: {
      a: { t: 'St. Jude Children\'s Hospital', s: 'Leading the way the world treats childhood cancer', org: 'St. Jude', ttl: 22, vrs: { v1: 'demo_user_001' } },
      b: { t: 'American Red Cross', s: 'Disaster relief and emergency assistance', org: 'Red Cross', ttl: 14 },
      c: { t: 'NAACP Legal Defense Fund', s: 'Fighting for racial justice through litigation', org: 'NAACP LDF', ttl: 19 },
      ttl: 55
    },
    ttl: 104.72, tu: 22, w: { votes: 22, id: 'a' }, used: true
  },
  eidJune: {
    id: 'eidJune', t: 'June 2020', s: 'Monthly donation allocation for June 2020',
    o: {
      a: { t: 'ACLU Foundation', s: 'Defending individual rights and liberties', org: 'ACLU', ttl: 16 },
      b: { t: 'Ocean Conservancy', s: 'Protecting the ocean from global challenges', org: 'Ocean Conservancy', ttl: 11 },
      c: { t: 'Equal Justice Initiative', s: 'Ending mass incarceration and excessive punishment', org: 'EJI', ttl: 20, vrs: { v1: 'demo_user_001' } },
      ttl: 47
    },
    ttl: 89.55, tu: 20, w: { votes: 20, id: 'c' }, used: true
  },
  eidJuly: {
    id: 'eidJuly', t: 'July 2020', s: 'Monthly donation allocation for July 2020 — vote now!',
    o: {
      a: { t: 'Team Trees', s: 'Planting 20 million trees to restore forests worldwide', org: 'Arbor Day Foundation', ttl: 8, vrs: { v1: 'demo_user_001' } },
      b: { t: 'Khan Academy', s: 'Free world-class education for anyone, anywhere', org: 'Khan Academy', ttl: 5 },
      c: { t: 'Water.org', s: 'Safe water and sanitation for families in need', org: 'Water.org', ttl: 3 },
      ttl: 16
    },
    ttl: 49.90, tu: 12, used: false
  }
};

export const active_event = 'eidJuly';

export const users = {
  demo_user_001: {
    i: { n: 'Demo User', e: 'demo@giveassist.org', p: 'PX,4.99', dn: 'DemoUsr', j: '01/15/2020', z: '+10000000000' },
    d: { t: 24.95 },
    st: { id: 'cus_demo_001', sub: 'sub_demo_001', pcs: 'OK' },
    v: {
      eidMarch: { don: 4.99, x: 'a' },
      eidApril: { don: 4.99, x: 'b' },
      eidMay: { don: 4.99, x: 'a' },
      eidJune: { don: 4.99, x: 'c' },
      eidJuly: { don: 4.99, x: 'a' }
    }
  }
};

export const plans = {
  PX: { ttl: 14, mr: 'June 15, 2020' },
  PY: { ttl: 8, mr: 'June 12, 2020' },
  PZ: { ttl: 2, mr: 'May 30, 2020' }
};
