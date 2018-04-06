const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const Subscription = require('./resolvers/Subscription')
const Feed = require('./resolvers/Feed')


const plaid = require('plaid');
const envvar = require('envvar');

const APP_PORT = envvar.number('APP_PORT', 8000);
const PLAID_CLIENT_ID = envvar.string('PLAID_CLIENT_ID');
const PLAID_SECRET = envvar.string('PLAID_SECRET');
const PLAID_PUBLIC_KEY = envvar.string('PLAID_PUBLIC_KEY');
const PLAID_ENV = envvar.string('PLAID_ENV', 'sandbox');

// We store the access_token in memory - in production, store it in a secure
// persistent data store
const ACCESS_TOKEN = null;
const PUBLIC_TOKEN = null;
const ITEM_ID = null;

// Initialize the Plaid client
const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV]
);


const resolvers = {
  Query,
  Mutation,
  Subscription,
  Feed,
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'https://us1.prisma.sh/public-calicohound-798/hackernews-graphql-js/dev',
      secret: 'mysecret123',
    }),
  }),
});


server.start(() => console.log('Server is running on http://localhost:4000'));
