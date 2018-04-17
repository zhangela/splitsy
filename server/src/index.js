const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const plaid = require('plaid');
const envvar = require('envvar');

const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const PlaidItem = require('./resolvers/PlaidItem');
const Trip = require('./resolvers/Trip');

const resolvers = {
  Query,
  Mutation,
  PlaidItem,
  Trip,
};

const plaidClient = initPlaidClient();

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    plaidClient,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'https://eu1.prisma.sh/public-foulsinger-716/splitsy/dev',
      secret: 'ILoveSplitsy',
    }),
  }),
});


server.start(() => console.log('Server is running on http://localhost:4000'));

function initPlaidClient() {
  const APP_PORT = envvar.number('APP_PORT', 8000);
  const PLAID_CLIENT_ID = envvar.string('PLAID_CLIENT_ID');
  const PLAID_SECRET = envvar.string('PLAID_SECRET');
  const PLAID_PUBLIC_KEY = envvar.string('PLAID_PUBLIC_KEY');
  const PLAID_ENV = envvar.string('PLAID_ENV', 'sandbox');

  const plaidClient = new plaid.Client(
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    PLAID_PUBLIC_KEY,
    plaid.environments[PLAID_ENV]
  );

  return plaidClient;
}
