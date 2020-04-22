const PLANS = [
  { title: 'PX', cost: 4.99, id: 'plan_FOXcPq3uHNqx4X' },
  { title: 'PY', cost: 2.99, id: 'plan_FOXdWHDyLP44tO' },
  { title: 'PZ', cost: null, id: 'plan_FNDp8ntFqUpWgO' }
];



function lowestPlanCost() {
  var lowest = 999;
  PLANS.forEach((plan) => {
    if (plan.cost != null && plan.cost < lowest )
      lowest = plan.cost;
  });
  return lowest;
}

/* Ex input - PX */
function priceForPlanWithTitle (title) {
  if (!title || typeof title !== 'string' || title.length > 2) throw 'priceForPlanWithTitle params issue: incorrect or wrong-formatted title.';
  var cost = null;
  PLANS.forEach((plan) => {
    if (title === plan.title)
      cost = plan.cost;
  });
  return cost;
}

function idForPlanWithTitle (title) {
  if (!title || typeof title !== 'string' || title.length > 2) throw 'idForPlanWithTitle params issue: incorrect or wrong-formatted title.';
  var id = null;
  PLANS.forEach((plan) => {
    if (title === plan.title)
      id = plan.id;
  });
  return id;
}

/* Ex input - 3.99 */
function titleOfPlanWithCost (cost) {
  if (!cost || typeof cost !== 'number') throw 'titleOfPlanWithCost params issue: incorrect or wrong-formatted cost.';
  var title = null;
  PLANS.forEach((plan) => {
    if (cost === plan.cost)
      title = plan.title;
  });
  return title || 'PZ';
}

function planExists(title) {
  if (!title || typeof title !== 'string' || title.length > 2) throw 'planExists params issue: incorrect or wrong-formatted title.';
  var ret = false;
  PLANS.forEach((plan) => {
    if (title === plan.title)
      ret = true;
  });

  return ret;
}

/* @param planname will arrive as a string (i.e PX)
    @param customAmt will arrive as a num or null (i.e 3.99)
    @return a db-usable plan format (i.e PX,3.99 or PY,4.99 or PZ,12(whole #))   */
const formatPlan = (planname, customAmt) => {
    // ensure it's a floating point number
    if (typeof planname !== 'string' || customAmt === undefined) throw 'formatPlan params error';
    let found_price = priceForPlanWithTitle(planname);
    let price = found_price ? found_price : customAmt;
    return planname+ ',' + String(price);
}

module.exports = {
    PLANS: PLANS,
    lowestPlanCost: lowestPlanCost,
    priceForPlanWithTitle: priceForPlanWithTitle,
    titleOfPlanWithCost: titleOfPlanWithCost,
    planExists: planExists,
    formatPlan: formatPlan,
    idForPlanWithTitle: idForPlanWithTitle
}
