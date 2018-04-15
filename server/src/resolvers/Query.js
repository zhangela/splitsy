const moment = require('moment');
const { getTransactions } = require('../utils');

async function trip(parent, { tripId }, ctx, info) {
  const trip = await ctx.db.query.trip({
    where: { id: tripId }
  }, info);
  return trip;
}

async function transactions(parent, { userId }, ctx, info) {
  startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  endDate = moment().format('YYYY-MM-DD');

  return getTransactions(ctx, userId,
    startDate,
    endDate,
    { accountIds: null, count: 250, offset: 0 });
}

async function connectedItem(parent, { userId }, ctx, info) {
  const userItems = await ctx.db.query.items({
    where: { user: { id: userId } }
  }); // TODO: why can't we pass in info here

  if (!userItems || userItems.length === 0) {
    return;
  }

  // TODO: for now, assume each user only has 1 item.
  const accessToken = userItems[0].accessToken;

  const itemData = await ctx.plaidClient.getItem(accessToken);

  // This is pretty hacky, but basically, PlaidItem.plaidTransactions
  // needs the userId to get the accessToken, but accessToken isn't
  // a field in PlaidItem, so we add the field userId to ret.
  const ret = itemData.item;
  ret.userId = userId;

  return ret;
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

  //  TODO: for now, assume each user is only in 1 active trip.
  const trip = trips[0];
  return trip;
}

async function availableUsers(parent, { userId }, ctx, info) {
  const users = await ctx.db.query.users();
  return users;
}

module.exports = {
  trip,
  transactions,
  connectedItem,
  currentTrip,
  availableUsers,
}
