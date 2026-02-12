/**
 * Mock data for demo mode.
 * Simulates realistic Giveassist platform state with events, users, and votes.
 */

const DEMO_USER_UID = 'demo_user_001';
const DEMO_CUSTOMER_ID = 'cus_demo_001';

const users = {
  [DEMO_USER_UID]: {
    i: {
      n: 'Demo User',
      e: 'demo@giveassist.org',
      p: 'PX,4.99',
      dn: 'DemoUsr',
      j: '01/15/2020',
      z: '+10000000000'
    },
    d: { t: 24.95 },
    st: {
      id: DEMO_CUSTOMER_ID,
      sub: 'sub_demo_001',
      pcs: 'OK'
    },
    v: {
      eidMarch: { don: 4.99, x: 'a' },
      eidApril: { don: 4.99, x: 'b' },
      eidMay:   { don: 4.99, x: 'a' },
      eidJune:  { don: 4.99, x: 'c' },
      eidJuly:  { don: 4.99, x: 'a' }
    }
  }
};

const events = {
  eidMarch: {
    id: 'eidMarch',
    t: 'March 2020',
    s: 'Monthly donation allocation for March 2020',
    o: {
      a: { t: 'Feeding America', s: 'Nationwide network of food banks fighting hunger', org: 'Feeding America', link: 'https://feedingamerica.org', ttl: 12, vrs: { v1: DEMO_USER_UID } },
      b: { t: 'Direct Relief', s: 'Improving health for people affected by poverty and emergencies', org: 'Direct Relief', link: 'https://directrelief.org', ttl: 8 },
      c: { t: 'Habitat for Humanity', s: 'Building homes, communities, and hope', org: 'Habitat for Humanity', link: 'https://habitat.org', ttl: 5 },
      ttl: 25
    },
    ttl: 62.38,
    tu: 14,
    w: { votes: 12, id: 'a' },
    used: true
  },
  eidApril: {
    id: 'eidApril',
    t: 'April 2020',
    s: 'Monthly donation allocation for April 2020',
    o: {
      a: { t: 'COVID-19 Relief Fund', s: 'Supporting frontline workers and affected communities', org: 'GlobalGiving', link: 'https://globalgiving.org', ttl: 15 },
      b: { t: 'Doctors Without Borders', s: 'Medical humanitarian assistance worldwide', org: 'MSF', link: 'https://msf.org', ttl: 18, vrs: { v1: DEMO_USER_UID } },
      c: { t: 'World Central Kitchen', s: 'Using the power of food to heal communities', org: 'WCK', link: 'https://wck.org', ttl: 10 },
      ttl: 43
    },
    ttl: 78.50,
    tu: 18,
    w: { votes: 18, id: 'b' },
    used: true
  },
  eidMay: {
    id: 'eidMay',
    t: 'May 2020',
    s: 'Monthly donation allocation for May 2020',
    o: {
      a: { t: 'St. Jude Children\'s Hospital', s: 'Leading the way the world understands and treats childhood cancer', org: 'St. Jude', link: 'https://stjude.org', ttl: 22, vrs: { v1: DEMO_USER_UID } },
      b: { t: 'American Red Cross', s: 'Disaster relief and emergency assistance', org: 'Red Cross', link: 'https://redcross.org', ttl: 14 },
      c: { t: 'NAACP Legal Defense Fund', s: 'Fighting for racial justice through litigation and advocacy', org: 'NAACP LDF', link: 'https://naacpldf.org', ttl: 19 },
      ttl: 55
    },
    ttl: 104.72,
    tu: 22,
    w: { votes: 22, id: 'a' },
    used: true
  },
  eidJune: {
    id: 'eidJune',
    t: 'June 2020',
    s: 'Monthly donation allocation for June 2020',
    o: {
      a: { t: 'ACLU Foundation', s: 'Defending and preserving individual rights and liberties', org: 'ACLU', link: 'https://aclu.org', ttl: 16 },
      b: { t: 'Ocean Conservancy', s: 'Protecting the ocean from today\'s greatest global challenges', org: 'Ocean Conservancy', link: 'https://oceanconservancy.org', ttl: 11 },
      c: { t: 'Equal Justice Initiative', s: 'Committed to ending mass incarceration and excessive punishment', org: 'EJI', link: 'https://eji.org', ttl: 20, vrs: { v1: DEMO_USER_UID } },
      ttl: 47
    },
    ttl: 89.55,
    tu: 20,
    w: { votes: 20, id: 'c' },
    used: true
  },
  eidJuly: {
    id: 'eidJuly',
    t: 'July 2020',
    s: 'Monthly donation allocation for July 2020 — vote now!',
    o: {
      a: { t: 'Team Trees', s: 'Planting 20 million trees to restore forests worldwide', org: 'Arbor Day Foundation', link: 'https://teamtrees.org', ttl: 8, vrs: { v1: DEMO_USER_UID } },
      b: { t: 'Khan Academy', s: 'Free world-class education for anyone, anywhere', org: 'Khan Academy', link: 'https://khanacademy.org', ttl: 5 },
      c: { t: 'Water.org', s: 'Safe water and sanitation for families in need', org: 'Water.org', link: 'https://water.org', ttl: 3 },
      ttl: 16
    },
    ttl: 49.90,
    tu: 12,
    used: false
  }
};

const active_event = 'eidJuly';

const plans = {
  PX: { ttl: 14, mr: 'June 15, 2020' },
  PY: { ttl: 8,  mr: 'June 12, 2020' },
  PZ: { ttl: 2,  mr: 'May 30, 2020' }
};

const admins = {
  [DEMO_USER_UID]: true
};

const stripe_ids = {
  [DEMO_CUSTOMER_ID]: { uid: DEMO_USER_UID }
};

const receipts = {};

module.exports = {
  DEMO_USER_UID,
  DEMO_CUSTOMER_ID,
  users,
  events,
  active_event,
  plans,
  admins,
  stripe_ids,
  receipts
};
