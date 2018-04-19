const jwt = require('jsonwebtoken');
const moment = require('moment');
const envvar = require('envvar');

const APP_SECRET = envvar.string('APP_SECRET');

function getUserId(context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, APP_SECRET)
    return userId
  }

  throw new Error('Not authenticated')
}


async function getTransactions(
    ctx,
    userId,
    startDate,
    endDate,
    { accountIds, count, offset }) {

  const userItems = await ctx.db.query.items({
    where: { user: { id: userId } }
  });

  if (!userItems || userItems.length === 0) {
    return;
  }

  // TODO: for now, assume each user only has 1 item.
  const accessToken = userItems[0].accessToken;

  // Pull transactions for the Item for the last 30 days
  startDate = startDate || moment().subtract(30, 'days').format('YYYY-MM-DD');
  endDate = endDate || moment().format('YYYY-MM-DD');
  // TODO: support accountIds
  count = count || 250;
  offset = offset || 0;

  const transactionsData = await ctx.plaidClient.getTransactions(
    accessToken,
    startDate,
    endDate,
    {
      count: count,
      offset: offset,
    }
  );

  return transactionsData.transactions;
}


/**
 *
 * @param {TripTransaction} transactions
 * @param {Users} users
 */
function getTripBalance(transactions, users) {
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
  return ledger;
}


/**
 *
 * @param {Object} ledger: {userId: {user: {id}, balance}}
 */
function getPaymentDetails(ledger) {
  // TODO: this function needs to be locked!!!

  const simpleLedger = {};
  for (userId in ledger) {
    simpleLedger[userId] = ledger[userId]['balance'];
  }

  const payments = {};  // {fromUser: {toUser: amount}}

  const sumReducer = (sumSoFar, nextElement) => sumSoFar + nextElement;
  if (
    (Object.values(simpleLedger).reduce(sumReducer) > 0.01) ||
    (Object.values(simpleLedger).reduce(sumReducer) < -0.01)) {
    throw new Error("The current balance does not sum to 0");
  }

  const getItemwithMinValueReducer = (a, b) => a[1] < b[1] ? a : b;
  const getItemwithMaxValueReducer = (a, b) => a[1] > b[1] ? a : b;

  let userIdWithLeastMoney;
  // loop until all values of simpleLedger are 0
  while (Object.values(simpleLedger).filter((e) => e > 0.01 || e < -0.01).length > 0) {

    entryWithLeastMoney = Object.entries(simpleLedger).reduce(
      getItemwithMinValueReducer);
    entryWithMostMoney = Object.entries(simpleLedger).reduce(
      getItemwithMaxValueReducer);

    const fromUser = entryWithLeastMoney[0];
    const fromUserOwes = Math.abs(entryWithLeastMoney[1]);

    const toUser = entryWithMostMoney[0];
    const toUserNeeds = Math.abs(entryWithMostMoney[1]);

    if (!(fromUser in payments)) {
      payments[fromUser] = {};
    }

    if (Math.abs(fromUserOwes) >= toUserNeeds) {
      payments[fromUser][toUser] = toUserNeeds;
      simpleLedger[fromUser] += toUserNeeds;
      simpleLedger[toUser] -= toUserNeeds;
    } else {
      payments[fromUser][toUser] = fromUserOwes;
      simpleLedger[fromUser] += fromUserOwes;
      simpleLedger[toUser] -= fromUserOwes;
    }
  }
  return payments;
}


// // should return {"b": {"a": 30}}
// console.log(getPaymentDetails(
//   {
//     "a": { "userId": "a", "balance": 30},
//     "b": { "userId": "b", "balance": -30}
//   }
// ));


// // should return {"b": {"a": 30, "c": 20}}
// console.log(getPaymentDetails(
//   {
//     "a": { "userId": "a", "balance": 30},
//     "b": { "userId": "b", "balance": 20},
//     "c": { "userId": "c", "balance": -50}
//   }
// ));


// // should return {"b": {"a": 20}, "c": {"a": 30}}
// console.log(getPaymentDetails(
//   {
//     "a": { "userId": "a", "balance": 50},
//     "b": { "userId": "b", "balance": -20},
//     "c": { "userId": "c", "balance": -30}
//   }
// ));


// // should return {c: {a: 40}, b: {d: 10, a: 10}}
// console.log(getPaymentDetails(
//   {
//     "a": { "userId": "a", "balance": 50},
//     "b": { "userId": "b", "balance": -20},
//     "c": { "userId": "c", "balance": -40},
//     "d": { "userId": "d", "balance": 10},
//   }
// ));

module.exports = {
  APP_SECRET,
  getUserId,
  getTransactions,
  getTripBalance,
  getPaymentDetails,
}
