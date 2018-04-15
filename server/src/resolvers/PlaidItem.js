const { getTransactions } = require('../utils');


async function plaidTransactions(
  parent,
  { startDate, endDate, accountIds, count, offset },
  ctx,
  info) {

  return getTransactions(
    ctx, parent.userId, startDate, endDate,
    { accountIds, count, offset });
}

module.exports = {
  plaidTransactions,
};
