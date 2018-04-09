const moment = require('moment');

async function feed(parent, args, ctx, info) {
  const { filter, first, skip } = args // destructure input arguments
  const where = filter
    ? { OR: [{ url_contains: filter }, { description_contains: filter }] }
    : {}

  const allLinks = await ctx.db.query.links({})
  const count = allLinks.length

  const queriedLinkes = await ctx.db.query.links({ first, skip, where })

  return {
    linkIds: queriedLinkes.map(link => link.id),
    count
  }
}


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

  const transactions = await ctx.plaidClient.getTransactions(
    accessToken,
    startDate,
    endDate,
    {
      count: 250,
      offset: 0,
    }
  );
  return transactions.transactions;
}


module.exports = {
  feed,
  transactions,
}
