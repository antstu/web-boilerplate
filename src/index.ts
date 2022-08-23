import "reflect-metadata";

import { MikroORM } from "@mikro-orm/core";

import { ApolloServer } from "apollo-server-express";
import express from "express";
import mikroOrmConfig from "./mikro-orm.config";

import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import * as redis from "redis";

import session from "express-session";
import { __prod__ } from "./constants";
import { MyContext } from "./types";

const main = async () => {
  // connects to db
  const orm = await MikroORM.init(mikroOrmConfig);
  //   runns migration
  await orm.getMigrator().up();

  const app = express();

  let RedisStore = require("connect-redis")(session);
  let redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
        // disableTTL: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: __prod__, //cookie only works in https
        sameSite: "lax", // csrf
      },
      saveUninitialized: false,
      secret: "keyboard cat",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em.fork(), req, res }),
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
