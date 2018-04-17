const { getTripBalance } = require('../utils');

async function tripBalance(
  parent,
  args,
  ctx,
  info) {

  const { transactions, users } = parent;
  const ledger = getTripBalance(transactions, users);
  return Object.values(ledger);
}

module.exports = {
  tripBalance,
};
