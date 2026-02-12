const PLANS = [
  { title: 'PX', cost: 4.99, id: 'plan_FOXcPq3uHNqx4X' },
  { title: 'PY', cost: 2.99, id: 'plan_FOXdWHDyLP44tO' },
  { title: 'PZ', cost: null, id: 'plan_FNDp8ntFqUpWgO' }
];

function lowestPlanCost() {
  let lowest = 999;
  PLANS.forEach((plan) => {
    if (plan.cost != null && plan.cost < lowest) {
      lowest = plan.cost;
    }
  });
  return lowest;
}

/** @param {string} title - e.g. 'PX' */
function priceForPlanWithTitle(title) {
  if (!title || typeof title !== 'string' || title.length > 2) {
    throw new Error('priceForPlanWithTitle: incorrect or wrong-formatted title. Got ' + title);
  }
  let cost = null;
  PLANS.forEach((plan) => {
    if (title === plan.title) cost = plan.cost;
  });
  return cost;
}

/** @param {string} title - e.g. 'PX' */
function idForPlanWithTitle(title) {
  if (!title || typeof title !== 'string' || title.length > 2) {
    throw new Error('idForPlanWithTitle: incorrect or wrong-formatted title. Got ' + title);
  }
  let id = null;
  PLANS.forEach((plan) => {
    if (title === plan.title) id = plan.id;
  });
  return id;
}

/** @param {number} cost - e.g. 3.99 */
function titleOfPlanWithCost(cost) {
  if (!cost || typeof cost !== 'number') {
    throw new Error('titleOfPlanWithCost: incorrect or wrong-formatted cost.');
  }
  let title = null;
  PLANS.forEach((plan) => {
    if (cost === plan.cost) title = plan.title;
  });
  return title || 'PZ';
}

function planExists(title) {
  if (!title || typeof title !== 'string' || title.length > 2) {
    throw new Error('planExists: incorrect or wrong-formatted title.');
  }
  let found = false;
  PLANS.forEach((plan) => {
    if (title === plan.title) found = true;
  });
  return found;
}

/**
 * @param {string} planname - e.g. 'PX'
 * @param {number|null} customAmt - e.g. 3.99
 * @returns {string} db-usable plan format, e.g. 'PX,4.99' or 'PZ,12'
 */
const formatPlan = (planname, customAmt) => {
  if (typeof planname !== 'string' || customAmt === undefined) {
    throw new Error('formatPlan: invalid params');
  }
  const found_price = priceForPlanWithTitle(planname);
  const price = found_price ? found_price : customAmt;
  return planname + ',' + String(price);
};

module.exports = {
  PLANS,
  lowestPlanCost,
  priceForPlanWithTitle,
  titleOfPlanWithCost,
  planExists,
  formatPlan,
  idForPlanWithTitle
};
