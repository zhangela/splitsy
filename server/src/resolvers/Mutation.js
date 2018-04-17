const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId, getTripBalance } = require('../utils');

async function signup(parent, args, ctx, info) {
  const password = await bcrypt.hash(args.password, 10)
  const user = await ctx.db.mutation.createUser({
    data: { ...args, password },
  })

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}

async function login(parent, args, ctx, info) {
  const user = await ctx.db.query.user({ where: { email: args.email } })
  if (!user) {
    throw new Error('No such user found')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  return {
    token: jwt.sign({ userId: user.id }, APP_SECRET),
    user,
  }
}

async function storeAccessToken(
  parent,
  { publicToken, userId },
  ctx,
  info
) {

  const exchangeTokenRes = await ctx.plaidClient.exchangePublicToken(
    publicToken
  );

  // The access_token can be used to make API calls to
  // retrieve product data - store access_token and item_id
  // in a persistent datastore
  const accessToken = exchangeTokenRes.access_token;
  const itemId = exchangeTokenRes.item_id;

  // TODO: if this line fails, we should return false instead of true.
  ctx.db.mutation.createItem(
    {
      data: {
        itemId: itemId,
        accessToken: accessToken,
        user: { connect: { id: userId } },
      }
    }
  );

  return true;
}

async function createTrip(
  parent,
  { name, userIds },
  ctx,
  info
) {

  const trip = await ctx.db.mutation.createTrip(
    {
      data: {
        name: name,
        settled: false,
        usersReadyToSettle: [],
        transactions: [],
        users: {
          connect: userIds.map((userId) => {
            return { id: userId };
          })
        },
      }
    }
  );
  return trip;
}

async function addTransactionToTrip(
  parent,
  { tripId, plaidTransactionId, category, name, amount, date },
  ctx,
  info
) {

  const currentUserId = getUserId(ctx);

  // first check if this trip already has a trip transaction in this trip for
  // this plaid transaction
  // TODO: add this!!

  // first make a TripTransaction
  const tripTransaction = await ctx.db.mutation.createTripTransaction({
    data: {
      plaidTransactionId: plaidTransactionId,
      name: name,
      amount: amount,
      date: date,
      category: { set: category },
      user: { connect: { id: currentUserId } },
      trip: { connect: { id: tripId } },
    }
  }, info);

  // then insert TripTransaction to Trip
  const trip = await ctx.db.mutation.updateTrip({
    data: {
      transactions: {
        connect: {
          id: tripTransaction.id
        }
      }
    },
    where: {
      id: tripId
    },
  }, info);

  return tripTransaction;
}

async function removeTransactionFromTrip(
  parent,
  { tripId, plaidTransactionId },
  ctx,
  info
) {

  const tripTransactions = await ctx.db.query.tripTransactions({
    where: {
      AND: [
        { plaidTransactionId: plaidTransactionId },
        { trip:  { id: tripId } }
      ]
    }
  });

  // this plaid transaction isn't in the trip
  // TODO: throw error if tripTransactions.length > 1
  if (!tripTransactions || tripTransactions.length === 0) {
    return false;
  }

  const tripTransaction = tripTransactions[0];
  const trip = await ctx.db.mutation.updateTrip({
    data: {
      transactions: {
        delete: {
          id: tripTransaction.id
        }
      }
    },
    where: {
      id: tripId
    },
  });

  return true;
}

async function addReadyToSettleUser(parent, { tripId, userId }, ctx, info) {
  await ctx.db.mutation.updateTrip({
    data: {
      readyToSettleUsers: {
        connect: { id: userId }
      }
    },
    where: {
      id: tripId
    }
  });

  // TODO: return false if this add fails
  return true;
}

async function settleTrip(parent, { tripId }, ctx, info) {

  // since this is a mutation, not a query, we need to manually pass in the
  // `info` field that we want.
  const trip = await ctx.db.query.trip({
      where: { id: tripId }
    },`
    {
      users {
        id
      }
      readyToSettleUsers {
        id
      }
      transactions {
        amount
        user {
          id
        }
      }
    }`);

  console.log("trip", trip);
  const { transactions, users } = trip;
  const ledger = getTripBalance(transactions, users);
  console.log("ledger", ledger);

  // TODO: assert that everyone has clicked "ready"
  // TODO: pay!!!

  await ctx.db.mutation.updateTrip({
    data: { settled: true },
    where: { id: tripId }
  });

  // TODO: return false if this add fails
  return true;
}


module.exports = {
  signup,
  login,
  storeAccessToken,
  createTrip,
  addTransactionToTrip,
  removeTransactionFromTrip,
  addReadyToSettleUser,
  settleTrip,
}
