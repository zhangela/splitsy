const moment = require('moment');

async function transactions(parent, { userId }, ctx, info) {
  // Pull transactions for the Item for the last 30 days
  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');

  const userItems = await ctx.db.query.items({
    where: { user: { id: userId } }
  });

  if (!userItems || userItems.length === 0) {
    return;
  }

  // TODO: for now, assume each user only has 1 item.
  const accessToken = userItems[0].accessToken;

  const transactionsData = await ctx.plaidClient.getTransactions(
    accessToken,
    startDate,
    endDate,
    {
      count: 250,
      offset: 0,
    }
  );
  return transactionsData.transactions;
}

async function connectedItem(parent, { userId }, ctx, info) {
  const userItems = await ctx.db.query.items({
    where: { user: { id: userId } }
  });

  if (!userItems || userItems.length === 0) {
    return;
  }

  // TODO: for now, assume each user only has 1 item.
  const accessToken = userItems[0].accessToken;


  const itemData = await ctx.plaidClient.getItem(accessToken);
  return itemData.item;
}

async function currentTrip(parent, { userId }, ctx, info) {
  const trips = await ctx.db.query.trips({
    where: {
      AND: {
        users_some: { id: userId },
        settled: false
      }
    }
  }, info); // the `info` param is very important, otherwise, nested fields would not show up :(

  if (!trips || trips.length === 0) {
    return;
  }

  // TODO: for now, assume each user is only in 1 active trip.
  const trip = trips[0];
  return trip;
}

async function availableUsers(parent, { userId }, ctx, info) {
  const users = await ctx.db.query.users();
  return users;
}

module.exports = {
  transactions,
  connectedItem,
  currentTrip,
  availableUsers,
}
