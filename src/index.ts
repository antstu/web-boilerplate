import { MikroORM } from "@mikro-orm/core";

import { ApolloServer } from "apollo-server-express";
import express from "express";
import mikroOrmConfig from "./mikro-orm.config";

import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
  // connects to db
  const orm = await MikroORM.init(mikroOrmConfig);
  //   runns migration
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((error) => {
  console.log(error);
});
