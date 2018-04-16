async function tripBalance(
  parent,
  args,
  ctx,
  info) {

  const { transactions, users } = parent;

  const ledger = {};
  for (var user of users) {
    ledger[user.id] = {user: user, balance: 0};
  }

  const numUsers = users.length;
  for (var t of transactions) {
    const perPersonCost = t.amount / numUsers;

    for (var user of users) {
      if (user.id === t.user.id) {
        ledger[user.id]["balance"] += t.amount - perPersonCost;
      } else {
        ledger[user.id]["balance"] -= perPersonCost;
      }
    }
  }
  return Object.values(ledger);
}

module.exports = {
  tripBalance,
};
