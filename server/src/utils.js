const jwt = require('jsonwebtoken');
const moment = require('moment');
const APP_SECRET = 'GraphQL-is-aw3some';

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

module.exports = {
  APP_SECRET,
  getUserId,
  getTransactions,
}
