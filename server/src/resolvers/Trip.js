const { getTripBalance, getPaymentDetails } = require('../utils');

async function tripBalance(
  parent,
  args,
  ctx,
  info) {

  const { transactions, users } = parent;
  const ledger = getTripBalance(transactions, users);
  return Object.values(ledger);
}

async function plannedPayments(
  parent,
  args,
  ctx,
  info) {

  const { transactions, users } = parent;
  const ledger = getTripBalance(transactions, users);
  const paymentDetails = getPaymentDetails(ledger);

  const ret = [];
  for (fromUserId in paymentDetails) {
    for (toUserId in paymentDetails[fromUserId]) {
      ret.push({
        from: users.find((user) => user.id === fromUserId),
        to: users.find((user) => user.id === toUserId),
        amount: paymentDetails[fromUserId][toUserId],
      });
    }
  }
  return ret;
}

module.exports = {
  tripBalance,
  plannedPayments,
};
