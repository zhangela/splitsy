const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

function post(parent, { url, description }, ctx, info) {
  const userId = getUserId(ctx);
  return ctx.db.mutation.createLink(
    {
      data: {
        url,
        description,
        postedBy: {
          connect: {
            id: userId
          }
        }
      }
    }, info)
}

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

async function vote(parent, args, ctx, info) {
  const { linkId } = args
  const userId = getUserId(ctx)
  const linkExists = await ctx.db.exists.Vote({
    user: { id: userId },
    link: { id: linkId },
  })
  if (linkExists) {
    throw new Error(`Already voted for link: ${linkId}`)
  }

  return ctx.db.mutation.createVote(
    {
      data: {
        user: { connect: { id: userId } },
        link: { connect: { id: linkId } },
      },
    },
    info,
  )
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


module.exports = {
  post,
  signup,
  login,
  vote,
  storeAccessToken,
  createTrip,
}
