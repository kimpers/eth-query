const express = require("express");
const { ApolloServer } = require("apollo-server-express");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const port = process.env.PORT || 3000;

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port }, () =>
  console.log(`Server up at http://localhost:${port}${server.graphqlPath}`)
);
